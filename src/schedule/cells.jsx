import Close from "@mui/icons-material/Close";
import { Dash, FamilyTag } from "../components/cells";
import { IconButton } from "@mui/material";
import { PickerField } from "../components/PickerField";
import Save from "@mui/icons-material/Save";
import { createContext, useContext } from "react";
import { typeForFamily } from "../lib/domain";
import { productTextList } from "../lib/utils";

export const ScheduleCtx = createContext(null);
const safeId = (s) => String(s).replace(/[^A-Za-z0-9]+/g, "-");
export function ScheduleMonthCell(params) {
  const ctx = useContext(ScheduleCtx);
  const { db } = ctx;
  const key = params.colDef.field;
  const row = params.data;
  if (ctx.editing === row.rowId && ctx.noFamilies) {
    // No Type T/X Mapping yet: the first month cell spans all six months with one message and the rest stay empty.
    if (key !== ctx.firstMonthKey) return null;
    return (
      <div className="span-empty">
        <span>
          {"No results found. Start by creating a Type T/X Mapping "}
          <button type="button" className="text-link" onClick={ctx.createT}>
            here
          </button>
          .
        </span>
      </div>
    );
  }
  if (ctx.editing === row.rowId) {
    return (
      <PickerField
        id={`cell-${safeId(row.rowId)}-${key}`}
        options={ctx.optionsFor(row)}
        value={ctx.getDraft(key)}
        stack
        placeholder="Select"
        emptyText={ctx.emptyText}
        showCount={false}
        showChevron={false}
        onToggle={(f) => ctx.toggleDraft(key, f)}
        onClear={() => ctx.clearDraft(key)}
        onCommit={ctx.commitDraft}
        getSub={(f) => `Type ${typeForFamily(db, f)}`}
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
  const editing = ctx.editing === params.data.rowId;
  return (
    <div className="action-cell">
      <IconButton className="icon-action icon-cancel" disabled={!editing} onClick={ctx.cancelEdit} title="Cancel">
        <Close />
      </IconButton>
      <IconButton
        className="icon-action icon-save"
        disabled={!editing || !ctx.dirty}
        onClick={() => ctx.saveEdit(params.data)}
        title="Save"
      >
        <Save />
      </IconButton>
    </div>
  );
}
