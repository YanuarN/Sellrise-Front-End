import { useCallback, useEffect, useState } from 'react';
import { Download, Eye, ImageOff, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import Button from '../Button';
import leadService from '../../services/leadService';
import { API_BASE_URL } from '../../services/api';

const resolveAttachmentUrl = (url) => (url?.startsWith('/') ? `${API_BASE_URL}${url}` : url || '');

const formatAttachmentDate = (value) => {
  if (!value) return 'Unknown upload time';
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function LeadAttachmentsPanel({ leadId, title = 'Attachments' }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [deletingId, setDeletingId] = useState('');

  const loadAttachments = useCallback(async () => {
    if (!leadId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await leadService.getLeadAttachments(leadId);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleDelete = async (attachment) => {
    if (!leadId || !attachment?.id) return;
    if (!window.confirm(`Delete attachment ${attachment.name}?`)) return;

    setDeletingId(attachment.id);
    try {
      await leadService.deleteLeadAttachment(leadId, attachment.id);
      setAttachments((current) => current.filter((item) => item.id !== attachment.id));
      if (previewItem?.id === attachment.id) {
        setPreviewItem(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete attachment');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{attachments.length} file{attachments.length === 1 ? '' : 's'}</p>
        </div>
        <button
          type="button"
          onClick={loadAttachments}
          disabled={loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Refresh attachments"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading attachments...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{error}</p>
            <button type="button" onClick={loadAttachments} className="mt-2 font-medium text-red-700 underline underline-offset-4">
              Retry
            </button>
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <ImageOff className="h-6 w-6 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600">No photos uploaded yet</p>
            <p className="mt-1 text-xs text-slate-400">Uploaded widget photos will appear here after the visitor sends them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {attachments.map((attachment) => {
              const resolvedUrl = resolveAttachmentUrl(attachment.url);
              return (
                <div key={attachment.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(attachment)}
                    className="block w-full bg-slate-100"
                  >
                    <img
                      src={resolvedUrl}
                      alt={attachment.name}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                  <div className="space-y-3 p-3">
                    <div>
                      <p className="truncate text-sm font-medium text-slate-700">{attachment.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatAttachmentDate(attachment.uploaded_at)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={() => setPreviewItem(attachment)}>
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(attachment)}
                        disabled={deletingId === attachment.id}
                      >
                        {deletingId === attachment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 py-8" onClick={() => setPreviewItem(null)}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow transition hover:text-slate-700"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-slate-100">
                <img src={resolveAttachmentUrl(previewItem.url)} alt={previewItem.name} className="max-h-[75vh] w-full object-contain" />
              </div>
              <div className="flex flex-col justify-between gap-6 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lead Attachment</p>
                  <h5 className="mt-2 text-lg font-semibold text-slate-800">{previewItem.name}</h5>
                  <p className="mt-2 text-sm text-slate-500">Uploaded {formatAttachmentDate(previewItem.uploaded_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={resolveAttachmentUrl(previewItem.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Download full image
                  </a>
                  <Button type="button" variant="secondary" className="gap-2" onClick={() => setPreviewItem(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}