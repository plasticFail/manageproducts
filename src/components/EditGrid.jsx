import { DataGrid } from "./common";
import { ErrorOutlineIcon } from "./icons";
import { IconButton, Tooltip } from "@mui/material";
import { createContext, useContext, useMemo, useRef } from "react";

export function ErrorFlag({ message }) {
  if (!message) return null;
  return (
    <Tooltip title={message} placement="bottom" classes={{ tooltip: "tip-light" }}>
      <IconButton className="err-flag" size="small" aria-label={message}>
        <ErrorOutlineIcon />
      </IconButton>
    </Tooltip>
  );
}
// Editable table (AG Grid) for forms with add/remove rows: Products, years, months.
// Cells hold standard-variant inputs (bottom border only); the last column is a 48 x 48 remove cell.
// Column defs and cell components are stable; cells read the form's latest render functions from context,
// so typing never remounts an input.
const EditGridCtx = createContext(null);
function EditGridCell(params) {
  const c = useContext(EditGridCtx);
  return c.renderCell(params.colDef.colId, params.data.id);
}
function EditGridRemove(params) {
  const c = useContext(EditGridCtx);
  return c.renderRemove(params.data.id);
}
function EditGridHeader({ displayName, required }) {
  return (
    <span className="eg-head">
      {displayName}
      {required ? (
        <span className="et-req" aria-hidden>
          {" *"}
        </span>
      ) : null}
    </span>
  );
}
export function EditGrid({ count, columns, renderCell, renderRemove, className, fit = false }) {
  const key = columns.map((c) => c.id + ":" + (c.width || "")).join(",");
  const columnDefs = useMemo(
    () => [
      ...columns.map((c) => ({
        colId: c.id,
        headerName: c.label,
        headerComponent: EditGridHeader,
        headerComponentParams: { required: !!c.required },
        ...(c.width ? { width: c.width } : { flex: 1, minWidth: 140 }),
        cellRenderer: EditGridCell,
        cellClass: "eg-cell",
        suppressKeyboardEvent: () => true,
      })),
      {
        colId: "__remove",
        headerName: "",
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        cellRenderer: EditGridRemove,
        cellClass: "eg-action",
        suppressKeyboardEvent: () => true,
      },
    ],
    [key],
  );
  const rowData = useMemo(() => Array.from({ length: count }, (_, i) => ({ id: i })), [count]);
  const fixedWidth = columns.every((c) => c.width) ? columns.reduce((sum, c) => sum + c.width, 0) + 48 : null;
  return (
    <EditGridCtx.Provider value={{ renderCell, renderRemove }}>
      <DataGrid
        className={"edit-grid " + (className || "") + (fit ? " edit-grid-fit" : "")}
        style={fit ? { height: 53 + count * 48 } : fixedWidth ? { width: fixedWidth, maxWidth: "100%" } : void 0}
        autoHeight={!fit}
        rowData={rowData}
        getRowId={(p) => String(p.data.id)}
        columnDefs={columnDefs}
        rowHeight={48}
      />
    </EditGridCtx.Provider>
  );
}
// Change detection for form CTAs: a form's CTA is enabled only when its values differ from how the form opened.
export const snap = (v) => JSON.stringify(v);
export function useInitialSnapshot(value) {
  const ref = useRef(null);
  if (ref.current === null) ref.current = snap(value);
  return ref.current;
}
