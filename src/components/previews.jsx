import { Dash, FamilyCell, FamilyTag } from "./cells";
import { DataGrid } from "./common";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { cycleForFamily, scheduleUsage } from "../lib/domain";
import { formatDate, isPersonnelCycle } from "../lib/utils";

export function mappingColumns(db, { withMeta, onEdit, onDelete }) {
  const cols = [];
  if (withMeta) {
    cols.push(
      {
        colId: "dot",
        headerName: "",
        width: 36,
        cellRenderer: (p) => (db.changedMappings.includes(p.data.id) ? <span className="row-dot" /> : null),
      },
      { field: "createdAt", headerName: "Created", width: 170, valueFormatter: (p) => formatDate(p.value) },
      { field: "updatedAt", headerName: "Last Updated", width: 170, valueFormatter: (p) => formatDate(p.value) },
    );
  }
  cols.push(
    { field: "cycle", headerName: "Type", width: 100 },
    { field: "code", headerName: "Code", width: 80, cellRenderer: (p) => p.value || <Dash /> },
    { field: "projectType", headerName: "Activity Type", width: 150, cellRenderer: (p) => p.value || <Dash /> },
    { colId: "families", headerName: "Product Family", flex: 1, minWidth: 200, cellRenderer: (p) => <FamilyCell db={db} m={p.data} /> },
  );
  if (withMeta) {
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
// "Cycle O, Project Type Alpha:" — parameter names in the input-label colour, values in text colour.
export const mappingSummary = (m) =>
  [
    ["Type", m.cycle],
    ["Code", m.code],
  ]
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
// Dialog tables: one "For" column naming where the Product Family is scheduled (a Household id or a Project Type · Personnel pair).
function scheduleForCols() {
  const dash = (p) => p.value || <Dash />;
  return [{ headerName: "For", field: "where", width: 190, cellRenderer: dash }];
}
// Delete Mapping: the Mapping's parameters in a sentence, then one row per Product Family × where it is scheduled.
export function DeleteMappingPreview({ db, m, removed }) {
  const links = m.links || {};
  const team = (f) => (isPersonnelCycle(m.cycle) ? (m.personnel || []).filter((p) => (links[p] || []).includes(f)).join(", ") : "");
  const rows = m.families
    .flatMap((f) => {
      const u = removed.filter((x) => x.family === f);
      return u.length
        ? u.map((x) => ({ family: f, team: team(f), kind: x.kind, where: x.where, when: x.when }))
        : [{ family: f, team: team(f), kind: null, where: null, when: null }];
    })
    .map((r, i) => ({ id: i, ...r }));
  const dash = (p) => p.value || <Dash />;
  return (
    <ScrollPreviewGrid
      rowData={rows}
      getRowId={(p) => String(p.data.id)}
      columnDefs={[
        {
          headerName: "Product Family",
          field: "family",
          width: 210,
          cellRenderer: (p) => (
            <span className="fam-with-team">
              {p.data.team ? <span className="fam-sched-team">{p.data.team}:</span> : null}
              <FamilyTag name={p.value} cycle={m.cycle} />
            </span>
          ),
        },
        ...scheduleForCols(rows, m.cycle === "O" ? "project" : "household"),
        { headerName: "Schedule", field: "when", flex: 1, minWidth: 180, cellRenderer: dash },
      ]}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
// Delete Product Family: where the family is used — one row per Schedule entry (or one row if only mapped).
function familyMappingParts(db, name) {
  return db.mappings
    .filter((m) => m.families.includes(name))
    .map((m) => {
      const teams = isPersonnelCycle(m.cycle) ? (m.personnel || []).filter((p) => ((m.links || {})[p] || []).includes(name)) : [];
      return [
        ["Type", m.cycle],
        ["Code", m.code],
        ["Activity Type", m.projectType],
        ["Category", teams.join(", ")],
      ].filter(([, v]) => v);
    });
}
const paramText = (parts) =>
  parts
    .flatMap(([k, v], i) => [
      i ? (
        <span key={"s" + i} className="param-label">
          {", "}
        </span>
      ) : null,
      <span key={k} className="param-label">
        {k}
      </span>,
      " ",
      v,
    ])
    .filter((x) => x !== null);
export function DeleteFamilyPreview({ db, name }) {
  const maps = familyMappingParts(db, name);
  const usage = scheduleUsage(db, [name]);
  const rows = (
    usage.length ? usage.map((u) => ({ kind: u.kind, where: u.where, when: u.when })) : [{ kind: null, where: null, when: null }]
  ).map((r, i) => ({ id: i, ...r }));
  const mapped = db.mappings.find((m) => m.families.includes(name));
  const dash = (p) => p.value || <Dash />;
  return (
    <ScrollPreviewGrid
      rowData={rows}
      getRowId={(p) => String(p.data.id)}
      columnDefs={[
        {
          headerName: "Mapping",
          colId: "mapping",
          width: 250,
          wrapText: true,
          cellRenderer: () =>
            maps.length ? (
              <div>
                {maps.map((parts, i) => (
                  <div key={i}>{paramText(parts)}</div>
                ))}
              </div>
            ) : (
              <Dash />
            ),
        },
        ...scheduleForCols(rows, mapped && mapped.cycle === "O" ? "project" : "household"),
        { headerName: "Schedule", field: "when", flex: 1, minWidth: 160, cellRenderer: dash },
      ]}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
const nameList = (xs) => (xs.length <= 2 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
export function RemovedSchedulePreview({ db, rows }) {
  const data = rows.map((r, i) => ({ id: i, ...r }));
  return (
    <ScrollPreviewGrid
      rowData={data}
      getRowId={(p) => String(p.data.id)}
      columnDefs={[
        {
          headerName: "Product Family",
          field: "family",
          width: 190,
          cellRenderer: (p) => <FamilyTag name={p.value} cycle={cycleForFamily(db, p.value)} />,
        },
        ...scheduleForCols(rows, "household"),
        { headerName: "Schedule", field: "when", flex: 1, minWidth: 180 },
      ]}
      rowStyle={{ cursor: "default" }}
      suppressRowHoverHighlight
    />
  );
}
