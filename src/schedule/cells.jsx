import Close from "@mui/icons-material/Close";
import { Dash, FamilyTag } from "../components/cells";
import { IconButton } from "@mui/material";
import { PickerField } from "../components/PickerField";
import Save from "@mui/icons-material/Save";
import { createContext, useContext } from "react";
import { cycleForFamily } from "../lib/domain";
import { productTextList } from "../lib/utils";

export const ScheduleCtx = createContext(null);
const safeId = (s) => String(s).replace(/[^A-Za-z0-9]+/g, "-");
const cellCycleClass = (db, f) => {
  const c = cycleForFamily(db, f);
  return c ? `tag-cycle-${c}` : "";
};
// Fixed column content: a Product Family is a chip, a Product is plain text.
function FixedItems({ db, items }) {
  if (!items.length)
    return (
      <div className="cell-tags">
        <Dash />
      </div>
    );
  const sorted = [...items].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "family" ? -1 : 1));
  return (
    <div className="cell-tags fixed-tags">
      {sorted.map((it) =>
        it.kind === "family" ? (
          <FamilyTag key={"f" + it.name} name={it.name} variant="cellTag" cycle={cycleForFamily(db, it.name)} />
        ) : (
          <span key={"p" + it.name} className="plain-item" title="Product">
            {it.name}
          </span>
        ),
      )}
    </div>
  );
}
export function ScheduleMonthCell(params) {
  const ctx = useContext(ScheduleCtx);
  const { db } = ctx;
  const key = params.colDef.field;
  const row = params.data;
  if (ctx.editing === row.rowId && ctx.noFamilies) {
    // No Cycle T Mapping yet: the first month cell spans all six months with one message and the rest stay empty.
    if (key !== ctx.firstMonthKey) return null;
    return (
      <div className="span-empty">
        <span>
          {"No results found. Start by creating a Type T Mapping "}
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
        getSub={(f) => `Type ${cycleForFamily(db, f)}`}
        getDetail={(f) => productTextList((db.families.find((x) => x.name === f) || { products: [] }).products)}
        chipClass={(f) => cellCycleClass(db, f)}
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
        <FamilyTag key={f} name={f} variant="cellTag" cycle={cycleForFamily(db, f)} />
      ))}
    </div>
  );
}
export function ScheduleFixedCell(params) {
  const ctx = useContext(ScheduleCtx);
  const { db } = ctx;
  const row = params.data;
  if (ctx.editing === row.rowId) {
    return (
      <PickerField
        id={`fixed-${safeId(row.rowId)}`}
        options={ctx.fixedOptions}
        value={ctx.expandFixed(ctx.getDraft("__fixed"))} // a selected Product Family shows all its Products as checked
        hideTag={(n) => ctx.fixedKind(n) === "product" && ctx.getDraft("__fixed").includes(ctx.fixedFamilyOf(n))} // ...but only the Product Family chip is shown
        stack
        placeholder="Select"
        emptyText="No Product Family or Product available."
        showCount={false}
        showChevron={false}
        optionIndent={(n) => ctx.fixedKind(n) === "product"} // Products sit indented under their Product Family
        indeterminate={(n) => ctx.fixedKind(n) === "family" && ctx.partlySelected(n)}
        tagKind={ctx.fixedKind}
        onToggle={(n) => ctx.toggleDraft("__fixed", n)}
        onClear={() => ctx.clearDraft("__fixed")}
        onCommit={ctx.commitDraft}
        getSub={(n) => {
          if (ctx.fixedKind(n) !== "family") return "";
          const c = cycleForFamily(db, n);
          if (!c) return "";
          const m = db.mappings.find((x) => x.cycle === c && x.families.includes(n));
          return m && m.code ? `Type ${c} · ${m.code}` : `Type ${c}`; // a Mapping with a Code shows it, e.g. Type X · PREP
        }}
        getDetail={(n) =>
          ctx.fixedKind(n) === "family" && cycleForFamily(db, n)
            ? productTextList((db.families.find((x) => x.name === n) || { products: [] }).products)
            : ""
        } // Type X families list their Products like the month options do
        chipClass={(n) => (ctx.fixedKind(n) === "family" ? cellCycleClass(db, n) : "")}
      />
    );
  }
  return <FixedItems db={db} items={ctx.getSavedFixed(row.rowId)} />;
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
