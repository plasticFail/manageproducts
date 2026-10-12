import { Button, IconButton } from "@mui/material";
import { DataGrid, useDb, useUi } from "../components/common";
import { useDeleteFamily } from "./useDeleteFamily";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { sortCols, useDateSort } from "../components/cells";
import { useMemo } from "react";
import { FIXED_FAMILY } from "../constants";
import { productTextList, without } from "../lib/utils";

export function ProductsList({ search, onCreate, onEdit }) {
  const { db, setDb } = useDb();
  const { access } = useUi();
  const onDelete = useDeleteFamily();
  const { sort, onSort, sortRows } = useDateSort();
  const canEdit = access.products; // view only: no Create Product Family, no Actions column
  const term = search.trim().toLowerCase();
  const rows = sortRows(
    term
      ? db.families.filter((f) => f.name.toLowerCase().includes(term) || f.products.some((p) => p.toLowerCase().includes(term)))
      : db.families,
  );
  const columnDefs = useMemo(
    () => [
      {
        colId: "dot",
        headerName: "",
        width: 36,
        cellRenderer: (p) => (db.changedFamilies.includes(p.data.name) ? <span className="row-dot" /> : null),
      },
      ...sortCols(sort, onSort),
      { field: "name", headerName: "Product Family", width: 160 },
      { colId: "products", headerName: "Products", flex: 1, minWidth: 200, valueGetter: (p) => productTextList(p.data.products) },
      ...(canEdit
        ? [
            {
              colId: "actions",
              headerName: "Actions",
              width: 90,
              cellRenderer: (p) => (
                <div className="action-cell">
                  <IconButton className="icon-action" title="Edit" onClick={() => onEdit(p.data.name)}>
                    <EditOutlined />
                  </IconButton>
                  <IconButton
                    className="icon-action"
                    title="Delete"
                    disabled={p.data.name === FIXED_FAMILY}
                    onClick={() => onDelete(p.data.name)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </div>
              ),
            },
          ]
        : []),
    ],
    [db, canEdit, sort],
  );
  return (
    <>
      <div className="modal-body grid-body">
        {db.families.length === 0 ? (
          <div className="list-empty">{canEdit ? "No results found. Start by creating a Product Family" : "No results found."}</div>
        ) : (
          <DataGrid
            className={"grid-wrap list-grid" + (canEdit ? " row-link" : "")}
            rowData={rows}
            getRowId={(p) => p.data.name}
            columnDefs={columnDefs}
            overlayNoRowsTemplate={`<div class="empty">No results found.</div>`}
            onRowClicked={(e) => {
              if (e.event && e.event.target.closest(".icon-action")) return;
              setDb((d) => ({ ...d, changedFamilies: without(d.changedFamilies, e.data.name) }));
              if (canEdit) onEdit(e.data.name);
            }}
          />
        )}
      </div>
      {canEdit ? (
        <div className="modal-footer">
          <Button variant="primary" onClick={onCreate}>
            Create Product Family
          </Button>
        </div>
      ) : null}
    </>
  );
}
