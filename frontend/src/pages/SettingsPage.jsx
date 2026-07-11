import { useState } from 'react';
import toast from 'react-hot-toast';
import { changeCurrentPassword } from '../api/userApi';
import { normalizeApiError } from '../api/normalize';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    try {
      await changeCurrentPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8 space-y-6">
        <div>
          <span className="inline-flex rounded-full border border-ember-500/30 bg-ember-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-ember-500">
            Account Management
          </span>
          <h1 className="font-display text-2xl font-bold text-white mt-2">
            Channel Settings
          </h1>
          <p className="text-xs sm:text-sm text-sand-100/60 leading-relaxed mt-1">
            Secure your creator profile and manage credentials for your VidTube account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleTextChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />
          
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleTextChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleTextChange}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
            {loading ? <Spinner className="h-4 w-4" /> : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
