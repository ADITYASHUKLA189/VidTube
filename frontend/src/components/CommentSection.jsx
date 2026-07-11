import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from './Button';
import Textarea from './Textarea';
import Spinner from './Spinner';
import Avatar from './Avatar';
import CommentItem from './CommentItem';
import { addComment, getVideoComments } from '../api/commentApi';
import { normalizeApiError } from '../api/normalize';

const resolveCommentList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload?.docs || payload?.comments || payload?.data || [];
};

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CommentSection({ videoId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getVideoComments(videoId);
      setComments(resolveCommentList(data));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [videoId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addComment(videoId, { content: content.trim() });
      setContent('');
      setIsFocused(false);
      toast.success('Comment added successfully');
      await loadComments();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (deletedId) => {
    setComments(prev => prev.filter(c => c._id !== deletedId));
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Comment header count */}
      <div className="flex items-center gap-8 mb-4">
        <h3 className="text-xl font-bold text-yt-text-light dark:text-white">
          {Number(comments.length).toLocaleString()} Comments
        </h3>
        <div className="flex items-center gap-2 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition">
          <svg className="h-5 w-5 text-yt-text-light dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h11.5M3.75 17.25h6" />
          </svg>
          <span className="text-sm font-semibold text-yt-text-light dark:text-white">Sort by</span>
        </div>
      </div>

      {/* 2. YouTube-style focused comment input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start">
          <Avatar src={currentUser.avatar} alt={currentUser.fullname || currentUser.username} size="sm" className="mt-1" />
          
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="Add a comment..."
              value={content}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-sm text-yt-text-light dark:text-yt-text-dark outline-none border-b border-yt-border-light dark:border-yt-border-dark py-1 placeholder:text-yt-text-secondary-light dark:placeholder:text-yt-text-secondary-dark focus:border-yt-text-light dark:focus:border-yt-text-dark transition"
              rows={isFocused ? 2 : 1}
              required
              disabled={submitting}
            />
            {isFocused && (
              <div className="flex justify-end gap-2.5 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setIsFocused(false);
                  }}
                  className="rounded-full hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark px-4 py-2 text-xs font-bold transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <Button 
                  type="submit" 
                  disabled={submitting || !content.trim()} 
                  className="rounded-full px-5 py-2 text-xs font-bold"
                >
                  {submitting ? <Spinner className="h-3 w-3" /> : 'Comment'}
                </Button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark italic bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
          Please <Link to="/login" className="text-blue-500 font-bold hover:underline">sign in</Link> to add comments to this video feed.
        </p>
      )}

      {/* 3. Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center items-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          {comments.length === 0 ? (
            <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark text-center py-6">
              No comments posted. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                currentUser={currentUser} 
                videoId={videoId} 
                onDelete={handleDeleteComment} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}