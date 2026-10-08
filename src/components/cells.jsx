import { Chip } from "@mui/material";
import { isCategoryType } from "../lib/utils";

// Table chip: one fill for every Product Family (no Type colours).
export function FamilyTag({ name, variant = "tag", ...rest }) {
  return <Chip variant={variant} label={name} className="table-chip" {...rest} />;
}
export const Dash = () => <span className="muted">—</span>;
function categoryWithFamilies(db, m) {
  return (m.category || []).filter((p) => ((m.links || {})[p] || []).length > 0);
}
function CategoryCell({ db, m }) {
  if (!isCategoryType(m.type)) return <Dash />;
  const list = categoryWithFamilies(db, m);
  return list.length ? list.join(", ") : <Dash />;
}
export function FamilyCell({ db, m }) {
  if (isCategoryType(m.type)) {
    return (
      <div>
        {categoryWithFamilies(db, m).map((p) => (
          <div key={p} className="family-tags-wrap" style={{ marginBottom: 4, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>
              {p}:
            </span>
            {m.links[p].map((f) => (
              <FamilyTag key={f} name={f} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="family-tags-wrap">
      {m.families.map((f) => (
        <FamilyTag key={f} name={f} />
      ))}
    </div>
  );
}
