import { Dash, FamilyCell, FamilyTag, sortCols } from "./cells";
import { DataGrid } from "./common";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import { scheduleUsage } from "../lib/domain";
import { isCategoryType, typeCodeKey, typeCodeLabel } from "../lib/utils";

export function mappingColumns(db, { withMeta, onEdit, onDelete, readOnly = false, sort, onSort }) {
  const cols = [];
  if (withMeta) {
    cols.push(
      {
        colId: "dot",
        headerName: "",
        width: 36,
        cellRenderer: (p) => (db.changedMappings.includes(p.data.id) ? <span className="row-dot" /> : null),
      },
      ...sortCols(sort, onSort),
    );
  }
  cols.push(
    { colId: "type", headerName: "Type - Code", width: 240, valueGetter: (p) => typeCodeLabel(typeCodeKey(p.data)) },
    { field: "activityType", headerName: "Activity Type", width: 160, cellRenderer: (p) => p.value || <Dash /> },
    { colId: "families", headerName: "Mapped to", flex: 1, minWidth: 200, cellRenderer: (p) => <FamilyCell db={db} m={p.data} /> },
  );
  if (withMeta && !readOnly) {
    cols.push({
      colId: "actions",
      headerName: "Actions",
      width: 120,
      cellRenderer: (p) => (
        <div className="action-cell">
          <IconButton className="icon-action" title="Edit" onClick={() => onEdit(p.data.id)}>
            <EditOutlined />
          </IconButton>
          <IconButton className="icon-action" title="Delete" onClick={() => onDelete(p.data.id)}>
            <DeleteOutlined />
          </IconButton>
        </div>
      ),
    });
  }
  return cols;
}
function MappingPreview({ db, m }) {
  return (
    <DataGrid
      className="preview-grid"
      autoHeight
      rowData={[m]}
      getRowId={(p) => String(p.data.id)}
      columnDefs={mappingColumns(db, { withMeta: false })}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
export const UndoNote = () => <p className="undo-note">This action cannot be undone.</p>;
// A confirmation table always has the maximum height (300px): rows scroll under a fixed header once they overflow, and below the last row the table shows the #1f1f1f placeholder fill, even with a single row.
function ScrollPreviewGrid({ maxHeight = 300, ...props }) {
  return <DataGrid className="preview-grid" {...props} style={{ height: maxHeight, ...props.style }} />;
}
// "Type - Code O, Activity Type Alpha:" — parameter names in the input-label colour, values in text colour.
export const mappingSummary = (m) =>
  [["Type - Code", typeCodeKey(m)]]
    .filter(([, v]) => v)
    .flatMap(([k, v], i) => [
      i ? ", " : null,
      <span key={k} className="param-label">
        {k}
      </span>,
      " ",
      v,
    ])
    .filter((x) => x !== null);
// Dialog tables: one column naming where the Product Family is scheduled. The header follows what the rows hold:
// only Units -> "Unit"; only Activity Type · Category pairs -> "Activity Type · Category"; a mix -> "For".
// With no schedule rows (mapped only) the Mapping's own kind decides.
function scheduleForCols(rows, fallbackKind) {
  const dash = (p) => p.value || <Dash />;
  const kinds = new Set((rows || []).filter((r) => r.where).map((r) => r.kind));
  const kind = kinds.size === 1 ? [...kinds][0] : kinds.size === 0 ? fallbackKind : null;
  const headerName = kind === "unit" ? "Unit" : kind === "activity" ? "Activity Type \u00B7 Category" : "For";
  return [{ headerName, field: "where", width: kind === "unit" ? 100 : 232, cellRenderer: dash }]; // wide enough for the "Activity Type · Category" header, never truncated
}
// Confirmation tables list rows in the order of the columns: Unit ascending (numeric) or Activity Type · Category alphabetically, then Schedule (earliest month first), then Product Family alphabetically. Rows with no where (mapped, never scheduled) come last.
const firstMonth = (s) => {
  const t = Date.parse(`1 ${String(s || "").split(",")[0].trim()}`);
  return Number.isNaN(t) ? Infinity : t;
};
const sortPreviewRows = (rows) =>
  [...rows].sort(
    (a, b) =>
      (a.where ? 0 : 1) - (b.where ? 0 : 1) ||
      String(a.where || "").localeCompare(String(b.where || ""), undefined, { numeric: true }) ||
      firstMonth(a.when) - firstMonth(b.when) ||
      String(a.family || "").localeCompare(String(b.family || "")),
  );
// Every delete / confirm table lists the columns it has in this order: Activity Type · Category (or Unit), Schedule, Product Family (Type - Code goes in the sentence above).
// Fixed widths for all but the last column, which takes the remaining space, so the table never scrolls sideways.
const COL_RANK = { where: 1, when: 2, family: 3 };
const PREVIEW_COL_WIDTH = { when: 200, family: 200 }; // 232 + 200 + 188 (min 150) stays inside the 620px dialog table
function previewCols(cols) {
  const sorted = [...cols].sort((a, b) => COL_RANK[a.field || a.colId] - COL_RANK[b.field || b.colId]);
  const isUnit = sorted[0].headerName === "Unit";
  // Delete Mapping and Delete Product Family tables fill the dialog width: Activity Type · Category keeps 232 so its header is never truncated; every other column shares the remaining width equally, Unit included.
  return sorted.map(({ flex, minWidth, ...c }) => (c.field === "where" && !isUnit ? c : { ...c, width: undefined, flex: 1, minWidth: 100 }));
}
// Delete Mapping: the Mapping's parameters in a sentence, then one row per Product Family × where it is scheduled.
export function DeleteMappingPreview({ db, m, removed }) {
  const links = m.links || {};
  const team = (f) => (isCategoryType(m.type) ? (m.category || []).filter((p) => (links[p] || []).includes(f)).join(", ") : "");
  const rows = sortPreviewRows(
    m.families.flatMap((f) => {
      const u = removed.filter((x) => x.family === f);
      return u.length
        ? u.map((x) => ({ family: f, team: team(f), kind: x.kind, where: x.where, when: x.when }))
        : [{ family: f, team: team(f), kind: team(f) ? "activity" : null, where: team(f) ? `${m.activityType} \u00B7 ${team(f)}` : null, when: null }];
    }),
  ).map((r, i) => ({ id: i, ...r }));
  const dash = (p) => p.value || <Dash />;
  return (
    <ScrollPreviewGrid
      rowData={rows}
      getRowId={(p) => String(p.data.id)}
      columnDefs={previewCols([
        {
          headerName: "Product Family",
          field: "family",
          cellRenderer: (p) => <FamilyTag name={p.value} />,
        },
        ...scheduleForCols(rows, m.type === "O" ? "activity" : "unit"),
        { headerName: "Schedule", field: "when", cellRenderer: dash },
      ])}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
// Delete Product Family: where the family is used — one row per Schedule entry (or one row if only mapped).
export function DeleteFamilyPreview({ db, name }) {
  // The dialog sentence names the Mapping Type; the table carries the Activity Type · Category / Unit and the months.
  const usage = scheduleUsage(db, [name]);
  const rows = sortPreviewRows(usage.map((u) => ({ kind: u.kind, where: u.where, when: u.when }))).map((r, i) => ({ id: i, ...r }));
  const mapped = db.mappings.find((m) => m.families.includes(name));
  const dash = (p) => p.value || <Dash />;
  return (
    <>
      {rows.length ? (
        <ScrollPreviewGrid
          rowData={rows}
          getRowId={(p) => String(p.data.id)}
          columnDefs={previewCols([
            ...scheduleForCols(rows, mapped && mapped.type === "O" ? "activity" : "unit"),
            { headerName: "Schedule", field: "when", cellRenderer: dash },
          ])}
          rowStyle={{ cursor: "default" }}
          suppressRowHoverHighlight
        />
      ) : null}
    </>
  );
}
const nameList = (xs) => (xs.length <= 2 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
export function RemovedSchedulePreview({ db, rows }) {
  const data = sortPreviewRows(rows).map((r, i) => ({ id: i, ...r }));
  return (
    <ScrollPreviewGrid
      rowData={data}
      getRowId={(p) => String(p.data.id)}
      columnDefs={previewCols([
        {
          headerName: "Product Family",
          field: "family",
          cellRenderer: (p) => <FamilyTag name={p.value} />,
        },
        ...scheduleForCols(rows, "unit"),
        { headerName: "Schedule", field: "when" },
      ])}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
