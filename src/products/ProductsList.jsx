import { Button, IconButton } from "@mui/material";
import { DataGrid, useDb, useUi } from "../components/common";
import { DeleteFamilyPreview, UndoNote } from "../components/previews";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useMemo } from "react";
import { formatDate, isPersonnelCycle, productTextList, without } from "../lib/utils";
import { pruneSchedule, scheduleUsage } from "../lib/domain";

export function ProductsList({ search, onCreate, onEdit }) {
  const { db, setDb } = useDb();
  const { confirm, notify } = useUi();
  async function onDelete(name) {
    const inMapping = db.mappings.some((m) => m.families.includes(name));
    const scheduled = scheduleUsage(db, [name]).length > 0;
    const mapped = inMapping || scheduled;
    let body,
      confirmLabel = "Delete",
      emptiedCount = 0;
    if (mapped) {
      // Mappings left with no Product Family are deleted as a whole row.
      emptiedCount = db.mappings.filter((m) => m.families.length === 1 && m.families[0] === name).length;
      const where = inMapping && scheduled ? "Mapping and Schedule" : inMapping ? "Mapping" : "Schedule";
      body = (
        <>
          <DeleteFamilyPreview db={db} name={name} />
          <p style={{ margin: "16px 0 0" }}>{`Deleting this Product Family will also remove it from ${where}.`}</p>
          {emptiedCount ? (
            <p style={{ margin: "16px 0 0" }}>
              {emptiedCount === 1
                ? "Its Mapping has no other Product Family, so the whole Mapping will be deleted."
                : "Its Mappings have no other Product Family, so they will be deleted."}
            </p>
          ) : null}
        </>
      );
    } else {
      body = null;
    }
    const ok = await confirm(
      <>
        {body}
        <UndoNote />
      </>,
      { title: `Delete ${name}`, confirmLabel, destructive: true },
    );
    if (!ok) return;
    setDb((d) => {
      let mappings = d.mappings.map((m) => {
        if (!m.families.includes(name)) return m;
        if (!isPersonnelCycle(m.cycle)) return { ...m, families: without(m.families, name) };
        const linked = Object.fromEntries(Object.entries(m.links || {}).map(([p, arr]) => [p, without(arr, name)]));
        const personnel = (m.personnel || []).filter((p) => (linked[p] || []).length > 0);
        return { ...m, personnel, links: Object.fromEntries(personnel.map((p) => [p, linked[p]])), families: without(m.families, name) };
      });
      const emptied = mappings.filter((m) => m.families.length === 0).map((m) => m.id);
      mappings = mappings.filter((m) => m.families.length > 0);
      return pruneSchedule({
        ...d,
        mappings,
        changedMappings: d.changedMappings.filter((id) => !emptied.includes(id)),
        families: d.families.filter((f) => f.name !== name),
        changedFamilies: without(d.changedFamilies, name),
      }).db;
    });
    notify(
      inMapping && scheduled
        ? "Product Family deleted and removed from Mapping and Schedule"
        : inMapping
          ? "Product Family deleted and removed from Mapping"
          : scheduled
            ? "Product Family deleted and removed from Schedule"
            : "Product Family deleted",
    );
  }
  const term = search.trim().toLowerCase();
  const rows = (
    term
      ? db.families.filter((f) => f.name.toLowerCase().includes(term) || f.products.some((p) => p.toLowerCase().includes(term)))
      : db.families
  )
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const columnDefs = useMemo(
    () => [
      {
        colId: "dot",
        headerName: "",
        width: 36,
        cellRenderer: (p) => (db.changedFamilies.includes(p.data.name) ? <span className="row-dot" /> : null),
      },
      { field: "createdAt", headerName: "Created", width: 170, valueFormatter: (p) => formatDate(p.value) },
      { field: "updatedAt", headerName: "Last Updated", width: 170, valueFormatter: (p) => formatDate(p.value) },
      { field: "name", headerName: "Product Family", width: 160 },
      { colId: "products", headerName: "Products", flex: 1, minWidth: 200, valueGetter: (p) => productTextList(p.data.products) },
      {
        colId: "actions",
        headerName: "Actions",
        width: 90,
        cellRenderer: (p) => (
          <div className="action-cell">
            <IconButton className="icon-action" title="Edit" onClick={() => onEdit(p.data.name)}>
              <EditOutlined />
            </IconButton>
            <IconButton className="icon-action" title="Delete" onClick={() => onDelete(p.data.name)}>
              <DeleteOutlined />
            </IconButton>
          </div>
        ),
      },
    ],
    [db],
  );
  return (
    <>
      <div className="modal-body grid-body">
        {db.families.length === 0 ? (
          <div className="list-empty">No results found. Start by creating a Product Family</div>
        ) : (
          <DataGrid
            className="grid-wrap list-grid"
            rowData={rows}
            getRowId={(p) => p.data.name}
            columnDefs={columnDefs}
            overlayNoRowsTemplate={`<div class="empty">No results found.</div>`}
            onRowClicked={(e) => {
              if (e.event && e.event.target.closest(".icon-action")) return;
              setDb((d) => ({ ...d, changedFamilies: without(d.changedFamilies, e.data.name) }));
            }}
          />
        )}
      </div>
      <div className="modal-footer">
        <Button variant="primary" onClick={onCreate}>
          Create Product Family
        </Button>
      </div>
    </>
  );
}
