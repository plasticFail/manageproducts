import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CURRENT_MONTH_KEY, monthAt, toggle, withAdded, without } from "../lib/utils";
import { DEFAULT_WINDOW_START, MonthHeader, MonthStepper } from "./MonthNav";
import { DataGrid, useDb, useUi } from "../components/common";
import { UNITS, VISIBLE_MONTHS } from "../constants";
import { useEffect, useRef, useState } from "react";
import { ScheduleActionsCell, ScheduleCtx, ScheduleMonthCell } from "./cells";
import { Dash } from "../components/cells";
import { unitCellFamilies, pairLabel, activityRowId, activityRows } from "../lib/domain";

export function ScheduleGrid({ search, windowStart, setWindowStart, sub, setSub }) {
  const { db, setDb } = useDb();
  const { notify, guardRowEdit, rowEditRef, openCreateMapping, resumeEditRef } = useUi();
  const isUnit = sub === "unit";
  // Coming back from Create Mapping (started from this row): the row reopens with its unsaved choices.
  const resume = useRef(resumeEditRef.current && resumeEditRef.current.sub === sub ? resumeEditRef.current : null).current;
  const [editing, setEditing] = useState(resume ? resume.rowId : null);
  const [draft, setDraft] = useState(resume ? resume.draft : {});
  // Row turns #003D54 only once a value has changed AND the user has clicked out of the field.
  const [committed, setCommitted] = useState(resume ? resume.committed : false);
  useEffect(() => {
    resumeEditRef.current = null;
  }, []);
  const draftRef = useRef(draft);
  draftRef.current = draft;
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
  const initialDraftFor = (rowId, key) => savedFor(rowId, key);
  const getDraft = (key) => draft[key] ?? initialDraftFor(editing, key);
  const resetEdit = () => {
    setEditing(null);
    setCommitted(false);
    setDraft({});
  };
  // Switching tab or half-year closes any open row.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (resume) return;
    }
    resetEdit();
  }, [sub, windowStart]);
  const ctx = {
    db,
    editing,
    dirty: Object.keys(draft).length > 0,
    getDraft,
    getSaved: savedFor,
    noFamilies: isUnit && tFamilies.length === 0,
    firstMonthKey: months[0].key,
    createT: () => {
      resumeEditRef.current = { sub, rowId: editing, draft: draftRef.current, committed };
      openCreateMapping({ type: "T/X", fromSchedule: true });
    },
    optionsFor: (row) => (isUnit ? tFamilies : [...(row.families || [])].sort((a, b) => a.localeCompare(b))),
    emptyText: isUnit ? "No Product Family is mapped to Type T/X yet." : "No Product Family is mapped to this Activity Type and Category.",
    toggleDraft: (key, f) => setDraft((d) => ({ ...d, [key]: toggle(d[key] ?? initialDraftFor(editing, key), f) })),
    clearDraft: (key) => setDraft((d) => ({ ...d, [key]: [] })),
    commitDraft: () =>
      setTimeout(() => {
        const d = draftRef.current;
        const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
        setCommitted(Object.keys(d).some((key) => !same(d[key], initialDraftFor(editing, key))));
      }, 0),
    cancelEdit: resetEdit,
    saveEdit: (row) => {
      const id = row.rowId;
      const keys = [...new Set([...months.map((mo) => mo.key), ...Object.keys(draft)])];
      setDb((d) => {
        if (isUnit) {
          const schedules = d.schedules.filter((s) => !(s.unit === id && keys.includes(s.key)));
          keys.forEach((key) => (draft[key] ?? initialDraftFor(id, key)).forEach((f) => schedules.push({ unit: id, key, family: f })));
          return { ...d, schedules, changedUnits: withAdded(d.changedUnits, id) };
        }
        const activitySchedules = d.activitySchedules.filter(
          (s) => !(activityRowId(s.activityType, s.category) === id && keys.includes(s.key)),
        );
        keys.forEach((key) =>
          (draft[key] ?? initialDraftFor(id, key)).forEach((f) =>
            activitySchedules.push({ activityType: row.activityType, category: row.category, key, family: f }),
          ),
        );
        return { ...d, activitySchedules, changedActivityRows: withAdded(d.changedActivityRows, id) };
      });
      resetEdit();
      notify(`Schedule updated for ${isUnit ? id : pairLabel(row.activityType, row.category)}`);
    },
  };
  // Tell the app whether this row has unsaved changes, so leaving can ask first.
  const sameList = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  rowEditRef.current = {
    dirty: !!editing && Object.keys(draft).some((k) => !sameList(draft[k], initialDraftFor(editing, k))),
    cancel: resetEdit,
  };
  useEffect(
    () => () => {
      rowEditRef.current = { dirty: false, cancel: () => {} };
    },
    [],
  );
  const term = search.trim().toLowerCase();
  const rowFlags = (id, changedList) => ({
    editing: editing === id,
    dirtyFill: editing === id && committed,
    changed: changedList.includes(id),
    rev: Math.random(),
  });
  const rows = isUnit
    ? UNITS.filter((h) => !db.hiddenUnits.includes(h))
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
    cellStyle: { textAlign: "center" },
    cellRenderer: (p) => (p.data.changed ? <span className="row-dot" /> : null),
  };
  const labelCols = isUnit
    ? [
        dotCol,
        { field: "unit", headerName: "Unit", width: 100, pinned: "left" },
        // Read-only label column like Unit: same text style, left aligned.
        {
          colId: "fixed",
          headerName: "Fixed Product",
          width: 220,
          pinned: "left",
          cellRenderer: (p) => ((db.fixed[p.data.rowId] || []).map((x) => x.name).join(", ")) || <Dash />,
        },
      ]
    : [
        dotCol,
        { field: "activityType", headerName: "Activity Type", width: 160, pinned: "left" },
        { field: "category", headerName: "Category", width: 160, pinned: "left" },
      ];
  const columnDefs = [
    ...labelCols,
    ...months.map((mo, mi) => ({
      field: mo.key,
      colSpan: mi === 0 ? (p) => (isUnit && tFamilies.length === 0 && p.data && p.data.editing ? VISIBLE_MONTHS : 1) : undefined,
      headerName: mo.label,
      flex: 1,
      minWidth: 168,
      cellClass: "month-cell",
      headerComponent: MonthHeader,
      headerComponentParams: { current: mo.key === CURRENT_MONTH_KEY, onPrev: null, onNext: null },
      headerClass: "month-header",
      cellClassRules: { "cell-editing": (p) => p.data.editing },
      cellRenderer: ScheduleMonthCell,
      suppressKeyboardEvent: () => true,
    })),
    { colId: "actions", headerName: "Actions", width: 90, pinned: "right", cellRenderer: ScheduleActionsCell },
  ];
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
    if (col === "actions" || editing === row.rowId) return;
    if (editing && !(await guardRowEdit())) return;
    setEditing(row.rowId);
    setCommitted(false);
    setDraft({});
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
            <ToggleButton value="unit">Unit</ToggleButton>
            <ToggleButton value="activity">Activity Type</ToggleButton>
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
              <span>
                {"No results found. Start by creating a Type O Mapping "}
                <button type="button" className="text-link" onClick={() => openCreateMapping({ type: "O", fromSchedule: true })}>
                  here
                </button>
                .
              </span>
            </div>
          ) : noResults ? (
            <div className="empty">No results found.</div>
          ) : (
            <DataGrid
              key={sub}
              className={"grid-wrap sched-grid" + (gridReady ? "" : " sizing")} // AG Grid first paints flex columns at 200px, then resizes them: keep the grid hidden for that first frame so it doesn't jump.
              onGridSizeChanged={() => !gridReady && reveal()}
              onFirstDataRendered={() => !gridReady && reveal()}
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
