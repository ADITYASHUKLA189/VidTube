import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { toggleSubscription } from '../api/subscriptionApi';
import { normalizeApiError } from '../api/normalize';
import Spinner from './Spinner';

export default function SubscribeButton({ channelId, initialSubscribed = false, onToggle, className = '', disabled = false }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSubscribed(initialSubscribed);
  }, [initialSubscribed]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || disabled) return;

    setLoading(true);
    try {
      await toggleSubscription(channelId);
      const nextState = !subscribed;
      setSubscribed(nextState);
      if (onToggle) onToggle(nextState);
      toast.success(nextState ? 'Subscribed to channel' : 'Unsubscribed from channel');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || disabled}
      className={`relative flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
        subscribed
          ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700'
          : 'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200'
      } ${className}`}
    >
      {loading && <Spinner className="absolute w-4 h-4 text-current opacity-70" />}
      
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {subscribed && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        )}
        
        {subscribed ? 'Subscribed' : 'Subscribe'}
        
        {subscribed && (
          <svg className="w-4 h-4 ml-0.5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </span>
    </button>
  );
}
