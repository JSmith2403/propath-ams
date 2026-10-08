import { useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * ChatComposer — the message box under every chat: a grey pill that grows with
 * what you type, and a round black send button. On a computer, Enter sends and
 * Shift+Enter adds a line; on a phone, Enter is a new line and the button sends.
 */
export default function ChatComposer({ value, onChange, onSubmit, sending = false, error = null, placeholder = 'Write a message…', note = null }) {
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
      <div className="flex items-end gap-2.5">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={2000}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-[22px] px-4 py-[11px] text-[15px] leading-snug text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          style={{ backgroundColor: '#f1f2f3', maxHeight: 128 }}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-35"
          style={{ backgroundColor: '#000' }}
        >
          {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} style={{ marginLeft: -1 }} />}
        </button>
      </div>
      {note && <p className="text-[10px] text-gray-400 mt-2 px-1 leading-snug">{note}</p>}
    </form>
  );
}
