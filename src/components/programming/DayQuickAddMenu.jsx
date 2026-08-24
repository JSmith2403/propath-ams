import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardPaste } from 'lucide-react';

/**
 * DayQuickAddMenu — hover-revealed menu on a blank calendar day.
 *
 * Rendered via ProgrammeCalendar's `renderDayHover(iso, { keepAlive, release })`
 * hook, portaled to <body> (the day cell has overflow:hidden, so an inline
 * absolutely-positioned menu would get clipped).
 *
 * Because the portal renders outside the cell's DOM subtree, leaving the
 * cell to move the mouse toward the menu would normally look like "mouse
 * left the day" and close it before the click lands. `keepAlive`/`release`
 * bridge that gap: the cell's mouseleave starts a short grace-period timer
 * instead of clearing immediately, and this menu's own mouseenter cancels
 * it, so crossing the small screen-space gap between cell and menu doesn't
 * dismiss it.
 */
export default function DayQuickAddMenu({
  dateISO,
  clipboard,
  onPlanSession,
  onPlanWeek,
  onPlanBlock,
  onPaste,
  keepAlive,
  release,
}) {
  const anchorRef = useRef(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
  }, []);

  const MENU_W = 184;
  const left = rect ? Math.min(rect.left, window.innerWidth - MENU_W - 8) : 0;
  const top  = rect ? rect.bottom + 4 : 0;

  const item = (label, onClick) => (
    <button
      onClick={onClick}
      className="w-full px-3 py-1.5 text-[11px] text-left hover:bg-gray-50 transition-colors"
      style={{ color: '#1C1C1C' }}
    >
      {label}
    </button>
  );

  return (
    <>
      <span ref={anchorRef} className="absolute top-1 right-1 w-px h-px" aria-hidden="true" />
      {rect && createPortal(
        <div
          onMouseEnter={keepAlive}
          onMouseLeave={release}
          className="rounded-lg shadow-lg bg-white py-1"
          style={{ position: 'fixed', top, left, width: MENU_W, border: '1px solid #e5e7eb', zIndex: 60 }}
        >
          {clipboard && (
            <>
              <button
                onClick={() => onPaste(dateISO)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-left hover:bg-gray-50 transition-colors"
                style={{ color: '#437E8D' }}
              >
                <ClipboardPaste size={12} className="shrink-0" />
                <span className="truncate">Paste &lsquo;{clipboard.name}&rsquo;</span>
              </button>
              <div className="my-1 border-t border-gray-100" />
            </>
          )}
          {item('Plan for 1 Session', () => onPlanSession(dateISO))}
          {item('Plan for a week', () => onPlanWeek(dateISO))}
          {item('Plan for a block', () => onPlanBlock(dateISO))}
        </div>,
        document.body,
      )}
    </>
  );
}
