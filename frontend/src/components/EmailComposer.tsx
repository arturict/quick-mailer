import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, Mail, User, Paperclip } from 'lucide-react';
import { emailApi, templateApi, SendEmailRequest, AttachmentData, Template } from '../api';
import { showToast } from './ui/Toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { FileUpload } from './FileUpload';

interface EmailComposerProps {
  onEmailSent?: () => void;
}

export function EmailComposer({ onEmailSent }: EmailComposerProps) {
  const [fromAddresses, setFromAddresses] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<SendEmailRequest>({
    from: '',
    to: '',
    subject: '',
    text: '',
    html: '',
    attachments: [],
  });
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const addresses = (import.meta.env.VITE_FROM_ADDRESSES || 'noreply@example.com').split(',');
    setFromAddresses(addresses);
    if (addresses.length > 0) {
      setFormData(prev => ({ ...prev, from: addresses[0] }));
    }

    // Load templates
    templateApi.getTemplates().then(result => {
      setTemplates(result.templates);
    }).catch(err => {
      console.error('Failed to load templates:', err);
      showToast.error('Failed to load templates');
    });
  }, []);

  // Keyboard shortcut for sending email (Ctrl+Enter)
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      callback: () => {
        if (formRef.current && !isSending) {
          formRef.current.requestSubmit();
        }
      },
      description: 'Send email',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const emailRequest: SendEmailRequest = selectedTemplate
        ? {
            from: formData.from,
            to: formData.to,
            subject: '', // Will be filled by template
            templateId: selectedTemplate.id,
            variables: templateVars,
          }
        : formData;

      const result = await emailApi.sendEmail(emailRequest);
      showToast.success(`Email sent successfully! ID: ${result.id}`);
      
      // Reset form
      setFormData({
        from: formData.from,
        to: '',
        subject: '',
        text: '',
        html: '',
        attachments: [],
      });
      setSelectedTemplate(null);
      setTemplateVars({});
      
      onEmailSent?.();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate(null);
      setTemplateVars({});
      return;
    }

    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setSelectedTemplate(template);
      
      // Initialize template variables
      const vars: Record<string, string> = {};
      template.variables?.forEach(v => {
        vars[v] = '';
      });
      setTemplateVars(vars);
      
      // Set HTML mode based on template
      setIsHtmlMode(!!template.body_html);
    }
  };

  const handleFilesChange = (files: AttachmentData[]) => {
    setFormData({ ...formData, attachments: files });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Compose Email
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="form-control"
          >
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <User className="w-4 h-4" />
                From
              </span>
            </label>
            <select 
              className="select select-bordered w-full focus:outline-offset-0 transition-all"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
              aria-label="Select from address"
            >
              {fromAddresses.map(addr => (
                <option key={addr} value={addr}>{addr}</option>
              ))}
            </select>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="form-control"
          >
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Mail className="w-4 h-4" />
                To
              </span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full focus:outline-offset-0 transition-all"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
              aria-label="Recipient email address"
            />
          </motion.div>

          {templates.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="form-control"
            >
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Use Template (Optional)
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:outline-offset-0 transition-all"
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                aria-label="Select email template"
              >
                <option value="">-- Custom Email --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="label">
                <span className="label-text font-medium">Template Variables</span>
              </label>
              {selectedTemplate.variables.map((varName, index) => (
                <motion.div 
                  key={varName} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="form-control"
                >
                  <div className="input-group">
                    <span className="bg-base-300 px-4 flex items-center min-w-[120px] font-medium">
                      {varName}
                    </span>
                    <input
                      type="text"
                      className="input input-bordered flex-1 focus:outline-offset-0"
                      placeholder={`Enter ${varName}...`}
                      value={templateVars[varName] || ''}
                      onChange={(e) => setTemplateVars({ ...templateVars, [varName]: e.target.value })}
                      required
                      aria-label={`Template variable ${varName}`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!selectedTemplate && (
            <>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:outline-offset-0 transition-all"
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  aria-label="Email subject"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="form-control"
              >
                <label className="label">
                  <span className="label-text">Message</span>
                  <div className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <span className="label-text text-sm">HTML Mode</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={isHtmlMode}
                        onChange={(e) => setIsHtmlMode(e.target.checked)}
                        aria-label="Toggle HTML mode"
                      />
                    </label>
                  </div>
                </label>
                <textarea
                  className="textarea textarea-bordered h-40 focus:outline-offset-0 transition-all font-mono text-sm"
                  placeholder={isHtmlMode ? '<p>HTML content</p>' : 'Plain text message'}
                  value={isHtmlMode ? formData.html : formData.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    [isHtmlMode ? 'html' : 'text']: e.target.value
                  })}
                  required
                  aria-label="Email message content"
                />
              </motion.div>
            </>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FileUpload onFilesChange={handleFilesChange} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="card-actions justify-end pt-4"
          >
            <motion.button 
              type="submit" 
              className="btn btn-primary gap-2"
              disabled={isSending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                  <kbd className="kbd kbd-sm ml-2 hidden md:inline-flex">Ctrl+↵</kbd>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
