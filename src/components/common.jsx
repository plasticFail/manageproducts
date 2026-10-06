import { AgGridReact } from "ag-grid-react";
import { Button, Dialog, FormControl, FormLabel } from "@mui/material";
import { createContext, useContext } from "react";
import { gridTheme } from "../theme/index";

export function Section({ legend, children, sx, id, className }) {
  return (
    <FormControl
      component="section"
      role="group"
      aria-label={typeof legend === "string" ? legend : void 0}
      id={id}
      className={"form-section " + (className || "")}
      fullWidth
      sx={sx}
    >
      {legend ? <h3 className="section-heading">{legend}</h3> : null}
      {children}
    </FormControl>
  );
}
export function FieldLabel({ htmlFor, children }) {
  return (
    <FormLabel htmlFor={htmlFor} className="field-label">
      {children}
    </FormLabel>
  );
}
const baseColDef = {
  sortable: false,
  resizable: false,
  suppressMovable: true,
  autoHeight: true,
  wrapText: true,
  suppressHeaderMenuButton: true,
  suppressHeaderContextMenu: true,
};
export function DataGrid({ className = "grid-wrap", autoHeight = false, style, ...props }) {
  return (
    <div className={className} style={style}>
      <AgGridReact
        theme={gridTheme}
        defaultColDef={baseColDef}
        suppressCellFocus
        suppressRowHoverHighlight={false}
        domLayout={autoHeight ? "autoHeight" : "normal"}
        containerStyle={autoHeight ? void 0 : { height: "100%" }}
        {...props}
      />
    </div>
  );
}
export const DbContext = createContext(null);
(function () {
  const st = document.createElement("style");
  st.textContent =
    ".map-link{background:none;border:0;padding:0;margin:0;font:inherit;color:#00fcff;cursor:pointer;text-decoration:none}.map-link:hover{text-decoration:underline}.map-link:focus-visible{outline:2px solid #00fcff;outline-offset:2px;border-radius:2px}";
  document.head.appendChild(st);
})();
function MapLink({ onClick, children }) {
  return (
    <button type="button" className="map-link" onClick={onClick}>
      {children}
    </button>
  );
}
export const UiContext = createContext(null);
export const useDb = () => useContext(DbContext);
export const useUi = () => useContext(UiContext);
export function ConfirmDialog({ state, onClose }) {
  if (!state) return null;
  return (
    <Dialog
      open={!!state.open}
      onClose={() => onClose(false)}
      maxWidth={false}
      PaperProps={{
        className: "confirm-paper",
        sx: { width: "fit-content", minWidth: 504, maxWidth: "min(680px, 90vw)", maxHeight: "90vh", border: "1px solid #6E6E6E" },
      }}
    >
      <div className="modal-head">
        <h2 className={state.destructive ? "destructive" : ""}>{state.title || "Confirm"}</h2>
      </div>
      <div className="modal-body">
        <div className="confirm-message">{state.body}</div>
      </div>
      <div className="modal-footer">
        <Button variant={state.destructive ? "destructive" : "primary"} onClick={() => onClose(true)}>
          {state.confirmLabel || "Continue"}
        </Button>
        <Button variant="ghost" onClick={() => onClose(false)}>
          {state.cancelLabel || "Cancel"}
        </Button>
      </div>
    </Dialog>
  );
}
