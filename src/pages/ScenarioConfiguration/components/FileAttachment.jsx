import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../../../components';
import api from '../../../services/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = '2MB';

function FileAttachment({ attachments, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded = [];
      for (const file of files) {
        // Validate file size (2MB limit)
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} exceeds the ${MAX_FILE_SIZE_LABEL} limit`);
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/json',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
          throw new Error(`File type ${file.type} not allowed`);
        }

        const response = await api.uploadFile(file, 'llm_grounding');
        uploaded.push({
          id: response.id,
          name: file.name,
          url: response.url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      onChange([...attachments, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (attachmentId) => {
    onChange(attachments.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.txt,.md,.json,.csv,.docx"
      />

      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </>
        )}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Attached Files List */}
      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(attachment.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No files attached</p>
          <p className="text-xs text-gray-500 mt-1">
            Upload documents for LLM context
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Supported formats:</strong> PDF, TXT, MD, JSON, CSV, DOCX
          <br />
          <strong>Max size:</strong> {MAX_FILE_SIZE_LABEL} per file
          <br />
          <strong>Recommendation:</strong> For better results, upload shorter documents whenever possible.
          <br />
          <strong>Purpose:</strong> These files provide context and knowledge to the LLM during conversations.
        </p>
      </div>
    </div>
  );
}

export default FileAttachment;
