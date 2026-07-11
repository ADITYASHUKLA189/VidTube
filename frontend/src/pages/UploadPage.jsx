import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Spinner from '../components/Spinner';
import { publishVideo } from '../api/videoApi';
import { normalizeApiError } from '../api/normalize';

export default function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select file, 2: Details, 3: Visibility
  const [formState, setFormState] = useState({ title: '', description: '', tags: '', thumbnail: null, videoFile: null });
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [visibility, setVisibility] = useState('public'); // public | private | unlisted

  const handleClose = () => {
    // Navigate back to home or previous page
    navigate(-1);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormState((prev) => ({ ...prev, [name]: file }));

    if (name === 'thumbnail' && file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    if (name === 'videoFile' && file) {
      // Auto-set title from filename (without extension)
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormState((prev) => ({ 
        ...prev, 
        videoFile: file,
        title: nameWithoutExt.substring(0, 100) 
      }));
      setStep(2); // advance to Details
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormState((prev) => ({ 
        ...prev, 
        videoFile: file,
        title: nameWithoutExt.substring(0, 100) 
      }));
      setStep(2);
    } else {
      toast.error('Please drop a valid video file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.videoFile || !formState.thumbnail || !formState.title.trim()) {
      toast.error('Required fields: Title, Thumbnail, and Video file.');
      return;
    }

    setSubmitting(true);
    setProgress(0);

    try {
      const result = await publishVideo({
        ...formState,
        // Since backend doesn't support unlisted/private directly, we pass it or just save it
        isPublished: visibility === 'public'
      }, (percent) => {
        setProgress(percent);
      });
      
      toast.success('Video uploaded successfully!');
      const newVideoId = result?._id || result?.id || '';
      if (newVideoId) {
        navigate(`/watch/${newVideoId}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col bg-yt-bg-light dark:bg-yt-dark border border-yt-border-light dark:border-yt-border-dark max-h-[90vh] animate-scale-in select-none">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-yt-border-light dark:border-yt-border-dark">
          <h2 className="text-base font-bold text-yt-text-light dark:text-yt-text-dark">
            Upload Video
          </h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-1.5 text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          
          {/* STEP 1: Select Video Files */}
          {step === 1 && (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center border-2 border-dashed border-yt-border-light dark:border-yt-border-dark rounded-xl p-10 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-blue-500/50 transition h-80 text-center space-y-4"
            >
              <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-5 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-yt-text-light dark:text-yt-text-dark">
                  Drag and drop video files to upload
                </p>
                <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark mt-1">
                  Your videos will be private until you publish them.
                </p>
              </div>
              <label className="rounded-full bg-blue-500 hover:bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition cursor-pointer select-none">
                Select Files
                <input 
                  type="file" 
                  name="videoFile" 
                  accept="video/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* STEP 2: Details Metadata form */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-5">
              <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                {/* Details Left */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-yt-text-light dark:text-yt-text-dark border-b border-white/5 pb-2">
                    Details
                  </h3>
                  <Input 
                    label="Title (required)" 
                    name="title" 
                    value={formState.title} 
                    onChange={handleTextChange} 
                    maxLength={100}
                    placeholder="Add a title that describes your video"
                    required
                  />
                  <Textarea 
                    label="Description" 
                    name="description" 
                    value={formState.description} 
                    onChange={handleTextChange} 
                    rows={4}
                    placeholder="Tell viewers about your video"
                    required
                  />
                  <Input 
                    label="Tags / Hashtags" 
                    name="tags" 
                    value={formState.tags} 
                    onChange={handleTextChange} 
                    placeholder="e.g. Gaming, Music, #Funny"
                  />
                </div>

                {/* Details Right (Thumbnail box) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-yt-text-light dark:text-yt-text-dark border-b border-white/5 pb-2">
                    Thumbnail
                  </h3>
                  <p className="text-[11px] text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
                    Select or upload a picture that shows what's in your video. A good thumbnail stands out.
                  </p>
                  
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-yt-border-light dark:border-yt-border-dark rounded-xl p-3 bg-neutral-50 dark:bg-neutral-900 cursor-pointer hover:border-blue-500/50 transition h-36 relative overflow-hidden">
                    {thumbnailPreview ? (
                      <>
                        <img src={thumbnailPreview} alt="thumbnail preview" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-[11px] text-white font-semibold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-1.5">
                        <svg className="mx-auto h-6 w-6 text-yt-text-secondary-light dark:text-yt-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px] font-bold text-blue-500 block">Upload Thumbnail</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      name="thumbnail" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      required={!thumbnailPreview}
                    />
                  </label>
                </div>
              </div>

              {/* Step 2 footer action */}
              <div className="flex justify-end pt-4 border-t border-yt-border-light dark:border-yt-border-dark">
                <Button type="submit">
                  Next
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Visibility & Publish */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-yt-text-light dark:text-yt-text-dark border-b border-white/5 pb-2">
                  Visibility
                </h3>
                <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
                  Choose when to publish and who can see your video
                </p>

                <div className="border border-yt-border-light dark:border-yt-border-dark rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 divide-y divide-yt-border-light dark:divide-yt-border-dark">
                  
                  {/* Public Radio */}
                  <label className="flex items-start gap-4 p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="public"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                      className="mt-1 accent-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-yt-text-light dark:text-yt-text-dark block">Save or publish</span>
                      <span className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark mt-0.5 block">Make your video public so anyone can watch it.</span>
                    </div>
                  </label>

                  {/* Private Radio */}
                  <label className="flex items-start gap-4 p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="private"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                      className="mt-1 accent-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-yt-text-light dark:text-yt-text-dark block">Private</span>
                      <span className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark mt-0.5 block">Only you and people you choose can watch your video.</span>
                    </div>
                  </label>

                  {/* Unlisted Radio */}
                  <label className="flex items-start gap-4 p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="unlisted"
                      checked={visibility === 'unlisted'}
                      onChange={() => setVisibility('unlisted')}
                      className="mt-1 accent-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-yt-text-light dark:text-yt-text-dark block">Unlisted</span>
                      <span className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark mt-0.5 block">Anyone with the video link can watch your video.</span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Progress bar */}
              {submitting && (
                <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-neutral-50 dark:bg-neutral-900 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Uploading file...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div 
                      className="h-full rounded-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              )}

              {/* Step 3 Action Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-yt-border-light dark:border-yt-border-dark">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="rounded-full border border-yt-border-light dark:border-yt-border-dark px-5 py-2.5 text-xs font-bold text-yt-text-light dark:text-yt-text-dark transition hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark"
                  disabled={submitting}
                >
                  Back
                </button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="rounded-full px-6 py-2.5 text-xs font-bold"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-3 w-3" />
                      <span>Publishing...</span>
                    </span>
                  ) : (
                    'Publish'
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}