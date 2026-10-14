import Close from "@mui/icons-material/Close";
import { Dash, FamilyTag } from "../components/cells";
import { IconButton } from "@mui/material";
import { PickerField } from "../components/PickerField";
import Save from "@mui/icons-material/Save";
import { NO_MAPPING_COPY } from "../constants";
import { createContext, useContext } from "react";
import { productTextList } from "../lib/utils";

export const ScheduleCtx = createContext(null);
const safeId = (s) => String(s).replace(/[^A-Za-z0-9]+/g, "-");
export function ScheduleMonthCell(params) {
  const ctx = useContext(ScheduleCtx);
  const { db } = ctx;
  const key = params.colDef.field;
  const row = params.data;
  // No Type T/X Mapping: the select still shows, and its dropdown holds the empty message (with the link to create one for people who can).
  const emptyText = ctx.noFamilies ? (
    ctx.createT ? (
      <span>
        {"No results found. Start by creating a Type T/X Mapping "}
        <button type="button" className="text-link" onMouseDown={(e) => e.preventDefault()} onClick={ctx.createT}>
          here
        </button>
        .
      </span>
    ) : (
      NO_MAPPING_COPY.unit
    )
  ) : (
    ctx.emptyText
  );
  if (ctx.clickMode && ctx.noFamilies && row.showSelect) {
    // Click mode with no Type T/X Mapping: the opened row's first month cell spans all six months with the message.
    if (key !== ctx.firstMonthKey) return null;
    return <div className="span-empty">{emptyText}</div>;
  }
  if (row.showSelect) {
    return (
      <PickerField
        id={`cell-${safeId(row.rowId)}-${key}`}
        options={ctx.optionsFor(row)}
        value={ctx.getDraft(row.rowId, key)}
        swapCount
        hideZero={ctx.clickMode}
        placeholder="—"
        emptyText={emptyText}
        onToggle={(f) => ctx.toggleDraft(row.rowId, key, f)}
        onClear={() => ctx.clearDraft(row.rowId, key)}
        onCommit={() => ctx.commitDraft(row.rowId)}
        getDetail={(f) => productTextList((db.families.find((x) => x.name === f) || { products: [] }).products)}
      />
    );
  }
  const fams = ctx.getSaved(row.rowId, key);
  if (!fams.length)
    return (
      <div className="cell-tags">
        <Dash />
      </div>
    );
  return (
    <div className="cell-tags">
      {fams.map((f) => (
        <FamilyTag key={f} name={f} variant="cellTag" />
      ))}
    </div>
  );
}
export function ScheduleActionsCell(params) {
  const ctx = useContext(ScheduleCtx);
  const dirty = ctx.rowDirty(params.data.rowId);
  return (
    <div className="action-cell">
      <IconButton className="icon-action icon-cancel" disabled={ctx.clickMode ? ctx.editing !== params.data.rowId : !dirty} onClick={() => ctx.cancelEdit(params.data.rowId)} title="Cancel">
        <Close />
      </IconButton>
      <IconButton className="icon-action icon-save" disabled={!dirty} onClick={() => ctx.saveEdit(params.data)} title="Save">
        <Save />
      </IconButton>
    </div>
  );
}
