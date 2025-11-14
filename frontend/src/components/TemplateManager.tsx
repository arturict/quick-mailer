import { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { templateApi, Template } from '../api';
import { TemplateEditor } from './TemplateEditor';
import { TableSkeleton } from './ui/LoadingSkeleton';
import { EmptyState } from './ui/EmptyState';
import { showToast } from './ui/Toast';

// Memoized template row component
const TemplateRow = memo(function TemplateRow({
  template,
  onEdit,
  onDelete,
  index,
}: {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: number, name: string) => void;
  index: number;
}) {
  return (
    <motion.tr 
      key={template.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-base-200 transition-colors"
    >
      <td className="font-medium">{template.name}</td>
      <td className="hidden md:table-cell text-sm opacity-70 max-w-xs truncate" title={template.subject}>
        {template.subject}
      </td>
      <td className="hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {template.variables && template.variables.length > 0 ? (
            template.variables.map((v) => (
              <span key={v} className="badge badge-sm badge-outline">
                {v}
              </span>
            ))
          ) : (
            <span className="text-xs opacity-50">No variables</span>
          )}
        </div>
      </td>
      <td className="hidden sm:table-cell text-sm opacity-70">
        {template.created_at && new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(template.created_at))}
      </td>
      <td>
        <div className="flex gap-1 sm:gap-2 justify-end">
          <motion.button
            onClick={() => onEdit(template)}
            className="btn btn-ghost btn-xs gap-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Edit ${template.name}`}
          >
            <Edit2 className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </motion.button>
          <motion.button
            onClick={() => onDelete(template.id!, template.name)}
            className="btn btn-ghost btn-xs text-error gap-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Delete ${template.name}`}
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
});

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await templateApi.getTemplates();
      setTemplates(result.templates);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleDelete = useCallback(async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}"?`)) {
      return;
    }

    try {
      await templateApi.deleteTemplate(id);
      showToast.success(`Template "${name}" deleted successfully`);
      await loadTemplates();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to delete template');
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Email Templates
          </h2>
          <motion.button 
            onClick={handleCreate} 
            className="btn btn-primary btn-sm gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Create new template"
          >
            <Plus className="w-4 h-4" />
            New Template
          </motion.button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : templates.length === 0 ? (
          <EmptyState
            icon="template"
            title="No templates yet"
            description="Create your first email template to save time composing similar emails."
            action={{
              label: "Create Template",
              onClick: handleCreate
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Subject</th>
                  <th className="hidden lg:table-cell">Variables</th>
                  <th className="hidden sm:table-cell">Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {templates.map((template, index) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
