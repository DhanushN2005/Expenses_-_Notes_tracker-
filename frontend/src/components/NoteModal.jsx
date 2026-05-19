import React, { useState, useEffect } from 'react';
import { X, Pin, Tag, Palette } from 'lucide-react';

const NoteModal = ({ isOpen, onClose, onSave, note }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('slate');
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with selected note when editing
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || 'Personal');
      setColor(note.color || 'slate');
      setPinned(note.pinned || false);
    } else {
      // Clear form for new note
      setTitle('');
      setContent('');
      setCategory('Personal');
      setColor('slate');
      setPinned(false);
    }
    setError('');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Note content cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');
    
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      color,
      pinned,
    };

    const success = await onSave(noteData);
    setLoading(false);
    
    if (success) {
      onClose();
    } else {
      setError('Failed to save the note. Please try again.');
    }
  };

  // Color theme choices mapping
  const colorOptions = [
    { key: 'slate', name: 'Standard Slate', bg: 'bg-slate-800' },
    { key: 'indigo', name: 'Elegant Indigo', bg: 'bg-indigo-600' },
    { key: 'emerald', name: 'Emerald Forest', bg: 'bg-emerald-600' },
    { key: 'amber', name: 'Amber Sunset', bg: 'bg-amber-600' },
    { key: 'rose', name: 'Rose Petal', bg: 'bg-rose-600' },
  ];

  const categories = ['Personal', 'Work', 'Ideas', 'Todo', 'Finance', 'Studies', 'Others'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl transform rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPinned(!pinned)}
              type="button"
              className={`p-2 rounded-xl transition-colors ${
                pinned 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
              }`}
              title={pinned ? "Pinned" : "Pin this note"}
            >
              <Pin className={`h-4 w-4 ${pinned ? 'fill-amber-400' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title..."
              className="mt-1.5 block w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing thoughts, tasks, and ideas..."
              rows={6}
              className="mt-1.5 block w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <Tag className="h-3.5 w-3.5" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 block w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] py-3 px-4 text-sm text-[var(--text-main)] outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-main)]">{cat}</option>
                ))}
              </select>
            </div>

            {/* Color Palette Select */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <Palette className="h-3.5 w-3.5" />
                Color Theme
              </label>
              <div className="flex items-center gap-2 mt-2 py-1.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setColor(opt.key)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${opt.bg} ${
                      color === opt.key ? 'border-white scale-105' : 'border-transparent'
                    }`}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-3 text-sm font-semibold text-[var(--text-muted)] transition-all hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 outline-none transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              ) : (
                <span>{note ? 'Save Changes' : 'Create Note'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default NoteModal;
