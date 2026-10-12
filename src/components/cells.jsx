import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined";
import { Chip } from "@mui/material";
import { useState } from "react";
import { formatDate, isCategoryType } from "../lib/utils";

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
// "Created" / "Last Updated" headers: click to sort by that date. The arrow marks the active sort: down = newest first (default on Created), up = oldest first.
export function useDateSort() {
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const onSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));
  const sortRows = (rows) => [...rows].sort((a, b) => (new Date(a[sort.key]) - new Date(b[sort.key])) * (sort.dir === "desc" ? -1 : 1));
  return { sort, onSort, sortRows };
}
export const SortHeader = (p) => {
  const active = p.sort.key === p.field;
  const Arrow = p.sort.dir === "desc" ? ArrowDownwardOutlined : ArrowUpwardOutlined;
  return (
    <button type="button" className="sort-hdr" onClick={() => p.onSort(p.field)} title={active ? (p.sort.dir === "desc" ? "Sorted newest first" : "Sorted oldest first") : "Sort by " + p.displayName}>
      {p.displayName}
      {active ? <Arrow fontSize="inherit" /> : null}
    </button>
  );
};
export const sortCols = (sort, onSort) => [
  { field: "createdAt", headerName: "Created" },
  { field: "updatedAt", headerName: "Last Updated" },
].map((c) => ({ ...c, width: 170, headerComponent: SortHeader, headerComponentParams: { field: c.field, sort, onSort }, valueFormatter: (p) => formatDate(p.value) }));
