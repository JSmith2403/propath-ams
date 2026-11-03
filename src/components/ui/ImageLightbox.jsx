import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ImageLightbox — shows a photo full-size on top of the app instead of opening a new browser tab.
 * Close it with the X (top right, phone and desktop), by tapping/clicking anywhere off the photo, or Esc.
 * Several photos: arrows (or ← →) move between them.
 *
 *   <ImageLightbox images={[url, …]} index={i} onIndex={setI} onClose={() => setI(null)} />
 */
export default function ImageLightbox({ images, index = 0, onIndex, onClose, alt = 'Photo' }) {
  const list = (images || []).filter(Boolean);
  const many = list.length > 1;
  const i = Math.min(Math.max(index, 0), Math.max(list.length - 1, 0));

  const go = (delta) => { if (many && onIndex) onIndex((i + delta + list.length) % list.length); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';                       // keep the page behind from scrolling
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }); // re-bound each render so the arrow keys see the current photo

  if (!list.length) return null;

  const stop = (e) => e.stopPropagation();
  const btn = 'flex items-center justify-center rounded-full text-white';
  const btnStyle = { width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.55)' };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 300, backgroundColor: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={alt}
    >
      <button
        type="button" onClick={(e) => { stop(e); onClose(); }} aria-label="Close photo"
        className={`absolute ${btn}`}
        style={{ ...btnStyle, top: 'max(12px, env(safe-area-inset-top))', right: 'max(12px, env(safe-area-inset-right))' }}
      >
        <X size={22} />
      </button>

      {many && (
        <>
          <button type="button" onClick={(e) => { stop(e); go(-1); }} aria-label="Previous photo"
            className={`absolute ${btn}`} style={{ ...btnStyle, left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <ChevronLeft size={24} />
          </button>
          <button type="button" onClick={(e) => { stop(e); go(1); }} aria-label="Next photo"
            className={`absolute ${btn}`} style={{ ...btnStyle, right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <ChevronRight size={24} />
          </button>
          <p className="absolute left-0 right-0 text-center text-xs font-semibold text-white/80" style={{ bottom: 'max(14px, env(safe-area-inset-bottom))' }}>
            {i + 1} / {list.length}
          </p>
        </>
      )}

      <img
        src={list[i]} alt={alt} onClick={stop} draggable={false}
        style={{ maxWidth: '96vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
      />
    </div>,
    document.body,
  );
}
