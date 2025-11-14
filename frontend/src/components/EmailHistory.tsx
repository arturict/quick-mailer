import { useState, useEffect, useCallback } from 'react';
import { emailApi, Email, EmailSearchParams } from '../api';

export function EmailHistory() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search and filter state
  const [searchParams, setSearchParams] = useState<EmailSearchParams>({});
  const [recipientInput, setRecipientInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [senderInput, setSenderInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'sent' | 'failed' | 'pending' | ''>('');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const response = await emailApi.getEmails(page, 50, searchParams);
      setEmails(response.emails);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const newSearchParams: EmailSearchParams = {};
      
      if (recipientInput.trim()) newSearchParams.recipient = recipientInput.trim();
      if (subjectInput.trim()) newSearchParams.subject = subjectInput.trim();
      if (senderInput.trim()) newSearchParams.sender = senderInput.trim();
      if (statusFilter) newSearchParams.status = statusFilter as 'sent' | 'failed' | 'pending';
      if (dateFromInput) newSearchParams.dateFrom = dateFromInput;
      if (dateToInput) newSearchParams.dateTo = dateToInput;
      
      setSearchParams(newSearchParams);
      setPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [recipientInput, subjectInput, senderInput, statusFilter, dateFromInput, dateToInput]);

  useEffect(() => {
    loadEmails();
  }, [page, searchParams]);

  const clearFilters = useCallback(() => {
    setRecipientInput('');
    setSubjectInput('');
    setSenderInput('');
    setStatusFilter('');
    setDateFromInput('');
    setDateToInput('');
    setSearchParams({});
    setPage(1);
  }, []);

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

          {/* Search and Filter Section */}
          <div className="bg-base-200 rounded-lg p-4 space-y-3 mb-4">
            <div className="flex flex-wrap gap-3">
              {/* Search by recipient */}
              <div className="form-control flex-1 min-w-[200px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Search Recipient</span>
                </label>
                <input
                  type="text"
                  placeholder="Email address..."
                  className="input input-sm input-bordered"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                />
              </div>

              {/* Search by subject */}
              <div className="form-control flex-1 min-w-[200px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Search Subject</span>
                </label>
                <input
                  type="text"
                  placeholder="Subject keywords..."
                  className="input input-sm input-bordered"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                />
              </div>

              {/* Search by sender */}
              <div className="form-control flex-1 min-w-[200px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Search Sender</span>
                </label>
                <input
                  type="text"
                  placeholder="From address..."
                  className="input input-sm input-bordered"
                  value={senderInput}
                  onChange={(e) => setSenderInput(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <div className="form-control min-w-[150px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Status</span>
                </label>
                <select
                  className="select select-sm select-bordered"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="">All</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              {/* Date from */}
              <div className="form-control min-w-[180px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Date From</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-sm input-bordered"
                  value={dateFromInput}
                  onChange={(e) => setDateFromInput(e.target.value)}
                />
              </div>

              {/* Date to */}
              <div className="form-control min-w-[180px]">
                <label className="label py-1">
                  <span className="label-text text-xs">Date To</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-sm input-bordered"
                  value={dateToInput}
                  onChange={(e) => setDateToInput(e.target.value)}
                />
              </div>

              {/* Clear filters button */}
              <button
                className="btn btn-sm btn-ghost"
                onClick={clearFilters}
                disabled={!recipientInput && !subjectInput && !senderInput && !statusFilter && !dateFromInput && !dateToInput}
              >
                🗑️ Clear Filters
              </button>
            </div>
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
