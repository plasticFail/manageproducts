import { Button } from "@mui/material";
import { DataGrid, useDb, useUi } from "../components/common";
import { mappingColumns } from "../components/previews";
import { useDeleteMapping } from "./useDeleteMapping";
import { useMemo } from "react";
import { useDateSort } from "../components/cells";
import { typeCodeKey, typeCodeLabel, without } from "../lib/utils";

export function MappingList({ search, filter, setFilter, onCreate, onEdit }) {
  const { db, setDb } = useDb();
  const { access } = useUi();
  const onDelete = useDeleteMapping();
  const { sort, onSort, sortRows } = useDateSort();
  const canEdit = access.mapping; // view only: no Create Mapping, no Actions column
  const rows = useMemo(() => {
    const byType = filter === "All" ? db.mappings : db.mappings.filter((m) => typeCodeKey(m) === filter);
    const term = search.trim().toLowerCase();
    const visible = term
      ? byType.filter((m) =>
          [typeCodeKey(m), typeCodeLabel(typeCodeKey(m)), m.activityType, ...(m.category || []), ...m.families].filter(Boolean).join(" ").toLowerCase().includes(term),
        )
      : byType;
    return sortRows(visible);
  }, [db, filter, search, sort]);
  const columnDefs = useMemo(() => mappingColumns(db, { withMeta: true, onEdit, onDelete, readOnly: !canEdit, sort, onSort }), [db, canEdit, sort]);
  return (
    <>
      <div className="modal-body grid-body">
        {db.mappings.length === 0 ? (
          <div className="list-empty">{canEdit ? "No results found. Start by creating a Mapping" : "No results found."}</div>
        ) : (
          <DataGrid
            className={"grid-wrap list-grid" + (canEdit ? " row-link" : "")}
            rowData={rows}
            getRowId={(p) => String(p.data.id)}
            columnDefs={columnDefs}
            overlayNoRowsTemplate={`<div class="empty">No results found.</div>`}
            onRowClicked={(e) => {
              if (e.event && e.event.target.closest(".icon-action")) return;
              setDb((d) => ({ ...d, changedMappings: without(d.changedMappings, e.data.id) }));
              if (canEdit) onEdit(e.data.id);
            }}
          />
        )}
      </div>
      {canEdit ? (
        <div className="modal-footer">
          <Button variant="primary" onClick={onCreate}>
            Create Mapping
          </Button>
        </div>
      ) : null}
    </>
  );
}
