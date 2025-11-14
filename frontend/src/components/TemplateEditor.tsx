import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Info } from 'lucide-react';
import { templateApi, Template, CreateTemplateRequest } from '../api';
import { showToast } from './ui/Toast';

interface TemplateEditorProps {
  template: Template | null;
  onClose: () => void;
}

// Extract variables from text using {{variable}} pattern
function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  const variables = new Set<string>();
  for (const match of matches) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}

export function TemplateEditor({ template, onClose }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    text: template?.body_text || '',
    html: template?.body_html || '',
  });
  const [isHtmlMode, setIsHtmlMode] = useState(!!template?.body_html);
  const [isSaving, setIsSaving] = useState(false);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  // Extract variables from current content
  const detectedVariables = extractVariables(
    `${formData.subject} ${isHtmlMode ? formData.html : formData.text}`
  );

  useEffect(() => {
    // Initialize preview vars with empty strings
    const vars: Record<string, string> = {};
    detectedVariables.forEach(v => {
      vars[v] = '';
    });
    setPreviewVars(vars);
  }, [detectedVariables.join(',')]);

  const substituteVariables = (text: string, vars: Record<string, string>) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return vars[varName] || match;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const request: CreateTemplateRequest = {
        name: formData.name,
        subject: formData.subject,
        text: formData.text || undefined,
        html: formData.html || undefined,
        variables: detectedVariables,
      };

      if (template?.id) {
        await templateApi.updateTemplate(template.id, request);
        showToast.success(`Template "${formData.name}" updated successfully`);
      } else {
        await templateApi.createTemplate(request);
        showToast.success(`Template "${formData.name}" created successfully`);
      }

      onClose();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title flex items-center gap-2">
            {template ? (
              <>
                <Save className="w-6 h-6" />
                Edit Template
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Create Template
              </>
            )}
          </h2>
          <motion.button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="form-control"
          >
            <label className="label">
              <span className="label-text font-medium">Template Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-offset-0 transition-all"
              placeholder="e.g., Welcome Email"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              aria-label="Template name"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="form-control"
          >
            <label className="label">
              <span className="label-text font-medium">Subject</span>
              <span className="label-text-alt text-xs opacity-60">
                Use {`{{variable}}`} for dynamic content
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:outline-offset-0 transition-all"
              placeholder="e.g., Welcome {{name}}!"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              aria-label="Email subject"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="form-control"
          >
            <label className="label">
              <span className="label-text font-medium">Message</span>
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
              placeholder={
                isHtmlMode
                  ? '<h1>Hello {{name}}</h1><p>Welcome!</p>'
                  : 'Hello {{name}}, welcome to our service!'
              }
              value={isHtmlMode ? formData.html : formData.text}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [isHtmlMode ? 'html' : 'text']: e.target.value,
                })
              }
              required
              aria-label="Email message content"
            />
          </motion.div>

          {detectedVariables.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="alert alert-info"
            >
              <Info className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold">Detected Variables:</h3>
                <div className="flex gap-2 flex-wrap mt-1">
                  {detectedVariables.map((v) => (
                    <span key={v} className="badge badge-lg">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="divider">
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </div>

          {detectedVariables.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <label className="label">
                <span className="label-text font-medium">Fill variables to preview:</span>
              </label>
              {detectedVariables.map((v, index) => (
                <motion.div 
                  key={v} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="form-control"
                >
                  <div className="input-group">
                    <span className="bg-base-300 px-4 flex items-center min-w-[120px] font-medium">
                      {v}
                    </span>
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      placeholder={`Enter ${v}...`}
                      value={previewVars[v] || ''}
                      onChange={(e) =>
                        setPreviewVars({ ...previewVars, [v]: e.target.value })
                      }
                      aria-label={`Preview value for ${v}`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card bg-base-200"
          >
            <div className="card-body">
              <h3 className="font-bold text-sm opacity-70">Subject Preview:</h3>
              <p className="text-lg">{substituteVariables(formData.subject, previewVars)}</p>
              
              <h3 className="font-bold text-sm opacity-70 mt-4">Body Preview:</h3>
              {isHtmlMode ? (
                <div
                  className="p-4 bg-white text-black rounded border"
                  dangerouslySetInnerHTML={{
                    __html: substituteVariables(formData.html, previewVars),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap p-4 bg-base-100 rounded">
                  {substituteVariables(formData.text, previewVars)}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="card-actions justify-end gap-2 pt-4"
          >
            <motion.button 
              type="button" 
              onClick={onClose} 
              className="btn btn-ghost"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button 
              type="submit" 
              className="btn btn-primary gap-2" 
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
