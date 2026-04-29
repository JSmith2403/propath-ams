import { useMemo } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { parseDate, addDaysISO } from '../../../utils/blockHelpers';
import { colourForBlockIndex } from '../../../utils/blockColours';
import { tintForColour } from '../../../utils/programmingColours';

const BAR_HEIGHT  = 32;
const STRIP_GAP   = 4;
const STRIP_HEIGHT = 32;
const ROW_HEIGHT  = BAR_HEIGHT + STRIP_GAP + STRIP_HEIGHT;
const PILL_GAP_PX = 2;

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function shortDate(iso) {
  return parseDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Week pill ───────────────────────────────────────────────────────────────
function WeekPill({
  weekNum,
  weekStartISO,
  weekEndISO,
  colour,
  isLast,
  canEdit,
  onHover,
  onRemove,
  removeDisabled,
}) {
  const tint  = tintForColour(colour, 0.30);
  const enter = () => onHover && onHover({ start_date: weekStartISO, end_date: weekEndISO, colour });
  const leave = () => onHover && onHover(null);

  return (
    <div
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="group relative flex flex-col items-center justify-center text-center px-1 overflow-hidden cursor-default"
      style={{
        flex: 1,
        backgroundColor: tint,
        color: '#1C1C1C',
        borderRadius: 4,
        minWidth: 0,
        height: STRIP_HEIGHT,
      }}
      title={`Week ${weekNum} · ${shortDate(weekStartISO)}`}
    >
      <span className="text-[10px] font-bold leading-tight truncate w-full">
        Wk {weekNum}
      </span>
      <span className="text-[9px] leading-tight truncate w-full" style={{ opacity: 0.65 }}>
        {shortDate(weekStartISO)}
      </span>

      {/* × on the LAST week pill, hover-revealed. Disabled if it's the
          only week in the block (caller passes removeDisabled=true). */}
      {isLast && canEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); if (!removeDisabled && onRemove) onRemove(); }}
          disabled={removeDisabled}
          title={removeDisabled
            ? 'Cannot delete the only week. Delete the entire block instead.'
            : 'Remove this week'}
          className="absolute top-0.5 right-0.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: removeDisabled ? '#d1d5db' : '#1C1C1C',
            color: '#fff',
            cursor: removeDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          <X size={9} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

// ─── Add-week pill ───────────────────────────────────────────────────────────
function AddWeekPill({ canEdit, onClick }) {
  if (!canEdit) return null;
  return (
    <button
      onClick={onClick}
      title="Add a week"
      className="flex items-center justify-center text-[10px] transition-colors hover:bg-gray-100"
      style={{
        flex: 1,
        minWidth: 0,
        height: STRIP_HEIGHT,
        border: '1px dashed #d1d5db',
        borderRadius: 4,
        color: '#6b7280',
        background: 'transparent',
      }}
    >
      <Plus size={12} />
    </button>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * BlockTimelineBar — proportional horizontal bar of training blocks with a
 * week strip beneath each one.
 *
 * Hover the bar → onHoverRange fires with the full block range.
 * Hover a week pill → onHoverRange fires with that week's 7-day range.
 * Click the bar → onClickBlock (Edit modal).
 * Click [+] in the strip → onAddWeek(block).
 * Click × on the last week → onRemoveLastWeek(block) (caller shows confirm).
 *
 * Props:
 *   blocks            array
 *   canEdit           boolean
 *   onAdd             optional add-block trigger (timeline button); null hides
 *   onClickBlock      block edit
 *   onHoverRange      (range | null) — { start_date, end_date, colour }
 *   onAddWeek         (block) => void
 *   onRemoveLastWeek  (block) => void
 *   rowLabel          optional left-side label (athlete name on Surface 2)
 *   rowBackground     optional background for the row label area
 *   showHeading       whether to render the small "BLOCK TIMELINE" caption
 */
export default function BlockTimelineBar({
  blocks = [],
  canEdit = true,
  onAdd,
  onClickBlock,
  onEditBlockDetails,   // pencil-hover affordance — secondary action (Brief 5a)
  onHoverRange,
  onAddWeek,
  onRemoveLastWeek,
  rowLabel,
  rowBackground,
  showHeading = false,
}) {
  // Palette assignment is by display_order ascending so the same block
  // keeps the same colour across renders.
  const indexById = useMemo(() => {
    const ordered = blocks.slice().sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        || a.start_date.localeCompare(b.start_date),
    );
    const m = new Map();
    ordered.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [blocks]);

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
            height: ROW_HEIGHT,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
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
            layout.items.map(item => {
              const { block, leftPct, widthPct, colour } = item;
              const weeks = Math.max(1, Number(block.duration_weeks) || 1);
              const isOnlyWeek = weeks === 1;
              const onHoverBar = (val) =>
                onHoverRange && onHoverRange(val
                  ? { start_date: block.start_date, end_date: block.end_date, colour }
                  : null);

              return (
                <div
                  key={block.id}
                  className="absolute"
                  style={{
                    left:  `${leftPct}%`,
                    width: `${widthPct}%`,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  {/* Block bar — top. Click opens the session builder
                      for this athlete's snapshot; pencil hover-button
                      opens the secondary block-details modal (name,
                      dates, target event). */}
                  <div
                    className="group/bar absolute left-0 right-0"
                    style={{ top: 0, height: BAR_HEIGHT }}
                    onMouseEnter={() => onHoverBar(true)}
                    onMouseLeave={() => onHoverBar(false)}
                  >
                    <button
                      onClick={() => canEdit && onClickBlock && onClickBlock(block)}
                      className="absolute inset-0 flex items-center px-2.5 text-[11px] font-semibold text-white overflow-hidden transition-shadow hover:shadow-md"
                      style={{
                        backgroundColor: colour,
                        textAlign: 'left',
                        cursor: canEdit ? 'pointer' : 'default',
                        borderRadius: 4,
                      }}
                      title={`${block.block_name} · ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`}
                    >
                      <span className="truncate">
                        {block.block_name} · {weeks}w
                      </span>
                    </button>
                    {canEdit && onEditBlockDetails && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditBlockDetails(block); }}
                        className="absolute top-1/2 -translate-y-1/2 right-1.5 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity"
                        style={{
                          width: 22, height: 22, borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.20)',
                          color: '#fff',
                        }}
                        title="Edit block details (name, dates, target event)"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>

                  {/* Week strip — bottom */}
                  <div
                    className="absolute left-0 right-0 flex"
                    style={{
                      top: BAR_HEIGHT + STRIP_GAP,
                      height: STRIP_HEIGHT,
                      gap: PILL_GAP_PX,
                    }}
                  >
                    {Array.from({ length: weeks }, (_, i) => {
                      const wkStart = addDaysISO(block.start_date, i * 7);
                      const wkEnd   = addDaysISO(block.start_date, (i + 1) * 7 - 1);
                      const isLast  = i === weeks - 1;
                      return (
                        <WeekPill
                          key={`${block.id}-wk-${i}`}
                          weekNum={i + 1}
                          weekStartISO={wkStart}
                          weekEndISO={wkEnd}
                          colour={colour}
                          isLast={isLast}
                          canEdit={canEdit}
                          onHover={onHoverRange}
                          onRemove={() => onRemoveLastWeek && onRemoveLastWeek(block)}
                          removeDisabled={isOnlyWeek}
                        />
                      );
                    })}
                    <AddWeekPill
                      canEdit={canEdit}
                      onClick={() => onAddWeek && onAddWeek(block)}
                    />
                  </div>
                </div>
              );
            })
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
