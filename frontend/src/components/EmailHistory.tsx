import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { emailApi, Email } from '../api';
import { TableSkeleton } from './ui/LoadingSkeleton';
import { EmptyState } from './ui/EmptyState';
import { showToast } from './ui/Toast';

export function EmailHistory() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const response = await emailApi.getEmails(page, 50);
      setEmails(response.emails);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load emails:', error);
      showToast.error('Failed to load email history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [page]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      sent: 'badge-success',
      failed: 'badge-error',
      pending: 'badge-warning',
    };
    return badges[status as keyof typeof badges] || 'badge-ghost';
  };

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title flex items-center gap-2">
              📬 Email History
            </h2>
            <motion.button 
              className="btn btn-sm btn-ghost gap-2"
              onClick={loadEmails}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Refresh email history"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>

          {isLoading && emails.length === 0 ? (
            <TableSkeleton rows={5} />
          ) : emails.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No emails sent yet"
              description="Your email history will appear here once you send your first email."
              action={{
                label: "Compose Email",
                onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'compose' }))
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th className="hidden sm:table-cell w-16">ID</th>
                      <th className="hidden md:table-cell">From</th>
                      <th>To</th>
                      <th className="hidden lg:table-cell">Subject</th>
                      <th className="w-20 sm:w-24">Status</th>
                      <th className="hidden md:table-cell">Date</th>
                      <th className="w-16 sm:w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {emails.map((email, index) => (
                        <motion.tr 
                          key={email.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-base-200 transition-colors"
                        >
                          <td className="hidden sm:table-cell font-mono text-sm">{email.id}</td>
                          <td className="hidden md:table-cell truncate max-w-[150px] lg:max-w-xs" title={email.from_address}>
                            {email.from_address}
                          </td>
                          <td className="truncate max-w-[120px] sm:max-w-[200px] lg:max-w-xs" title={email.to_address}>
                            {email.to_address}
                          </td>
                          <td className="hidden lg:table-cell truncate max-w-xs font-medium" title={email.subject}>
                            {email.subject}
                          </td>
                          <td>
                            <span className={`badge badge-sm ${getStatusBadge(email.status)}`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="hidden md:table-cell text-sm opacity-70">{formatDate(email.created_at)}</td>
                          <td>
                            <motion.button
                              className="btn btn-xs btn-ghost gap-1"
                              onClick={() => setSelectedEmail(email)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`View email ${email.id}`}
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">View</span>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center gap-2 mt-4"
                >
                  <motion.button
                    className="btn btn-sm gap-1 sm:gap-2"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </motion.button>
                  <span className="btn btn-sm btn-ghost pointer-events-none text-xs sm:text-sm">
                    <span className="hidden sm:inline">Page </span>{page}<span className="hidden sm:inline"> of {totalPages}</span><span className="sm:hidden">/{totalPages}</span>
                  </span>
                  <motion.button
                    className="btn btn-sm gap-1 sm:gap-2"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Email Details Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <dialog className="modal modal-open">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-box max-w-3xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">Email Details</h3>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={() => setSelectedEmail(null)}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-sm opacity-70">From:</strong>
                    <p className="break-all">{selectedEmail.from_address}</p>
                  </div>
                  <div>
                    <strong className="text-sm opacity-70">To:</strong>
                    <p className="break-all">{selectedEmail.to_address}</p>
                  </div>
                </div>
                
                <div>
                  <strong className="text-sm opacity-70">Subject:</strong>
                  <p className="font-medium">{selectedEmail.subject}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-sm opacity-70">Status:</strong>
                    <div className="mt-1">
                      <span className={`badge ${getStatusBadge(selectedEmail.status)}`}>
                        {selectedEmail.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <strong className="text-sm opacity-70">Date:</strong>
                    <p>{formatDate(selectedEmail.created_at)}</p>
                  </div>
                </div>
                
                {selectedEmail.email_id && (
                  <div>
                    <strong className="text-sm opacity-70">Email ID:</strong>
                    <p className="font-mono text-sm break-all">{selectedEmail.email_id}</p>
                  </div>
                )}
                
                {selectedEmail.error_message && (
                  <div className="alert alert-error">
                    <strong>Error:</strong> {selectedEmail.error_message}
                  </div>
                )}
                
                <div className="divider">Message Content</div>
                
                {selectedEmail.body_html ? (
                  <div>
                    <strong className="text-sm opacity-70">HTML Content:</strong>
                    <div 
                      className="bg-base-200 p-4 rounded mt-2 overflow-auto max-h-96"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                    />
                  </div>
                ) : selectedEmail.body_text ? (
                  <div>
                    <strong className="text-sm opacity-70">Text Content:</strong>
                    <pre className="bg-base-200 p-4 rounded mt-2 overflow-auto max-h-96 whitespace-pre-wrap">
                      {selectedEmail.body_text}
                    </pre>
                  </div>
                ) : (
                  <div className="text-base-content/50 text-center py-4">No content</div>
                )}
              </div>

              <div className="modal-action">
                <button className="btn" onClick={() => setSelectedEmail(null)}>
                  Close
                </button>
              </div>
            </motion.div>
            <form method="dialog" className="modal-backdrop bg-black/50">
              <button onClick={() => setSelectedEmail(null)}>close</button>
            </form>
          </dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
