import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { IconButton } from "@mui/material";
import { MONTH_NAMES, VISIBLE_MONTHS } from "../constants";
import { monthAt } from "../lib/utils";

export function MonthHeader({ displayName, current, onPrev, onNext, prevLabel, nextLabel }) {
  return (
    <div className={"month-hd" + (current ? " is-current" : "")}>
      {onPrev ? (
        <IconButton className="month-nav month-nav-prev" size="small" onClick={onPrev} aria-label={prevLabel} title={prevLabel}>
          <ChevronLeft />
        </IconButton>
      ) : null}
      <span className="month-hd-text">{displayName}</span>
      {onNext ? (
        <IconButton className="month-nav month-nav-next" size="small" onClick={onNext} aria-label={nextLabel} title={nextLabel}>
          <ChevronRight />
        </IconButton>
      ) : null}
    </div>
  );
}
const monthName = (k) => MONTH_NAMES[Number(k.split("-")[1])];
const yearOf = (k) => k.split("-")[0];
// Schedule tab: a half-year (6 months) at a time, Jan – Jun or Jul – Dec. The navigator sits under the Unit / Activity Type tabs and is shared by both.
// "Current month" is enabled only while the current month is out of view; it returns to the current half-year.
export const DEFAULT_WINDOW_START = 30;
// Jul 2026 (offset in months from Jan 2024); always a multiple of 6
const halfLabel = (start) => {
  const a = monthAt(start),
    b = monthAt(start + VISIBLE_MONTHS - 1);
  return yearOf(a.key) === yearOf(b.key) ? `${monthName(a.key)} – ${b.label}` : `${a.label} – ${b.label}`;
};
export function MonthStepper({ windowStart, setWindowStart }) {
  const prev = windowStart - VISIBLE_MONTHS,
    next = windowStart + VISIBLE_MONTHS;
  return (
    <div className="month-stepper">
      <IconButton
        className="month-step"
        aria-label={`Show ${halfLabel(prev)}`}
        title={`Show ${halfLabel(prev)}`}
        onClick={() => setWindowStart(prev)}
      >
        <ChevronLeft />
      </IconButton>
      <div className="month-range" aria-live="polite">
        {halfLabel(windowStart)}
      </div>
      <IconButton
        className="month-step"
        aria-label={`Show ${halfLabel(next)}`}
        title={`Show ${halfLabel(next)}`}
        onClick={() => setWindowStart(next)}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
}
