import React from 'react';
import { Pin, Edit2, Trash2, Calendar, Tag, Copy, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onTriggerAlert }) => {
  const { activeTheme } = useTheme();
  const isDark = activeTheme.dark;

  // Beautiful dynamic color mapping supporting dark & light adaptive modes
  const colors = isDark ? {
    indigo: "border-indigo-500/25 bg-indigo-950/15 hover:border-indigo-500/40 text-indigo-200",
    emerald: "border-emerald-500/25 bg-emerald-950/15 hover:border-emerald-500/40 text-emerald-200",
    amber: "border-amber-500/25 bg-amber-950/15 hover:border-amber-500/40 text-amber-200",
    rose: "border-rose-500/25 bg-rose-950/15 hover:border-rose-500/40 text-rose-200",
    slate: "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] text-[var(--text-main)]",
  } : {
    indigo: "border-indigo-200 bg-indigo-50/60 hover:border-indigo-300 text-indigo-700",
    emerald: "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 text-emerald-700",
    amber: "border-amber-200 bg-amber-50/60 hover:border-amber-300 text-amber-700",
    rose: "border-rose-200 bg-rose-50/60 hover:border-rose-300 text-rose-700",
    slate: "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] text-[var(--text-main)]",
  };

  // Determine card style based on color or default to slate
  const cardColorClass = colors[note.color] || colors.slate;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Copy note title and content to clipboard
  const handleCopyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    if (onTriggerAlert) {
      onTriggerAlert('success', 'Note copied to clipboard!');
    }
  };

  // Download note as plain text file (.txt)
  const handleDownloadTxt = (e) => {
    e.stopPropagation();
    const textContent = `${note.title}\n\nDate: ${formatDate(note.createdAt)}\nCategory: ${note.category || 'General'}\n\n${note.content}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onTriggerAlert) {
      onTriggerAlert('success', 'Note downloaded as text file!');
    }
  };

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl ${cardColorClass}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-semibold text-base leading-snug line-clamp-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {note.title}
          </h3>
          <button
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              note.pinned 
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                : 'text-slate-500 hover:bg-[var(--bg-card-hover)] hover:text-slate-300'
            }`}
            title={note.pinned ? "Unpin Note" : "Pin Note"}
          >
            <Pin className={`h-4 w-4 ${note.pinned ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <p className={`mt-3.5 text-sm whitespace-pre-wrap leading-relaxed break-words line-clamp-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {note.content}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-6 border-t border-[var(--border-color)] pt-4 flex items-center justify-between gap-2">
        {/* Metadata section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(note.createdAt)}</span>
          </div>
          
          {note.category && (
            <div className="inline-flex items-center gap-1 text-xs text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded-md self-start border border-[var(--accent)]/10 font-semibold">
              <Tag className="h-3 w-3" />
              <span>{note.category}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopyToClipboard}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] transition-colors"
            title="Copy Content"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDownloadTxt}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] transition-colors"
            title="Download as Text"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] transition-colors"
            title="Edit Note"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={() => onDelete(note._id || note.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
