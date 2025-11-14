import { Mail, Inbox, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Props for the EmptyState component
 */
interface EmptyStateProps {
  /** Icon variant to display */
  icon?: 'mail' | 'inbox' | 'template' | 'sparkles';
  /** Title text to display */
  title: string;
  /** Description text to display */
  description: string;
  /** Optional action button configuration */
  action?: {
    /** Button label */
    label: string;
    /** Button click handler */
    onClick: () => void;
  };
}

const iconComponents = {
  mail: Mail,
  inbox: Inbox,
  template: FileText,
  sparkles: Sparkles,
};

/**
 * EmptyState component displays a friendly message when there's no content
 * 
 * Features:
 * - Animated icon and text with spring physics
 * - Optional call-to-action button
 * - Multiple icon variants for different contexts
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon="inbox"
 *   title="No emails yet"
 *   description="Your emails will appear here"
 *   action={{
 *     label: "Send Email",
 *     onClick: () => navigate('/compose')
 *   }}
 * />
 * ```
 */
export function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const IconComponent = iconComponents[icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
        className="mb-6 p-6 bg-base-200 rounded-full"
      >
        <IconComponent className="w-16 h-16 text-base-content/40" strokeWidth={1.5} />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-2 text-base-content"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-base-content/60 mb-6 max-w-md"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={action.onClick}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
