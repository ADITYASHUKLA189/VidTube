import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createTweet, getUserTweets, updateTweet, deleteTweet } from '../api/tweetApi';
import { toggleTweetLike } from '../api/likeApi';
import { normalizeApiError } from '../api/normalize';
import Button from './Button';
import Textarea from './Textarea';
import Spinner from './Spinner';
import Avatar from './Avatar';

export default function TweetSection({ userId, isOwnChannel }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit tweet states
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTweets = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserTweets(userId);
      // Backend might return an array directly or inside data/docs
      const tweetList = Array.isArray(data) ? data : data?.tweets || data?.docs || [];
      setTweets(tweetList);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTweets();
  }, [userId]);

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createTweet({ content: newContent });
      setNewContent('');
      toast.success('Tweet published!');
      await fetchTweets();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (tweet) => {
    setEditingTweetId(tweet._id);
    setEditingContent(tweet.content);
  };

  const handleSaveEdit = async (tweetId) => {
    if (!editingContent.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await updateTweet(tweetId, { content: editingContent });
      setEditingTweetId(null);
      setEditingContent('');
      toast.success('Tweet updated!');
      await fetchTweets();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!confirm('Are you sure you want to delete this tweet?')) return;
    try {
      await deleteTweet(tweetId);
      toast.success('Tweet deleted!');
      setTweets(tweets.filter((t) => t._id !== tweetId));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleLikeTweet = async (tweetId) => {
    try {
      await toggleTweetLike(tweetId);
      // Local toggle for quick UI response
      setTweets((prev) =>
        prev.map((t) => {
          if (t._id === tweetId) {
            const isLiked = t.isLiked;
            return {
              ...t,
              isLiked: !isLiked,
              likesCount: (t.likesCount ?? 0) + (isLiked ? -1 : 1),
            };
          }
          return t;
        })
      );
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Tweet Form */}
      {(isOwnChannel || (currentUser && currentUser._id === userId)) && (
        <form onSubmit={handleCreateTweet} className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-white">Create a new Tweet / Post</h3>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !newContent.trim()}>
              {submitting ? <Spinner className="h-4 w-4" /> : 'Post Tweet'}
            </Button>
          </div>
        </form>
      )}

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-sand-100/60 text-sm">
            No tweets posted yet.
          </div>
        ) : (
          tweets.map((tweet) => {
            const owner = tweet.owner || {};
            const isOwnTweet = currentUser && (owner._id === currentUser._id || tweet.owner === currentUser._id);
            const dateStr = tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString() : '';

            return (
              <article key={tweet._id} className="glass-panel rounded-3xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar src={owner.avatar} alt={owner.fullname || owner.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {owner.fullname || 'Creator'}
                      </span>
                      <span className="text-xs text-sand-100/40">
                        @{owner.username || 'creator'}
                      </span>
                      <span className="text-xs text-sand-100/40">•</span>
                      <span className="text-xs text-sand-100/40">{dateStr}</span>
                    </div>

                    {editingTweetId === tweet._id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={2}
                          required
                        />
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="secondary" 
                            onClick={() => setEditingTweetId(null)}
                            disabled={savingEdit}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleSaveEdit(tweet._id)}
                            disabled={savingEdit || !editingContent.trim()}
                          >
                            {savingEdit ? <Spinner className="h-4 w-4" /> : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-sand-100/85 whitespace-pre-wrap">
                        {tweet.content}
                      </p>
                    )}

                    {/* Actions bar */}
                    <div className="mt-3 flex items-center gap-6 border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleLikeTweet(tweet._id)}
                        className={`flex items-center gap-1.5 text-xs transition ${
                          tweet.isLiked ? 'text-ember-500' : 'text-sand-100/55 hover:text-white'
                        }`}
                      >
                        <svg className="h-4 w-4" fill={tweet.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{tweet.likesCount ?? 0}</span>
                      </button>

                      {isOwnTweet && editingTweetId !== tweet._id && (
                        <div className="flex items-center gap-4 ml-auto">
                          <button
                            onClick={() => handleEditInit(tweet)}
                            className="text-xs text-sand-100/55 hover:text-ember-500 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="text-xs text-sand-100/55 hover:text-red-500 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
