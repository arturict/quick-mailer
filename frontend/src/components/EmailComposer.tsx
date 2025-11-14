import { useState, useEffect } from 'react';
import { emailApi, SendEmailRequest, AttachmentData } from '../api';
import { FileUpload } from './FileUpload';

interface EmailComposerProps {
  onEmailSent?: () => void;
}

export function EmailComposer({ onEmailSent }: EmailComposerProps) {
  const [fromAddresses, setFromAddresses] = useState<string[]>([]);
  const [formData, setFormData] = useState<SendEmailRequest>({
    from: '',
    to: '',
    subject: '',
    text: '',
    html: '',
    attachments: [],
  });
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const addresses = (import.meta.env.VITE_FROM_ADDRESSES || 'noreply@example.com').split(',');
    setFromAddresses(addresses);
    if (addresses.length > 0) {
      setFormData(prev => ({ ...prev, from: addresses[0] }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSending(true);

    try {
      const result = await emailApi.sendEmail(formData);
      setSuccess(`Email sent successfully! ID: ${result.id}`);
      setFormData({
        from: formData.from,
        to: '',
        subject: '',
        text: '',
        html: '',
        attachments: [],
      });
      onEmailSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleFilesChange = (files: AttachmentData[]) => {
    setFormData({ ...formData, attachments: files });
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">📧 Compose Email</h2>
        
        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">From</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
            >
              {fromAddresses.map(addr => (
                <option key={addr} value={addr}>{addr}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">To</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Email subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message</span>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">HTML Mode</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={isHtmlMode}
                    onChange={(e) => setIsHtmlMode(e.target.checked)}
                  />
                </label>
              </div>
            </label>
            <textarea
              className="textarea textarea-bordered h-40"
              placeholder={isHtmlMode ? '<p>HTML content</p>' : 'Plain text message'}
              value={isHtmlMode ? formData.html : formData.text}
              onChange={(e) => setFormData({ 
                ...formData, 
                [isHtmlMode ? 'html' : 'text']: e.target.value 
              })}
              required
            />
          </div>

          <FileUpload onFilesChange={handleFilesChange} />

          <div className="card-actions justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Sending...
                </>
              ) : (
                '📤 Send Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
