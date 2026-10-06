import { Chip } from "@mui/material";
import { isPersonnelCycle } from "../lib/utils";

export function FamilyTag({ name, cycle, variant = "tag", ...rest }) {
  return <Chip variant={variant} label={name} className={cycle ? `tag-cycle-${cycle}` : ""} {...rest} />;
}
export const Dash = () => <span className="muted">—</span>;
function personnelWithFamilies(db, m) {
  return (m.personnel || []).filter((p) => ((m.links || {})[p] || []).length > 0);
}
function PersonnelCell({ db, m }) {
  if (!isPersonnelCycle(m.cycle)) return <Dash />;
  const list = personnelWithFamilies(db, m);
  return list.length ? list.join(", ") : <Dash />;
}
export function FamilyCell({ db, m }) {
  if (isPersonnelCycle(m.cycle)) {
    return (
      <div>
        {personnelWithFamilies(db, m).map((p) => (
          <div key={p} className="family-tags-wrap" style={{ marginBottom: 4, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 11 }}>
              {p}:
            </span>
            {m.links[p].map((f) => (
              <FamilyTag key={f} name={f} cycle={m.cycle} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="family-tags-wrap">
      {m.families.map((f) => (
        <FamilyTag key={f} name={f} cycle={m.cycle} />
      ))}
    </div>
  );
}
