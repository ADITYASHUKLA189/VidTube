import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import Button from './Button';
import Spinner from './Spinner';
import { deleteComment, updateComment, getCommentReplies, addReply } from '../api/commentApi';
import { toggleCommentLike } from '../api/likeApi';
import { normalizeApiError } from '../api/normalize';

const resolveCommentList = (payload) => {
  if (Array.isArray(payload)) return payload;
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

export default function CommentItem({ comment: initialComment, currentUser, videoId, onDelete }) {
  const [comment, setComment] = useState(initialComment);
  const [isLiked, setIsLiked] = useState(initialComment?.isLiked || false);
  const [likesCount, setLikesCount] = useState(initialComment?.likesCount || 0);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(initialComment.content);
  const [savingEdit, setSavingEdit] = useState(false);

  // Reply states
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  // Nested replies states
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [localRepliesCount, setLocalRepliesCount] = useState(initialComment.repliesCount || 0);

  const owner = comment.owner || {};
  const isOwnComment = currentUser && (owner._id === currentUser._id || owner === currentUser._id);

  const handleLike = async () => {
    if (!currentUser) return toast.error('Please log in to like comments');
    try {
      await toggleCommentLike(comment._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => prev + (isLiked ? -1 : 1));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await updateComment(comment._id, { content: editingContent.trim() });
      setComment(prev => ({ ...prev, content: editingContent.trim() }));
      setIsEditing(false);
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      toast.success('Comment deleted successfully');
      if (onDelete) onDelete(comment._id);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const data = await getCommentReplies(comment._id);
      setReplies(resolveCommentList(data));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      void fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      await addReply(comment._id, { content: replyContent.trim() });
      setReplyContent('');
      setIsReplying(false);
      toast.success('Reply added successfully');
      setLocalRepliesCount(prev => prev + 1);
      setShowReplies(true);
      await fetchReplies();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <article className="flex gap-4 items-start text-sm group/comment">
      <Link to={`/channel/${owner.username || ''}`} className="shrink-0">
        <Avatar src={owner.avatar} alt={owner.fullname || owner.username} size="sm" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <Link to={`/channel/${owner.username || ''}`} className="font-bold hover:text-blue-500 transition text-yt-text-light dark:text-yt-text-dark">
            {owner.fullname || owner.username || 'Anonymous'}
          </Link>
          <span className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Edit Mode vs Normal Text */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full bg-transparent text-sm text-yt-text-light dark:text-yt-text-dark outline-none border-b border-yt-border-light dark:border-yt-border-dark py-1 focus:border-yt-text-light dark:focus:border-yt-text-dark transition"
              rows={2}
              required
              disabled={savingEdit}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingContent(comment.content); }}
                className="rounded-full hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark px-3 py-1.5 text-xs font-bold transition"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <Button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editingContent.trim()}
                className="rounded-full px-4 py-1.5 text-xs font-bold"
              >
                {savingEdit ? <Spinner className="h-3.5 w-3.5" /> : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-yt-text-light/90 dark:text-yt-text-dark/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Footer Actions (Likes/Replies) */}
        {!isEditing && (
          <div className="mt-2 flex items-center gap-4 text-xs select-none">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 hover:text-yt-text-light dark:hover:text-yt-text-dark transition ${
                isLiked ? 'text-blue-500' : 'text-yt-text-secondary-light dark:text-yt-text-secondary-dark'
              }`}
              title="Like comment"
            >
              <svg className="h-3.5 w-3.5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
              <span>{likesCount}</span>
            </button>
            <button
              onClick={() => {
                if(!currentUser) return toast.error('Please log in to reply');
                setIsReplying(!isReplying);
              }}
              className="text-yt-text-secondary-light dark:text-yt-text-secondary-dark font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full px-2 py-1 transition"
            >
              Reply
            </button>
            {isOwnComment && (
              <div className="flex items-center gap-3 ml-auto opacity-0 group-hover/comment:opacity-100 transition">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-blue-500 transition font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-[11px] text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-red-500 transition font-semibold"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reply Input Box */}
        {isReplying && (
          <form onSubmit={handleSubmitReply} className="flex gap-4 items-start mt-3">
            <Avatar src={currentUser?.avatar} size="xs" className="mt-1" />
            <div className="flex-1 space-y-2">
              <textarea
                placeholder="Add a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-transparent text-sm text-yt-text-light dark:text-yt-text-dark outline-none border-b border-yt-border-light dark:border-yt-border-dark py-1 focus:border-yt-text-light dark:focus:border-yt-text-dark transition"
                rows={1}
                required
                autoFocus
                disabled={submittingReply}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsReplying(false); setReplyContent(''); }}
                  className="rounded-full hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark px-3 py-1.5 text-xs font-bold transition"
                  disabled={submittingReply}
                >
                  Cancel
                </button>
                <Button 
                  type="submit" 
                  disabled={submittingReply || !replyContent.trim()} 
                  className="rounded-full px-4 py-1.5 text-xs font-bold"
                >
                  {submittingReply ? <Spinner className="h-3 w-3" /> : 'Reply'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Replies Toggle */}
        {localRepliesCount > 0 && (
          <div className="mt-2">
            <button
              onClick={toggleReplies}
              className="flex items-center gap-2 text-blue-500 hover:bg-blue-500/10 rounded-full px-3 py-1.5 text-sm font-semibold transition"
            >
              <svg className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
              {localRepliesCount} {localRepliesCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>
        )}

        {/* Nested Replies List */}
        {showReplies && (
          <div className="mt-4 space-y-4">
            {loadingReplies ? (
              <div className="flex justify-center py-2"><Spinner /></div>
            ) : (
              replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUser={currentUser}
                  videoId={videoId}
                  onDelete={(id) => {
                    setReplies(replies.filter(r => r._id !== id));
                    setLocalRepliesCount(prev => Math.max(0, prev - 1));
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </article>
  );
}
