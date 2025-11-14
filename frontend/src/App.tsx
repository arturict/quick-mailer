import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, FileText, History, Sun, Moon, Keyboard } from 'lucide-react';
import { EmailComposer } from './components/EmailComposer';
import { EmailHistory } from './components/EmailHistory';
import { TemplateManager } from './components/TemplateManager';
import { Toaster } from './components/ui/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history'>('compose');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleEmailSent = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'c',
      ctrl: true,
      callback: () => setActiveTab('compose'),
      description: 'Go to Compose',
    },
    {
      key: 't',
      ctrl: true,
      callback: () => setActiveTab('templates'),
      description: 'Go to Templates',
    },
    {
      key: 'h',
      ctrl: true,
      callback: () => setActiveTab('history'),
      description: 'Go to History',
    },
    {
      key: '?',
      shift: true,
      callback: () => setShowShortcuts(!showShortcuts),
      description: 'Show shortcuts',
    },
  ]);

  return (
    <div className="min-h-screen bg-base-200">
      <Toaster position="top-right" />
      
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="navbar bg-base-100 shadow-lg sticky top-0 z-50"
      >
        <div className="flex-1">
          <a className="btn btn-ghost text-lg md:text-xl">
            <Mail className="w-5 h-5 md:w-6 md:h-6 mr-2" />
            <span className="hidden sm:inline">Quick Mailer</span>
            <span className="sm:hidden">QM</span>
          </a>
        </div>
        <div className="flex-none gap-2">
          <button
            className="btn btn-ghost btn-circle btn-sm md:btn-md"
            onClick={() => setShowShortcuts(!showShortcuts)}
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts (Shift + ?)"
          >
            <Keyboard className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm md:btn-md" aria-label="Toggle theme">
            <input type="checkbox" className="theme-controller" value="dark" />
            <Sun className="swap-off w-4 h-4 md:w-5 md:h-5" />
            <Moon className="swap-on w-4 h-4 md:w-5 md:h-5" />
          </label>
        </div>
      </motion.div>

      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="tabs tabs-boxed bg-base-100 shadow-lg"
        >
          <a 
            className={`tab gap-1 sm:gap-2 text-xs sm:text-sm ${activeTab === 'compose' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('compose')}
            aria-label="Compose email (Ctrl+C)"
          >
            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Compose</span>
          </a>
          <a 
            className={`tab gap-1 sm:gap-2 text-xs sm:text-sm ${activeTab === 'templates' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('templates')}
            aria-label="View templates (Ctrl+T)"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Templates</span>
          </a>
          <a 
            className={`tab gap-1 sm:gap-2 text-xs sm:text-sm ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
            aria-label="View history (Ctrl+H)"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">History</span>
          </a>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'compose' && <EmailComposer onEmailSent={handleEmailSent} />}
            {activeTab === 'templates' && <TemplateManager />}
            {activeTab === 'history' && <EmailHistory key={refreshKey} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
        <div>
          <p className="text-sm opacity-70">Quick Mailer v1.0.0 - Simple transactional email sender</p>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-base-200 rounded">
                <span>Go to Compose</span>
                <kbd className="kbd kbd-sm">Ctrl + C</kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-base-200 rounded">
                <span>Go to Templates</span>
                <kbd className="kbd kbd-sm">Ctrl + T</kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-base-200 rounded">
                <span>Go to History</span>
                <kbd className="kbd kbd-sm">Ctrl + H</kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-base-200 rounded">
                <span>Send Email (in compose)</span>
                <kbd className="kbd kbd-sm">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-base-200 rounded">
                <span>Show/Hide Shortcuts</span>
                <kbd className="kbd kbd-sm">Shift + ?</kbd>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowShortcuts(false)}>Close</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowShortcuts(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default App;
