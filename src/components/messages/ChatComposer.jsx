import { useEffect, useRef } from 'react';
import { Send, Loader2, X } from 'lucide-react';

/**
 * ChatComposer — the message box under every chat: a grey pill that grows with
 * what you type, and a round gold send button. On a computer, Enter sends and
 * Shift+Enter adds a line; on a phone, Enter is a new line and the button sends.
 */
export default function ChatComposer({ value, onChange, onSubmit, sending = false, error = null, placeholder = 'Write a message…', note = null, replyTo = null, onClearReply }) {
  const ref = useRef(null);

  // Grow with the text, up to about five lines.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  const onKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    if (window.matchMedia?.('(min-width: 768px)').matches) { e.preventDefault(); onSubmit(e); }
  };

  const canSend = value.trim() && !sending;

  return (
    <form onSubmit={onSubmit} className="px-4 pt-3 pb-3 border-t border-gray-100 bg-white shrink-0">
      {error && <p className="text-xs text-red-600 mb-2 px-1" role="alert">{error}</p>}
      {replyTo && (
        <div className="mb-2 flex items-stretch rounded-xl overflow-hidden" style={{ backgroundColor: '#f1f2f3' }}>
          <span className="w-1 shrink-0" style={{ backgroundColor: '#A58D69' }} />
          <span className="flex-1 min-w-0 px-2.5 py-1.5">
            <span className="block text-[12px] font-bold" style={{ color: '#7a6748' }}>{replyTo.label}</span>
            <span className="block text-[13px] text-gray-600 truncate">{replyTo.text || 'Photo'}</span>
          </span>
          {replyTo.thumb && <img src={replyTo.thumb} alt="" className="w-12 object-cover shrink-0" />}
          <button type="button" onClick={onClearReply} aria-label="Cancel reply" className="px-2 text-gray-400 hover:text-gray-700"><X size={15} /></button>
        </div>
      )}
      <div className="flex items-end gap-2.5">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-[22px] px-4 py-[11px] text-[15px] leading-snug text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A58D69]/40"
          style={{ backgroundColor: '#f1f2f3', maxHeight: 128 }}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#A58D69' }}
        >
          {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} style={{ marginLeft: -1 }} />}
        </button>
      </div>
      {note && <p className="text-[10px] text-gray-400 mt-2 px-1 leading-snug">{note}</p>}
    </form>
  );
}
