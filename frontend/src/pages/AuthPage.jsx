import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import { signIn, signUp, googleSignIn } from '../features/auth/authSlice';
import { normalizeApiError } from '../api/normalize';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';

  const [formState, setFormState] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    avatar: null,
    coverImage: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    const file = files?.[0] || null;
    
    setFormState((current) => ({ ...current, [name]: file ?? value }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'avatar') setAvatarPreview(reader.result);
        if (name === 'coverImage') setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleSignIn(credentialResponse.credential)).unwrap();
      toast.success('Signed in with Google successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(normalized.message || 'Google Authentication failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed or was cancelled');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isRegister) {
      if (!formState.fullname.trim()) {
        toast.error('Full name is required');
        return;
      }
      if (!formState.email.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!formState.username.trim()) {
        toast.error('Username is required');
        return;
      }
      if (formState.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (!formState.avatar) {
        toast.error('Avatar image is required');
        return;
      }
    } else {
      if (!formState.email.trim() && !formState.username.trim()) {
        toast.error('Please enter either email or username');
        return;
      }
      if (!formState.password) {
        toast.error('Password is required');
        return;
      }
    }

    try {
      if (isRegister) {
        await dispatch(signUp(formState)).unwrap();
        toast.success('Channel created successfully! Logging you in...');
        
        // Auto sign-in after registration
        const loginPayload = {
          username: formState.username.trim(),
          password: formState.password
        };
        await dispatch(signIn(loginPayload)).unwrap();
        toast.success('Signed in successfully!');
      } else {
        const loginPayload = {
          password: formState.password
        };
        if (formState.email.trim()) {
          loginPayload.email = formState.email.trim();
        }
        if (formState.username.trim()) {
          loginPayload.username = formState.username.trim();
        }
        await dispatch(signIn(loginPayload)).unwrap();
        toast.success('Signed in successfully!');
      }

      navigate(from, { replace: true });
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(normalized.message || 'Authentication failed');
    }
  };

  return (
    <div className="mx-auto max-w-md my-10 select-none">
      <div className="rounded-2xl p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-900 border border-yt-border-light dark:border-yt-border-dark shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-yt-red text-4xl font-black">▶</div>
          <h1 className="text-2xl font-extrabold text-yt-text-light dark:text-yt-text-dark">
            {isRegister ? 'Create your channel' : 'Sign in to VidTube'}
          </h1>
          <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
            {isRegister ? 'Enter details to customize your creator profile' : 'Welcome back! Your sessions are stored securely'}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {isRegister && (
            <Input 
              label="Full Name" 
              name="fullname" 
              value={formState.fullname} 
              onChange={handleChange} 
              placeholder="e.g. John Doe"
              required 
            />
          )}

          <Input 
            label="Email Address" 
            type="email" 
            name="email" 
            value={formState.email} 
            onChange={handleChange} 
            placeholder="e.g. name@example.com"
            required={isRegister}
          />

          <Input 
            label={isRegister ? "Username" : "Username (or enter email above)"} 
            name="username" 
            value={formState.username} 
            onChange={handleChange} 
            placeholder="e.g. messi"
            required={isRegister}
          />

          <div className="space-y-1">
            <Input 
              label="Password" 
              type="password" 
              name="password" 
              value={formState.password} 
              onChange={handleChange} 
              placeholder="Min 6 characters"
              required 
            />
            {isRegister && (
              <span className="text-[10px] text-yt-text-secondary-light dark:text-yt-text-secondary-dark block">
                Must contain at least 6 characters
              </span>
            )}
          </div>

          {isRegister && (
            <div className="grid gap-4 grid-cols-2 border-t border-yt-border-light dark:border-yt-border-dark pt-4">
              
              {/* Avatar upload preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-yt-text-secondary-light dark:text-yt-text-secondary-dark block">
                  Avatar *
                </span>
                <label className="flex flex-col items-center justify-center border border-dashed border-yt-border-light dark:border-yt-border-dark rounded-xl h-24 cursor-pointer hover:border-blue-500/50 bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-blue-500 text-center px-1">Upload Photo</span>
                  )}
                  <input type="file" name="avatar" accept="image/*" onChange={handleChange} className="hidden" required />
                </label>
              </div>

              {/* Cover upload preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-yt-text-secondary-light dark:text-yt-text-secondary-dark block">
                  Banner (optional)
                </span>
                <label className="flex flex-col items-center justify-center border border-dashed border-yt-border-light dark:border-yt-border-dark rounded-xl h-24 cursor-pointer hover:border-blue-500/50 bg-neutral-100 dark:bg-neutral-850 overflow-hidden relative">
                  {coverPreview ? (
                    <img src={coverPreview} alt="cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-blue-500 text-center px-1">Upload Banner</span>
                  )}
                  <input type="file" name="coverImage" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
              </div>

            </div>
          )}

          <Button 
            type="submit" 
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl mt-4" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Processing...</span>
              </span>
            ) : isRegister ? (
              'Register'
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-yt-border-light dark:border-yt-border-dark"></div>
            <span className="flex-shrink-0 mx-4 text-yt-text-secondary-light dark:text-yt-text-secondary-dark text-xs uppercase tracking-widest font-bold">Or</span>
            <div className="flex-grow border-t border-yt-border-light dark:border-yt-border-dark"></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>
        </form>

        {/* Footer switch page links */}
        <div className="text-center pt-2 text-xs border-t border-yt-border-light dark:border-yt-border-dark">
          {isRegister ? (
            <p className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
              Already have an account?{' '}
              <button 
                type="button" 
                className="text-blue-500 font-bold hover:underline" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
              New to VidTube?{' '}
              <button 
                type="button" 
                className="text-blue-500 font-bold hover:underline" 
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}