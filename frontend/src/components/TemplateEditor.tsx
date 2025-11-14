import { useState, useEffect } from 'react';
import { templateApi, Template, CreateTemplateRequest } from '../api';

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
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
      } else {
        await templateApi.createTemplate(request);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">
            {template ? '✏️ Edit Template' : '➕ Create Template'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            ← Back
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Template Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., Welcome Email"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject</span>
              <span className="label-text-alt">Use {`{{variable}}`} for dynamic content</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., Welcome {{name}}!"
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
            />
          </div>

          {detectedVariables.length > 0 && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Detected Variables:</h3>
                <div className="flex gap-2 flex-wrap mt-1">
                  {detectedVariables.map((v) => (
                    <span key={v} className="badge badge-lg">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="divider">Preview</div>

          {detectedVariables.length > 0 && (
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Fill variables to preview:</span>
              </label>
              {detectedVariables.map((v) => (
                <div key={v} className="form-control">
                  <div className="input-group">
                    <span className="bg-base-300 px-4 flex items-center min-w-[120px]">
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
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-bold">Subject Preview:</h3>
              <p>{substituteVariables(formData.subject, previewVars)}</p>
              
              <h3 className="font-bold mt-4">Body Preview:</h3>
              {isHtmlMode ? (
                <div
                  className="p-4 bg-white text-black rounded border"
                  dangerouslySetInnerHTML={{
                    __html: substituteVariables(formData.html, previewVars),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap">
                  {substituteVariables(formData.text, previewVars)}
                </p>
              )}
            </div>
          </div>

          <div className="card-actions justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : template ? (
                '💾 Update Template'
              ) : (
                '💾 Create Template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
