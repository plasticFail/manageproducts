import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CURRENT_MONTH_KEY, monthAt, toggle, withAdded, without } from "../lib/utils";
import { DEFAULT_WINDOW_START, MonthHeader, MonthStepper } from "./MonthNav";
import { DataGrid, useDb, useUi } from "../components/common";
import { NO_MAPPING_COPY, UNITS, VISIBLE_MONTHS } from "../constants";
import { useEffect, useRef, useState } from "react";
import { ScheduleActionsCell, ScheduleCtx, ScheduleMonthCell } from "./cells";
import { Dash } from "../components/cells";
import { unitCellFamilies, pairLabel, activityRowId, activityRows } from "../lib/domain";

const without2 = (o, k) => {
  const { [k]: _drop, ...rest } = o;
  return rest;
};
export function ScheduleGrid({ search, windowStart, setWindowStart, sub, setSub }) {
  const { db, setDb } = useDb();
  const { notify, guardRowEdit, rowEditRef, openCreateMapping, resumeEditRef, access } = useUi();
  // Review switch: "always" = every month shows its select; "click" = rows read as chips and a clicked row opens its selects.
  const clickMode = true; // rows read as chips; clicking a row opens its selects
  const canEdit = access.schedule; // otherwise the Schedule is view only: no row editing, no Actions column
  const canMap = access.mapping; // the empty states link to Create Mapping only for people who can create one
  const isUnit = sub === "unit";
  // Every month of every row shows its select (editable personas). Choices stay a draft per row until that row is saved.
  // Coming back from Create Mapping (started from the empty dropdown): the unsaved drafts are restored.
  const resume = useRef(resumeEditRef.current && resumeEditRef.current.sub === sub ? resumeEditRef.current : null).current;
  const [drafts, setDrafts] = useState(resume ? resume.drafts : {}); // rowId -> { monthKey: [families] }
  // A row turns #003D54 only once a value has changed AND the user has clicked out of the field.
  const [committed, setCommitted] = useState(resume ? resume.committed : {}); // rowId -> bool
  const [editing, setEditing] = useState(resume ? resume.editing || null : null); // click mode: the open row
  useEffect(() => {
    resumeEditRef.current = null;
  }, []);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  // The table stays hidden for its first frame (AG Grid paints flex columns at 200px, then resizes them).
  // "readyFor" names the tab whose grid has been revealed, so a tab switch can never leave a stale flag behind.
  const [readyFor, setReadyFor] = useState(null);
  const gridReady = readyFor === sub;
  const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => setReadyFor(sub)));
  useEffect(() => {
    const t = setTimeout(() => setReadyFor(sub), 350); // fallback if AG Grid reports no size change
    return () => clearTimeout(t);
  }, [sub]);
  const months = Array.from({ length: VISIBLE_MONTHS }, (_, i) => monthAt(windowStart + i));
  const tFamilies = unitCellFamilies(db);
  const aRows = activityRows(db);
  const savedFor = (rowId, key) =>
    isUnit
      ? db.schedules.filter((s) => s.unit === rowId && s.key === key).map((s) => s.family)
      : db.activitySchedules.filter((s) => activityRowId(s.activityType, s.category) === rowId && s.key === key).map((s) => s.family);
  const sameList = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const getDraft = (rowId, key) => (drafts[rowId] && drafts[rowId][key]) ?? savedFor(rowId, key);
  const rowDirty = (rowId, from = drafts) => Object.keys(from[rowId] || {}).some((k) => !sameList(from[rowId][k], savedFor(rowId, k)));
  const anyDirty = Object.keys(drafts).some((id) => rowDirty(id));
  const resetAll = () => {
    setDrafts({});
    setCommitted({});
    setEditing(null);
  };
  const resetRow = (id) => {
    setDrafts((d) => without2(d, id));
    setCommitted((c) => without2(c, id));
  };
  // Switching tab or half-year drops any unsaved rows.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (resume) return;
    }
    resetAll();
  }, [sub, windowStart, clickMode]);
  const ctx = {
    db,
    canEdit,
    clickMode,
    editing,
    firstMonthKey: months[0].key,
    getDraft,
    getSaved: savedFor,
    rowDirty,
    noFamilies: isUnit && tFamilies.length === 0,
    createT: canMap
      ? () => {
          resumeEditRef.current = { sub, drafts: draftsRef.current, committed, editing };
          openCreateMapping({ type: "T/X", fromSchedule: true });
        }
      : null,
    optionsFor: (row) => (isUnit ? tFamilies : [...(row.families || [])].sort((a, b) => a.localeCompare(b))),
    emptyText: isUnit ? "No Product Family is mapped to Type T/X yet." : "No Product Family is mapped to this Activity Type and Category.",
    toggleDraft: (rowId, key, f) =>
      setDrafts((d) => ({ ...d, [rowId]: { ...d[rowId], [key]: toggle((d[rowId] && d[rowId][key]) ?? savedFor(rowId, key), f) } })),
    clearDraft: (rowId, key) => setDrafts((d) => ({ ...d, [rowId]: { ...d[rowId], [key]: [] } })),
    commitDraft: (rowId) => setTimeout(() => setCommitted((c) => ({ ...c, [rowId]: rowDirty(rowId, draftsRef.current) })), 0),
    cancelEdit: (rowId) => {
      resetRow(rowId);
      setEditing((e) => (e === rowId ? null : e));
    },
    saveEdit: (row) => {
      const id = row.rowId;
      const draft = drafts[id] || {};
      const keys = [...new Set([...months.map((mo) => mo.key), ...Object.keys(draft)])];
      setDb((d) => {
        if (isUnit) {
          const schedules = d.schedules.filter((s) => !(s.unit === id && keys.includes(s.key)));
          keys.forEach((key) => (draft[key] ?? savedFor(id, key)).forEach((f) => schedules.push({ unit: id, key, family: f })));
          return { ...d, schedules, changedUnits: withAdded(d.changedUnits, id) };
        }
        const activitySchedules = d.activitySchedules.filter(
          (s) => !(activityRowId(s.activityType, s.category) === id && keys.includes(s.key)),
        );
        keys.forEach((key) =>
          (draft[key] ?? savedFor(id, key)).forEach((f) =>
            activitySchedules.push({ activityType: row.activityType, category: row.category, key, family: f }),
          ),
        );
        return { ...d, activitySchedules, changedActivityRows: withAdded(d.changedActivityRows, id) };
      });
      resetRow(id);
      setEditing(null);
      notify(`Schedule updated for ${isUnit ? id : pairLabel(row.activityType, row.category)}`);
    },
  };
  // Tell the app whether any row has unsaved changes, so leaving can ask first.
  rowEditRef.current = { dirty: anyDirty, cancel: resetAll };
  useEffect(
    () => () => {
      rowEditRef.current = { dirty: false, cancel: () => {} };
    },
    [],
  );
  const term = search.trim().toLowerCase();
  const rowFlags = (id, changedList) => ({
    showSelect: canEdit && (!clickMode || editing === id), // the row shows its selects (otherwise chips)
    dirtyFill: canEdit && !!committed[id] && rowDirty(id),
    changed: changedList.includes(id),
    rev: JSON.stringify([drafts[id] || null, !!committed[id], changedList.includes(id), isUnit && tFamilies.length === 0, canEdit, clickMode, editing === id]), // changes only when this row does, so AG Grid refreshes just that row
  });
  const rows = isUnit
    ? [...UNITS] // ascending by Unit number
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .filter((h) => !db.hiddenUnits.includes(h))
        .filter(
          (h) =>
            !term ||
            h.toLowerCase().includes(term) ||
            db.schedules.some((s) => s.unit === h && s.family.toLowerCase().includes(term)) ||
            (db.fixed[h] || []).some((x) => x.name.toLowerCase().includes(term)),
        )
        .map((h) => ({ rowId: h, unit: h, ...rowFlags(h, db.changedUnits) }))
    : aRows
        .filter((r) => !term || [r.activityType, r.category, ...r.families].join(" ").toLowerCase().includes(term))
        .map((r) => ({ ...r, ...rowFlags(r.rowId, db.changedActivityRows) }));
  const noResults = !!term && rows.length === 0;
  const dotCol = {
    colId: "dot",
    headerName: "",
    width: 36,
    pinned: "left",
    cellRenderer: (p) => (p.data.changed ? <span className="row-dot" /> : null),
  };
  const labelCols = isUnit
    ? [
        dotCol,
        { field: "unit", headerName: "Unit", width: 120, pinned: "left", cellClass: "after-dot", headerClass: "after-dot" },
        // Read-only label column like Unit: same text style, left aligned.
        {
          colId: "fixed",
          headerName: "Fixed Product",
          width: 160,
          pinned: "left",
          cellRenderer: (p) => ((db.fixed[p.data.rowId] || []).map((x) => x.name).join(", ")) || <Dash />,
        },
      ]
    : [
        dotCol,
        // Activity Type + Category share the width of Unit + Fixed Product (280), so the month columns line up on both Schedule tabs.
        { field: "activityType", headerName: "Activity Type", width: 140, pinned: "left", cellClass: "after-dot", headerClass: "after-dot" },
        { field: "category", headerName: "Category", width: 140, pinned: "left" },
      ];
  const columnDefs = [
    ...labelCols,
    ...months.map((mo, mi) => ({
      field: mo.key,
      headerName: mo.label,
      flex: 1,
      minWidth: 168,
      cellClass: "month-cell",
      colSpan: mi === 0 ? (p) => (clickMode && isUnit && tFamilies.length === 0 && p.data && p.data.showSelect ? VISIBLE_MONTHS : 1) : undefined,
      headerComponent: MonthHeader,
      headerComponentParams: { current: mo.key === CURRENT_MONTH_KEY, onPrev: null, onNext: null },
      headerClass: "month-header",
      cellClassRules: {
        // the spanning "no results" message of an opened row has no select, so no white bottom line
        "cell-editing": (p) => !!(p.data && p.data.showSelect && !(clickMode && isUnit && tFamilies.length === 0)),
      },
      cellRenderer: ScheduleMonthCell,
      suppressKeyboardEvent: () => true,
    })),
    ...(canEdit ? [{ colId: "actions", headerName: "Actions", width: 120, pinned: "right", cellRenderer: ScheduleActionsCell }] : []),
  ];
  // Clicking a label cell clears the row dot. In click mode, clicking any other cell opens that row (asking first if another row has unsaved changes).
  async function onCellClicked(e) {
    const col = e.colDef.colId || e.colDef.field;
    const row = e.data;
    if (col === "dot" || col === "unit" || col === "fixed" || col === "activityType" || col === "category") {
      setDb((d) =>
        isUnit
          ? { ...d, changedUnits: without(d.changedUnits, row.rowId) }
          : { ...d, changedActivityRows: without(d.changedActivityRows, row.rowId) },
      );
      return;
    }
    if (!clickMode || !canEdit || col === "actions" || editing === row.rowId) return;
    if (editing && !(await guardRowEdit())) return;
    resetAll();
    setEditing(row.rowId);
  }
  return (
    <ScheduleCtx.Provider value={ctx}>
      <>
        <div className="modal-subheader sched-toolbar">
          <ToggleButtonGroup
            exclusive
            className="segmented"
            aria-label="Schedule by"
            value={sub}
            onChange={async (e, v) => {
              if (v && v !== sub && (await guardRowEdit())) setSub(v);
            }}
          >
            <ToggleButton value="unit">
              Unit
              {(db.changedUnits || []).length ? <span className="tab-dot" /> : null}
            </ToggleButton>
            <ToggleButton value="activity">
              Activity Type
              {(db.changedActivityRows || []).length ? <span className="tab-dot" /> : null}
            </ToggleButton>
          </ToggleButtonGroup>
          <MonthStepper
            windowStart={windowStart}
            setWindowStart={async (v) => {
              if (await guardRowEdit()) setWindowStart(v);
            }}
          />
          <Button
            variant="nav"
            disabled={months.some((m) => m.key === CURRENT_MONTH_KEY)}
            onClick={async () => {
              if (await guardRowEdit()) setWindowStart(DEFAULT_WINDOW_START);
            }}
          >
            Current month
          </Button>
        </div>
        <div className="modal-body grid-body" style={{ paddingTop: 0 }}>
          {!isUnit && aRows.length === 0 ? (
            <div className="list-empty">
              {canMap ? (
                <span>
                  {"No results found. Start by creating a Type O Mapping "}
                  <button type="button" className="text-link" onClick={() => openCreateMapping({ type: "O", fromSchedule: true })}>
                    here
                  </button>
                  .
                </span>
              ) : (
                <span>{NO_MAPPING_COPY.activity}</span>
              )}
            </div>
          ) : noResults ? (
            <div className="empty">No results found.</div>
          ) : (
            <DataGrid
              key={sub}
              className={"grid-wrap sched-grid" + (gridReady ? "" : " sizing")} // AG Grid first paints flex columns at 200px, then resizes them: keep the grid hidden for that first frame so it doesn't jump.
              onGridSizeChanged={() => !gridReady && reveal()}
              onFirstDataRendered={() => !gridReady && reveal()}
              rowHeight={48}
              rowData={rows}
              getRowId={(p) => p.data.rowId}
              columnDefs={columnDefs}
              rowClassRules={{ "row-dirty": (p) => !!p.data.dirtyFill }}
              onCellClicked={onCellClicked}
            />
          )}
        </div>
      </>
    </ScheduleCtx.Provider>
  );
}
