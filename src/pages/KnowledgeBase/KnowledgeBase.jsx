import { useState, useEffect } from 'react';
import { FolderOpen, FileText, BookOpen, Search, Plus, Loader2, X, Trash2, Pencil, Upload } from 'lucide-react';
import { Button, Input, PageHeader, KBArticleItem, KBDocumentUpload, KBDocumentList } from '../../components';
import { kbService } from '../../services';
import useAuthStore from '../../stores/authStore';

export default function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '', category: '', tags: '', question: '', answer: '' });
  const [saving, setSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docListKey, setDocListKey] = useState(0);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const search = searchQuery || undefined;

      if (activeType === 'articles') {
        const data = await kbService.getArticles({ category, search });
        setArticles(Array.isArray(data) ? data : data.items || []);
      } else {
        const data = await kbService.getFaqs({ category, search });
        setFaqs(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch KB data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType, activeCategory]);

  const handleSearch = () => fetchData();

  const handleCreate = async () => {
    setSaving(true);
    try {
      if (activeType === 'articles') {
        await kbService.createArticle({
          title: formData.title,
          body: formData.body,
          category: formData.category || undefined,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
        });
      } else {
        await kbService.createFaq({
          question: formData.question,
          answer: formData.answer,
          category: formData.category || undefined,
        });
      }
      setShowCreateModal(false);
      setFormData({ title: '', body: '', category: '', tags: '', question: '', answer: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeType === 'articles') {
      setFormData({
        title: item.title || '',
        body: item.body || '',
        category: item.category || '',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
        question: '',
        answer: '',
      });
    } else {
      setFormData({
        title: '',
        body: '',
        category: item.category || '',
        tags: '',
        question: item.question || '',
        answer: item.answer || '',
      });
    }
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      if (activeType === 'articles') {
        await kbService.updateArticle(editingItem.id, {
          title: formData.title,
          body: formData.body,
          category: formData.category || undefined,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
        });
      } else {
        await kbService.updateFaq(editingItem.id, {
          question: formData.question,
          answer: formData.answer,
          category: formData.category || undefined,
        });
      }
      setShowEditModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeType === 'articles') {
        await kbService.deleteArticle(id);
      } else {
        await kbService.deleteFaq(id);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const items = activeType === 'articles' ? articles : faqs;

  // Extract unique categories from items
  const categories = ['all', ...new Set(items.map((i) => i.category).filter(Boolean))];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 rounded-2xl p-8 overflow-hidden">
      <PageHeader
        title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Knowledge Base</span>}
        description="Manage the articles and FAQs that are used by your widget to automatically answer customer questions."
        className="mb-8 border-b border-slate-200 pb-6"
        actions={
          <>
            <Input
              icon={Search}
              placeholder="Search knowledge base..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {isAdmin && (
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 shrink-0 gap-2"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            )}
            {isAdmin && activeType !== 'documents' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 shrink-0 gap-2"
                onClick={() => {
                  setFormData({ title: '', body: '', category: '', tags: '', question: '', answer: '' });
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {activeType === 'articles' ? 'Create Article' : 'Create FAQ'}
              </Button>
            )}
          </>
        }
      />

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2 shrink-0 border-r border-slate-200 pr-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2">Categories</h3>
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className={`w-5 h-5 ${activeCategory === cat ? '' : 'text-slate-400'}`} />
              {cat === 'all' ? 'All' : cat}
            </div>
          ))}

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2 mt-6">Types</h3>
          <div
            onClick={() => { setActiveType('articles'); setActiveCategory('all'); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${
              activeType === 'articles' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeType === 'articles' ? '' : 'text-slate-400'}`} />
            Articles
          </div>
          <div
            onClick={() => { setActiveType('faqs'); setActiveCategory('all'); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${
              activeType === 'faqs' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeType === 'faqs' ? '' : 'text-slate-400'}`} />
            FAQs
          </div>
          <div
            onClick={() => { setActiveType('documents'); setActiveCategory('all'); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-colors ${
              activeType === 'documents' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className={`w-5 h-5 ${activeType === 'documents' ? '' : 'text-slate-400'}`} />
            Documents
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {activeType === 'documents' ? (
            <KBDocumentList
              key={docListKey}
              kbService={kbService}
              isAdmin={isAdmin}
              onRefreshArticles={() => fetchData()}
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg font-medium">No {activeType} found</p>
              <p className="text-sm mt-1">{isAdmin ? `Create your first ${activeType === 'articles' ? 'article' : 'FAQ'} to get started.` : 'No content available yet.'}</p>
            </div>
          ) : activeType === 'articles' ? (
            articles.map((article) => (
              <div key={article.id} className="group relative">
                <KBArticleItem
                  title={article.title}
                  excerpt={article.body ? article.body.substring(0, 120) + '...' : 'No content'}
                  status={article.is_published ? 'Published' : 'Draft'}
                  date={formatDate(article.created_at)}
                  onClick={() => isAdmin && handleEdit(article)}
                />
                {isAdmin && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(article); }}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all">
                <h3 className="font-semibold text-slate-800 mb-2">{faq.question}</h3>
                <p className="text-sm text-slate-500">{faq.answer}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${faq.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {faq.is_published ? 'Published' : 'Draft'}
                  </span>
                  {faq.category && <span className="text-xs text-slate-400">{faq.category}</span>}
                </div>
                {isAdmin && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {showCreateModal
                  ? (activeType === 'articles' ? 'New Article' : 'New FAQ')
                  : (activeType === 'articles' ? 'Edit Article' : 'Edit FAQ')}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {activeType === 'articles' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Body (Markdown)</label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-40"
                      placeholder="Article content..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="widget, installation, guide"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="What is...?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-32"
                      placeholder="The answer is..."
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="e.g. Getting Started"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                Cancel
              </Button>
              <Button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (showCreateModal ? 'Create' : 'Save Changes')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      <KBDocumentUpload
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        kbService={kbService}
        onUploadComplete={() => {
          // Refresh document list
          setDocListKey((k) => k + 1);
          // Also refresh articles since new ones were created
          fetchData();
        }}
      />
    </div>
  );
}
