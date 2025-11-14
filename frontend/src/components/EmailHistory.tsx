import { useState, useEffect } from 'react';
import { emailApi, Email } from '../api';

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [page]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">📬 Email History</h2>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={loadEmails}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                '🔄'
              )}
            </button>
          </div>

          {isLoading && emails.length === 0 ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              No emails sent yet
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id}>
                        <td>{email.id}</td>
                        <td className="truncate max-w-xs">{email.from_address}</td>
                        <td className="truncate max-w-xs">{email.to_address}</td>
                        <td className="truncate max-w-xs">{email.subject}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(email.status)}`}>
                            {email.status}
                          </span>
                        </td>
                        <td>{formatDate(email.created_at)}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => setSelectedEmail(email)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="btn btn-sm btn-ghost">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEmail && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">Email Details</h3>
            
            <div className="space-y-4">
              <div>
                <strong>From:</strong> {selectedEmail.from_address}
              </div>
              <div>
                <strong>To:</strong> {selectedEmail.to_address}
              </div>
              <div>
                <strong>Subject:</strong> {selectedEmail.subject}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`badge ${getStatusBadge(selectedEmail.status)}`}>
                  {selectedEmail.status}
                </span>
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedEmail.created_at)}
              </div>
              {selectedEmail.email_id && (
                <div>
                  <strong>Email ID:</strong> {selectedEmail.email_id}
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
                  <strong>HTML:</strong>
                  <div 
                    className="mockup-code mt-2 overflow-auto max-h-96"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  />
                </div>
              ) : selectedEmail.body_text ? (
                <div>
                  <strong>Text:</strong>
                  <pre className="bg-base-200 p-4 rounded mt-2 overflow-auto max-h-96">
                    {selectedEmail.body_text}
                  </pre>
                </div>
              ) : (
                <div className="text-base-content/50">No content</div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedEmail(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedEmail(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
