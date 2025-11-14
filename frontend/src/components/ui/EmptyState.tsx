import { Mail, Inbox, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: 'mail' | 'inbox' | 'template' | 'sparkles';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconComponents = {
  mail: Mail,
  inbox: Inbox,
  template: FileText,
  sparkles: Sparkles,
};

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
