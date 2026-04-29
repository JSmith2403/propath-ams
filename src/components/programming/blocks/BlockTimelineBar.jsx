import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { parseDate } from '../../../utils/blockHelpers';
import { colourForBlockIndex } from '../../../utils/blockColours';

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * BlockTimelineBar — proportional horizontal bar of training blocks.
 *
 * Bars are sized by date range so gaps between sequential blocks render
 * as empty space. Each bar's colour is deterministic by display_order.
 *
 * Hover a bar → onHoverBlock(block) fires with the block + its colour
 * attached, so the calendar above can paint a faint range tint. Mouseout
 * fires onHoverBlock(null).
 *
 * Click a bar → onClickBlock(block) — typically opens the Edit modal.
 *
 * Props:
 *   blocks           array of training_blocks rows for this row
 *   canEdit          gates click + add behaviours
 *   onAdd            optional add handler — Surface 2 omits this
 *   onClickBlock     edit-modal opener
 *   onHoverBlock     (block | null) — fires with `_colour` attached on
 *                    enter, null on leave
 *   rowLabel         optional left-side label (athlete name on Surface 2)
 *   rowBackground    optional row background tint (athlete colour on S2)
 *   showHeading      whether to render the small "BLOCK TIMELINE" caption
 */
export default function BlockTimelineBar({
  blocks = [],
  canEdit = true,
  onAdd,
  onClickBlock,
  onHoverBlock,
  rowLabel,
  rowBackground,
  showHeading = false,
}) {
  // Palette is assigned by display_order ascending (creation order).
  const indexById = useMemo(() => {
    const ordered = blocks.slice().sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        || a.start_date.localeCompare(b.start_date),
    );
    const m = new Map();
    ordered.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [blocks]);

  // Layout uses chronological order so bars sit left-to-right by date.
  const layout = useMemo(() => {
    if (blocks.length === 0) return { items: [] };
    const sorted = blocks.slice().sort((a, b) => a.start_date.localeCompare(b.start_date));
    const earliest = parseDate(sorted[0].start_date);
    let latestEnd = parseDate(sorted[0].end_date);
    sorted.forEach(b => {
      const e = parseDate(b.end_date);
      if (e > latestEnd) latestEnd = e;
    });
    const totalDays = daysBetween(earliest, latestEnd) + 1;

    const items = sorted.map(b => {
      const start = parseDate(b.start_date);
      const end   = parseDate(b.end_date);
      const startDay  = daysBetween(earliest, start);
      const blockDays = daysBetween(start, end) + 1;
      return {
        block: b,
        leftPct:  (startDay  / totalDays) * 100,
        widthPct: (blockDays / totalDays) * 100,
        colour:   colourForBlockIndex(indexById.get(b.id) ?? 0),
      };
    });
    return { items };
  }, [blocks, indexById]);

  return (
    <section className="space-y-1.5">
      {showHeading && (
        <h3
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#9ca3af' }}
        >
          Block Timeline
        </h3>
      )}

      <div className="flex items-stretch gap-2">
        {rowLabel && (
          <div
            className="shrink-0 flex items-center px-3 text-[11px] font-semibold rounded truncate"
            style={{
              width: 130,
              color: '#1C1C1C',
              backgroundColor: rowBackground || '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
            title={rowLabel}
          >
            {rowLabel}
          </div>
        )}

        <div
          className="flex-1 relative rounded"
          style={{
            height: 36,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {layout.items.length === 0 ? (
            <div
              className="absolute inset-0 flex items-center justify-center px-3 text-[11px]"
              style={{ color: '#9ca3af' }}
            >
              {canEdit && onAdd
                ? "No blocks yet — add a block to start structuring training"
                : "No blocks for this athlete"}
            </div>
          ) : (
            layout.items.map(item => (
              <button
                key={item.block.id}
                onClick={() => canEdit && onClickBlock && onClickBlock(item.block)}
                onMouseEnter={() => onHoverBlock && onHoverBlock({ ...item.block, _colour: item.colour })}
                onMouseLeave={() => onHoverBlock && onHoverBlock(null)}
                className="absolute top-0 bottom-0 flex items-center px-2.5 text-[11px] font-semibold text-white overflow-hidden transition-all"
                style={{
                  left:  `${item.leftPct}%`,
                  width: `${item.widthPct}%`,
                  backgroundColor: item.colour,
                  textAlign: 'left',
                  cursor: canEdit ? 'pointer' : 'default',
                  borderRight: '1px solid rgba(255,255,255,0.25)',
                }}
                onMouseDown={(e) => {
                  // Subtle press feedback
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
                onMouseLeaveCapture={(e) => { e.currentTarget.style.transform = ''; }}
                title={`${item.block.block_name} · ${item.block.duration_weeks} ${item.block.duration_weeks === 1 ? 'week' : 'weeks'}`}
              >
                <span className="truncate">
                  {item.block.block_name} · {item.block.duration_weeks}w
                </span>
              </button>
            ))
          )}
        </div>

        {canEdit && onAdd && (
          <button
            onClick={onAdd}
            className="shrink-0 flex items-center gap-1.5 px-3 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            <Plus size={13} />
            Add Block
          </button>
        )}
      </div>
    </section>
  );
}
