import { Dash, FamilyCell, FamilyTag, sortCols } from "./cells";
import { DataGrid } from "./common";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { scheduleUsage } from "../lib/domain";
import { isCategoryType, ownershipLabels, typeCodeKey, typeCodeLabel } from "../lib/utils";

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
    { colId: "type", headerName: "Type - Code", width: 220, valueGetter: (p) => typeCodeLabel(typeCodeKey(p.data)) },
    { field: "activityType", headerName: "Activity Type", width: 150, cellRenderer: (p) => p.value || <Dash /> },
    { colId: "families", headerName: "Product Family", flex: 1, minWidth: 200, cellRenderer: (p) => <FamilyCell db={db} m={p.data} /> },
  );
  if (withMeta && !readOnly) {
    cols.push({
      colId: "actions",
      headerName: "Actions",
      width: 90,
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
// A preview table that grows with its rows up to maxHeight, then scrolls under a fixed header.
function ScrollPreviewGrid({ maxHeight = 300, ...props }) {
  const ref = useRef(null);
  const [h, setH] = useState(120);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ro;
    const attach = () => {
      const body = el.querySelector(".ag-center-cols-container"),
        head = el.querySelector(".ag-header");
      if (!body || !head) return setTimeout(attach, 30);
      const fit = () => setH(Math.min(maxHeight, head.offsetHeight + body.offsetHeight + 2));
      ro = new ResizeObserver(fit);
      ro.observe(body);
      fit();
    };
    attach();
    return () => ro && ro.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <DataGrid className="preview-grid" style={{ height: h }} {...props} />
    </div>
  );
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
  return [{ headerName, field: "where", width: 210, cellRenderer: dash }];
}
// Every delete / confirm table lists the columns it has in this order: Activity Type · Category (or Unit), Schedule, Product Family (Type - Code goes in the sentence above).
// Fixed widths for all but the last column, which takes the remaining space, so the table never scrolls sideways.
const COL_RANK = { where: 1, when: 2, family: 3 };
const PREVIEW_COL_WIDTH = { when: 200, family: 200 }; // 210 + 200 + 200 stays inside the 620px dialog table
function previewCols(cols) {
  const sorted = [...cols].sort((a, b) => COL_RANK[a.field || a.colId] - COL_RANK[b.field || b.colId]);
  // Two columns (e.g. Activity Type · Category + Schedule): share the table width equally so there is space between them.
  if (sorted.length === 2) return sorted.map(({ width, flex, minWidth, ...c }) => ({ ...c, flex: 1, minWidth: 150 }));
  return sorted.map(({ flex, minWidth, ...c }, i) => {
    const key = c.field || c.colId;
    const width = PREVIEW_COL_WIDTH[key] || c.width;
    return i === sorted.length - 1 ? { ...c, width, minWidth: 150, flex: 1 } : { ...c, width };
  });
}
// Delete Mapping: the Mapping's parameters in a sentence, then one row per Product Family × where it is scheduled.
export function DeleteMappingPreview({ db, m, removed }) {
  const links = m.links || {};
  const team = (f) => (isCategoryType(m.type) ? (m.category || []).filter((p) => (links[p] || []).includes(f)).join(", ") : "");
  const rows = m.families
    .flatMap((f) => {
      const u = removed.filter((x) => x.family === f);
      return u.length
        ? u.map((x) => ({ family: f, team: team(f), kind: x.kind, where: x.where, when: x.when }))
        : [{ family: f, team: team(f), kind: team(f) ? "activity" : null, where: team(f) ? `${m.activityType} \u00B7 ${team(f)}` : null, when: null }];
    })
    .map((r, i) => ({ id: i, ...r }));
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
  // A Product Family is mapped once. With Schedule entries the table carries the Activity Type · Category / Unit, so the line only names the Type ("Mapped to O");
  // without a table the line keeps the full label ("Mapped to O · Alpha · Category A").
  const usage = scheduleUsage(db, [name]);
  const rows = usage.map((u, i) => ({ id: i, kind: u.kind, where: u.where, when: u.when }));
  const labels = ownershipLabels(db, name)
    .map((l) => (l.startsWith("O ") || l === "T/X" ? l : typeCodeLabel(l)))
    .map((l) => (rows.length ? l.split(" \u00B7 ")[0] : l));
  const mapped = db.mappings.find((m) => m.families.includes(name));
  const dash = (p) => p.value || <Dash />;
  return (
    <>
      {labels.length ? (
        <p style={{ margin: rows.length ? "0 0 16px" : 0 }}>
          <span className="param-label">Mapped to</span> {[...new Set(labels)].join(", ")}
          {rows.length ? <span className="param-label">:</span> : null}
        </p>
      ) : null}
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
  const data = rows.map((r, i) => ({ id: i, ...r }));
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
