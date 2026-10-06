import { Button } from "@mui/material";
import { DataGrid, useDb, useUi } from "../components/common";
import { DeleteMappingPreview, UndoNote, mappingColumns, mappingSummary } from "../components/previews";
import { useMemo } from "react";
import { pruneSchedule } from "../lib/domain";
import { without } from "../lib/utils";

export function MappingList({ search, filter, setFilter, onCreate, onEdit }) {
  const { db, setDb } = useDb();
  const { confirm, notify } = useUi();
  const rows = useMemo(() => {
    const byType = filter === "All" ? db.mappings : db.mappings.filter((m) => m.type === filter);
    const term = search.trim().toLowerCase();
    const visible = term
      ? byType.filter((m) =>
          [m.type, m.code, m.activityType, ...(m.category || []), ...m.families].filter(Boolean).join(" ").toLowerCase().includes(term),
        )
      : byType;
    return [...visible].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [db, filter, search]);
  async function onDelete(id) {
    const m = db.mappings.find((x) => x.id === id);
    if (!m) return;
    // Schedule entries that only this Mapping allowed go with it.
    const afterDelete = (d) => ({ ...d, mappings: d.mappings.filter((x) => x.id !== id), changedMappings: without(d.changedMappings, id) });
    const { removed } = pruneSchedule(afterDelete(db));
    const ok = await confirm(
      <>
        <p style={{ margin: "0 0 16px" }}>
          {mappingSummary(m)}
          <span className="param-label">:</span>
        </p>
        <DeleteMappingPreview db={db} m={m} removed={removed} />
        {removed.length ? <p style={{ margin: "16px 0 0" }}>Deleting this Mapping will also remove it from Schedule.</p> : null}
        <UndoNote />
      </>,
      { title: "Delete Mapping", confirmLabel: "Delete", destructive: true },
    );
    if (!ok) return;
    setDb((d) => pruneSchedule(afterDelete(d)).db);
    notify(removed.length ? "Mapping deleted and removed from Schedule" : "Mapping deleted");
  }
  const columnDefs = useMemo(() => mappingColumns(db, { withMeta: true, onEdit, onDelete }), [db]);
  return (
    <>
      <div className="modal-body grid-body">
        {db.mappings.length === 0 ? (
          <div className="list-empty">No results found. Start by creating a Mapping</div>
        ) : (
          <DataGrid
            className="grid-wrap list-grid"
            rowData={rows}
            getRowId={(p) => String(p.data.id)}
            columnDefs={columnDefs}
            overlayNoRowsTemplate={`<div class="empty">No results found.</div>`}
            onRowClicked={(e) => {
              if (e.event && e.event.target.closest(".icon-action")) return;
              setDb((d) => ({ ...d, changedMappings: without(d.changedMappings, e.data.id) }));
            }}
          />
        )}
      </div>
      <div className="modal-footer">
        <Button variant="primary" onClick={onCreate}>
          Create Mapping
        </Button>
      </div>
    </>
  );
}
