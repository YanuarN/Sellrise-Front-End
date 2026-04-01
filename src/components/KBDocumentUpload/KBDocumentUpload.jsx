import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, File } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.md'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_SIZE_LABEL = '2 MB';

export default function KBDocumentUpload({ open, onClose, onUploadComplete, kbService }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(''); // status text during upload
  const [result, setResult] = useState(null); // success result
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setUploading(false);
    setProgress('');
    setResult(null);
    setError('');
  };

  const handleClose = () => {
    if (uploading) return; // prevent closing during upload
    reset();
    onClose();
  };

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type "${ext}" is not supported. Please upload a PDF, DOCX, or Markdown file.`;
    }
    if (f.size > MAX_SIZE) {
      return `File size (${(f.size / 1024 / 1024).toFixed(1)} MB) exceeds the ${MAX_SIZE_LABEL} limit.`;
    }
    if (f.size === 0) {
      return 'File is empty.';
    }
    return null;
  };

  const handleFile = useCallback((f) => {
    setError('');
    setResult(null);
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError('');
    setProgress('Uploading document...');

    try {
      setProgress('Processing document — extracting text and generating articles...');
      const data = await kbService.uploadDocument(file);
      setResult(data);
      setProgress('');
      if (onUploadComplete) onUploadComplete(data);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  const fileExt = file ? '.' + file.name.split('.').pop().toLowerCase() : '';
  const isPdf = fileExt === '.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload a PDF, DOCX, or Markdown file to auto-generate KB articles
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success state */}
        {result ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800">{result.message}</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {result.articles?.length || 0} article(s) created as drafts
                </p>
              </div>
            </div>

            {/* Generated articles preview */}
            {result.articles && result.articles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">Generated Articles:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.articles.map((article, i) => (
                    <div key={article.id || i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {article.category && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              {article.category}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">Draft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { reset(); }}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2"
              >
                Upload Another
              </button>
              <button
                onClick={handleClose}
                className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : file
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }
                ${uploading ? 'pointer-events-none opacity-60' : ''}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.md,text/markdown"
                onChange={handleInputChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPdf ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <File className={`w-6 h-6 ${isPdf ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {fileExt.toUpperCase().replace('.', '')}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }}
                      className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 mt-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">
                      Drop your file here or <span className="text-emerald-600">browse</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Supports PDF, DOCX, and Markdown — Max {MAX_SIZE_LABEL}
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      For better results, upload documents that are not too long.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Processing status */}
            {uploading && progress && (
              <div className="flex items-center gap-3 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{progress}</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    This may take a moment depending on document size...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">How it works</h4>
              <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
                <li>Upload a PDF, DOCX, or Markdown document</li>
                <li>System extracts text content automatically</li>
                <li>AI analyzes and structures it into KB articles</li>
                <li>Articles are saved as <strong>drafts</strong> for your review</li>
              </ol>
              <p className="text-xs text-amber-700 mt-3">
                Best practice: upload concise documents to improve processing quality and review speed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Generate
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
