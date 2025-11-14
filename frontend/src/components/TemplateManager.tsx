import { useState, useEffect, memo, useCallback } from 'react';
import { templateApi, Template } from '../api';
import { TemplateEditor } from './TemplateEditor';

// Memoized template row component
const TemplateRow = memo(function TemplateRow({
  template,
  onEdit,
  onDelete,
}: {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <tr>
      <td className="font-medium">{template.name}</td>
      <td className="text-sm opacity-70">{template.subject}</td>
      <td>
        <div className="flex gap-1 flex-wrap">
          {template.variables?.map((v) => (
            <span key={v} className="badge badge-sm badge-outline">
              {v}
            </span>
          ))}
        </div>
      </td>
      <td className="text-sm opacity-70">
        {template.created_at && new Date(template.created_at).toLocaleDateString()}
      </td>
      <td>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(template)}
            className="btn btn-ghost btn-xs"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(template.id!)}
            className="btn btn-ghost btn-xs text-error"
          >
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  );
});

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await templateApi.getTemplates();
      setTemplates(result.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateApi.deleteTemplate(id);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  }, [loadTemplates]);

  const handleEdit = useCallback((template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingTemplate(null);
    setShowEditor(true);
  }, []);

  const handleEditorClose = useCallback(() => {
    setShowEditor(false);
    setEditingTemplate(null);
    loadTemplates();
  }, [loadTemplates]);

  if (showEditor) {
    return <TemplateEditor template={editingTemplate} onClose={handleEditorClose} />;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">📋 Email Templates</h2>
          <button onClick={handleCreate} className="btn btn-primary btn-sm">
            ➕ New Template
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

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center p-8 text-base-content/60">
            No templates yet. Create your first template to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Variables</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
