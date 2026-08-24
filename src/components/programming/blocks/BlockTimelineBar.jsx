import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { parseDate, addDaysISO, toISO } from '../../../utils/blockHelpers';
import { colourForBlockIndex } from '../../../utils/blockColours';
import { tintForColour } from '../../../utils/programmingColours';

const CHIP_W   = 92;
const CHIP_GAP = 6;
const PAST_WEEKS   = 3;
const FUTURE_WEEKS = 9;

function shortDate(iso) {
  return parseDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Merge this athlete's blocks into a single chronological run of 7-day
 * chips spanning `PAST_WEEKS` before today through `FUTURE_WEEKS` after —
 * a block's own weeks (coloured, numbered) where one covers the date,
 * a plain neutral chip everywhere else. No "needs attention" styling on
 * the gaps — they're just blank.
 */
function buildTimeline(blocks, todayISO) {
  const windowStart = addDaysISO(todayISO, -PAST_WEEKS * 7);
  const windowEnd    = addDaysISO(todayISO,  FUTURE_WEEKS * 7);
  const sorted = blocks.slice().sort((a, b) => a.start_date.localeCompare(b.start_date));

  const chips = [];
  let cursor = windowStart;

  const fillBlank = (fromISO, toISOExclusive) => {
    let d = fromISO;
    while (d < toISOExclusive) {
      chips.push({ type: 'blank', start: d });
      d = addDaysISO(d, 7);
    }
  };

  for (const block of sorted) {
    if (block.end_date < windowStart) continue;
    if (block.start_date > windowEnd) break;
    if (block.start_date > cursor) fillBlank(cursor, block.start_date);

    const weeks = Math.max(1, Number(block.duration_weeks) || 1);
    for (let i = 0; i < weeks; i++) {
      chips.push({
        type: 'block',
        block,
        weekIndex: i,
        weekCount: weeks,
        start: addDaysISO(block.start_date, i * 7),
      });
    }
    cursor = addDaysISO(block.end_date, 1);
  }
  if (cursor < windowEnd) fillBlank(cursor, windowEnd);

  return chips;
}

function BlockChip({ chip, colour, canEdit, isFirstOfBlock, isLastOfBlock, onClickBlock, onEditBlockDetails, onRemoveLastWeek, removeDisabled }) {
  const tint = tintForColour(colour, 0.30);
  return (
    <button
      onClick={() => onClickBlock && onClickBlock(chip.block)}
      className="group relative flex flex-col items-start justify-center text-left px-2.5 py-1.5 shrink-0 overflow-hidden transition-shadow hover:shadow-md"
      style={{ width: CHIP_W, borderRadius: 8, backgroundColor: tint, cursor: canEdit ? 'pointer' : 'default' }}
      title={`${chip.block.block_name} · Wk ${chip.weekIndex + 1}/${chip.weekCount}`}
    >
      <span className="text-[9.5px] font-bold leading-tight truncate w-full" style={{ color: colour }}>
        {chip.block.block_name}
      </span>
      <span className="text-[9.5px] leading-tight truncate w-full" style={{ color: colour, opacity: 0.85 }}>
        Wk {chip.weekIndex + 1} / {chip.weekCount}{isLastOfBlock ? ' · ends' : ''}
      </span>
      <span className="text-[9px] leading-tight mt-1.5" style={{ color: '#6b7280', opacity: 0.75 }}>
        {shortDate(chip.start)}
      </span>

      {isFirstOfBlock && canEdit && onEditBlockDetails && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onEditBlockDetails(chip.block); }}
          className="absolute top-1 right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)', color: colour }}
          title="Edit block details (name, dates, target event)"
        >
          <Pencil size={10} />
        </span>
      )}
      {isLastOfBlock && canEdit && onRemoveLastWeek && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); if (!removeDisabled) onRemoveLastWeek(chip.block); }}
          title={removeDisabled ? 'Cannot delete the only week. Delete the entire block instead.' : 'Remove this week'}
          className="absolute bottom-1 right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            width: 14, height: 14, borderRadius: 7,
            backgroundColor: removeDisabled ? '#d1d5db' : '#1C1C1C', color: '#fff',
            cursor: removeDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          <X size={9} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function BlankChip({ chip, canEdit, onBlankWeekClick, isToday }) {
  return (
    <button
      onClick={() => onBlankWeekClick && canEdit && onBlankWeekClick(chip.start)}
      className="relative flex flex-col items-center justify-center shrink-0"
      style={{
        width: CHIP_W, minHeight: 52, borderRadius: 8,
        border: '1px dashed #d1d5db', backgroundColor: 'transparent',
        cursor: canEdit && onBlankWeekClick ? 'pointer' : 'default',
      }}
      title={canEdit && onBlankWeekClick ? `Plan something for the week of ${shortDate(chip.start)}` : undefined}
    >
      {isToday && (
        <span className="absolute inset-y-0 left-1/2 w-0.5" style={{ backgroundColor: '#A58D69', top: -6, bottom: -6 }}>
          <span
            className="absolute whitespace-nowrap px-1 rounded text-[8.5px] font-bold uppercase tracking-wide"
            style={{ top: -18, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f7f1e6', color: '#8a7454' }}
          >
            Today
          </span>
        </span>
      )}
      <span className="text-[10px]" style={{ color: '#b5b5bc' }}>{shortDate(chip.start)}</span>
    </button>
  );
}

/**
 * BlockTimelineBar (Surface 1 only) — a horizontally scrollable, "today"-
 * anchored run of 7-day chips: coloured + numbered where a training block
 * covers that week, plain and blank everywhere else. Auto-scrolls on
 * mount/update so today sits near the left edge with a little of the
 * recent past still visible, and the next several weeks scrollable
 * to the right.
 *
 * Props:
 *   blocks              array
 *   canEdit             boolean
 *   onAdd               optional add-block trigger (toolbar button); null hides
 *   onClickBlock        open a block (builder)
 *   onEditBlockDetails  pencil affordance on a block's first week chip
 *   onAddWeek           (block) => void — dashed "+" chip after a block's last week
 *   onRemoveLastWeek    (block) => void
 *   onBlankWeekClick    (weekStartISO) => void — click a blank chip to plan that week
 *   showHeading         whether to render the small "PROGRAMMING TIMELINE" caption
 */
export default function BlockTimelineBar({
  blocks = [],
  canEdit = true,
  onAdd,
  onClickBlock,
  onEditBlockDetails,
  onAddWeek,
  onRemoveLastWeek,
  onBlankWeekClick,
  showHeading = false,
}) {
  const scrollRef = useRef(null);
  const todayISO = useMemo(() => toISO(new Date()), []);

  const indexById = useMemo(() => {
    const ordered = blocks.slice().sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        || a.start_date.localeCompare(b.start_date),
    );
    const m = new Map();
    ordered.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [blocks]);

  const chips = useMemo(() => buildTimeline(blocks, todayISO), [blocks, todayISO]);

  // Index of the chip whose week contains today, so we can mark it and
  // scroll it into view.
  const todayChipIndex = useMemo(() => {
    let idx = chips.findIndex(c => {
      const end = addDaysISO(c.start, 6);
      return todayISO >= c.start && todayISO <= end;
    });
    if (idx < 0) idx = chips.length - 1;
    return idx;
  }, [chips, todayISO]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = todayChipIndex * (CHIP_W + CHIP_GAP) - (CHIP_W + CHIP_GAP);
    el.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
  }, [todayChipIndex, chips.length]);

  return (
    <section className="space-y-1.5">
      {showHeading && (
        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
          Programming Timeline
        </h3>
      )}

      <div className="flex items-stretch gap-2">
        <div
          ref={scrollRef}
          className="flex-1 flex overflow-x-auto rounded p-2"
          style={{ gap: CHIP_GAP, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', scrollBehavior: 'smooth' }}
        >
          {chips.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-3 text-[11px]" style={{ color: '#9ca3af' }}>
              {canEdit && onAdd ? 'No blocks yet — add a block to start structuring training' : 'No blocks for this athlete'}
            </div>
          ) : (
            chips.map((chip) => {
              if (chip.type === 'blank') {
                const end = addDaysISO(chip.start, 6);
                const isToday = todayISO >= chip.start && todayISO <= end;
                return (
                  <BlankChip
                    key={`blank-${chip.start}`}
                    chip={chip}
                    canEdit={canEdit}
                    onBlankWeekClick={onBlankWeekClick}
                    isToday={isToday}
                  />
                );
              }
              const colour = colourForBlockIndex(indexById.get(chip.block.id) ?? 0);
              const isLastOfBlock = chip.weekIndex === chip.weekCount - 1;
              const isFirstOfBlock = chip.weekIndex === 0;
              const end = addDaysISO(chip.start, 6);
              const chipIsToday = todayISO >= chip.start && todayISO <= end;
              return (
                <Fragment key={`${chip.block.id}-wk-${chip.weekIndex}`}>
                  <div className="relative shrink-0" style={{ width: CHIP_W }}>
                    {chipIsToday && (
                      <span className="absolute w-0.5" style={{ backgroundColor: '#A58D69', top: -6, bottom: -6, left: '50%' }}>
                        <span
                          className="absolute whitespace-nowrap px-1 rounded text-[8.5px] font-bold uppercase tracking-wide"
                          style={{ top: -18, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#f7f1e6', color: '#8a7454' }}
                        >
                          Today
                        </span>
                      </span>
                    )}
                    <BlockChip
                      chip={chip}
                      colour={colour}
                      canEdit={canEdit}
                      isFirstOfBlock={isFirstOfBlock}
                      isLastOfBlock={isLastOfBlock}
                      onClickBlock={onClickBlock}
                      onEditBlockDetails={onEditBlockDetails}
                      onRemoveLastWeek={onRemoveLastWeek}
                      removeDisabled={chip.weekCount === 1}
                    />
                  </div>
                  {isLastOfBlock && canEdit && onAddWeek && (
                    <button
                      onClick={() => onAddWeek(chip.block)}
                      title="Add a week"
                      className="shrink-0 flex items-center justify-center transition-colors hover:bg-gray-100"
                      style={{
                        width: 22, borderRadius: 6, border: '1px dashed #d1d5db', color: '#6b7280', background: 'transparent',
                      }}
                    >
                      <Plus size={11} />
                    </button>
                  )}
                </Fragment>
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
