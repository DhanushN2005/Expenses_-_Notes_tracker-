import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { Plus, FolderKanban, AlertCircle, FilePlus, XCircle, Search } from 'lucide-react';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  
  // Custom toast notifications state
  const [alert, setAlert] = useState(null);

  // Categories helper
  const categories = ['All', 'Personal', 'Work', 'Ideas', 'Todo', 'Finance', 'Studies', 'Others'];

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes();
      setNotes(data || []);
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve notes. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleCreateNoteClick = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNoteClick = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        // Update Note
        const id = editingNote._id || editingNote.id;
        const updated = await updateNote(id, noteData);
        setNotes(notes.map((n) => ((n._id || n.id) === id ? updated : n)));
        triggerAlert('success', 'Note updated successfully!');
      } else {
        // Create Note
        const created = await createNote(noteData);
        setNotes([created, ...notes]);
        triggerAlert('success', 'Note created successfully!');
      }
      return true;
    } catch (err) {
      triggerAlert('error', err.response?.data?.error || 'Failed to save note.');
      return false;
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote(id);
      setNotes(notes.filter((n) => (n._id || n.id) !== id));
      triggerAlert('success', 'Note deleted successfully.');
    } catch (err) {
      triggerAlert('error', 'Failed to delete note. Try again.');
    }
  };

  const handleTogglePin = async (note) => {
    const id = note._id || note.id;
    try {
      const updated = await updateNote(id, {
        ...note,
        pinned: !note.pinned,
      });
      setNotes(notes.map((n) => ((n._id || n.id) === id ? updated : n)));
      triggerAlert('success', note.pinned ? 'Note unpinned.' : 'Note pinned to top!');
    } catch (err) {
      triggerAlert('error', 'Failed to update pin status.');
    }
  };

  // Filter notes based on category and search query
  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.category && note.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Separate pinned and standard notes
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <Layout>
      {/* Floating Custom Toast Alerts */}
      {alert && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 select-none max-w-md border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]">
          {alert.type === 'success' ? (
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
            {alert.type === 'success' ? 'SUCCESS: ' : 'ERROR: '}
          </span>
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-6 mb-8 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[var(--text-main)]">
            Notes Workspace
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Keep your thoughts organized and accessible.
          </p>
        </div>
        
        <button
          onClick={handleCreateNoteClick}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative max-w-xl">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by title, content, or category..."
          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Workspace Metrics Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 p-4 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Total Documents</span>
            <h4 className="text-xl font-black text-[var(--text-main)]">{notes.length}</h4>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-xl border border-indigo-500/20 font-extrabold">Docs</span>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 p-4 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Pinned Items</span>
            <h4 className="text-xl font-black text-amber-400">{notes.filter(n => n.pinned).length}</h4>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-xl border border-amber-500/20 font-extrabold">Pinned</span>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 p-4 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Total Word Count</span>
            <h4 className="text-xl font-black text-[var(--text-main)]">
              {notes.reduce((acc, n) => acc + (n.content ? n.content.split(/\s+/).filter(Boolean).length : 0), 0)}
            </h4>
          </div>
          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-xl border border-cyan-500/20 font-extrabold">Words</span>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 p-4 backdrop-blur-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Active Categories</span>
            <h4 className="text-xl font-black text-[var(--text-main)]">
              {new Set(notes.map(n => n.category).filter(Boolean)).size}
            </h4>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-extrabold">Topics</span>
        </div>
      </div>

      {/* Categories Tab Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] mr-2 border-r border-[var(--border-color)] pr-3.5">
          <FolderKanban className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filter:</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-transparent hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-4 w-2/3 rounded-lg bg-[var(--border-color)]/60"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded-lg bg-[var(--border-color)]/60"></div>
                  <div className="h-3 w-5/6 rounded-lg bg-[var(--border-color)]/60"></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                <div className="h-3 w-1/4 rounded-lg bg-[var(--border-color)]/60"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[var(--border-color)]/60"></div>
                  <div className="h-8 w-8 rounded-lg bg-[var(--border-color)]/60"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[var(--text-muted)] mb-4 border border-[var(--border-color)]">
            <FilePlus className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">No notes found</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] text-center max-w-sm">
            {searchQuery || selectedCategory !== 'All' 
              ? "We couldn't find any notes matching your active search or filters."
              : "Your notes workspace is empty! Click 'New Note' to get started."}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
            >
              <XCircle className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400/90">
                <span className="text-xs font-bold uppercase tracking-wider">Pinned Notes</span>
                <div className="h-px bg-amber-400/20 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id || note.id}
                    note={note}
                    onEdit={handleEditNoteClick}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onTriggerAlert={triggerAlert}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Others Section */}
          {otherNotes.length > 0 && (
            <div className="space-y-4">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <span className="text-xs font-bold uppercase tracking-wider">Other Notes</span>
                  <div className="h-px bg-[var(--border-color)] flex-1"></div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note._id || note.id}
                    note={note}
                    onEdit={handleEditNoteClick}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onTriggerAlert={triggerAlert}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Creation/Editing Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
      />
    </Layout>
  );
};

export default NotesPage;
