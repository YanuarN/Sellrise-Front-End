import { useState, useEffect } from 'react';
import { FileText, File, Loader2, Trash2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Processing', spin: true },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Failed' },
};

export default function KBDocumentList({ kbService, isAdmin, onRefreshArticles }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await kbService.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.filename}"? This will not delete articles that were already created from it.`)) return;
    try {
      await kbService.deleteDocument(doc.id);
      fetchDocuments();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <File className="w-12 h-12 mb-3 text-slate-300" />
        <p className="text-lg font-medium">No documents uploaded</p>
        <p className="text-sm mt-1">Upload a PDF or DOCX to auto-generate KB articles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
        const StatusIcon = status.icon;
        const isPdf = doc.file_type === 'pdf';

        return (
          <div
            key={doc.id}
            className={`group bg-white border ${status.border} rounded-2xl p-5 hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-4">
              {/* File icon */}
              <div className={`w-10 h-10 ${isPdf ? 'bg-red-50' : 'bg-blue-50'} rounded-xl flex items-center justify-center shrink-0`}>
                <FileText className={`w-5 h-5 ${isPdf ? 'text-red-500' : 'text-blue-500'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.filename}</h4>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{doc.file_type?.toUpperCase()}</span>
                  <span>•</span>
                  <span>{formatDate(doc.created_at)}</span>
                  {doc.status === 'completed' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{doc.articles_created} article(s)</span>
                    </>
                  )}
                </div>

                {/* Error message */}
                {doc.status === 'failed' && doc.error_message && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 line-clamp-2">{doc.error_message}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(doc)}
                    title="Delete document"
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
