import { Button } from "@mui/material";
import { FamilyFields } from "./FamilyFields";
import { useEffect, useState } from "react";
import { nowStamp, up, withAdded } from "../lib/utils";
import { pruneSchedule, validateFamily, withTabDots } from "../lib/domain";
import { snap, useInitialSnapshot } from "../components/EditGrid";
import { useDb, useUi } from "../components/common";
import { FIXED_FAMILY } from "../constants";
import { useDeleteFamily } from "./useDeleteFamily";

export function FamilyForm({ editingName, fromTab, dirtyRef, onDone, onDiscard }) {
  const { db, setDb } = useDb();
  const { notify } = useUi();
  const deleteFamily = useDeleteFamily();
  const existing = editingName ? db.families.find((f) => f.name === editingName) : null;
  const [name, setName] = useState(editingName || "");
  const [products, setProducts] = useState(existing ? [...existing.products] : [""]);
  const [errors, setErrors] = useState({});
  const norm = (n, ps) => ({ name: up((n || "").trim()), products: ps.map((p) => up((p || "").trim())).filter(Boolean) });
  const initialFam = useInitialSnapshot(norm(editingName || "", existing ? existing.products : [""]));
  const changed = snap(norm(name, products)) !== initialFam;
  useEffect(() => {
    dirtyRef.current = false;
  }, []);
  const dirty = () => {
    dirtyRef.current = true;
  };
  // A Product that is some Unit's Fixed Product cannot be removed here: it names that Unit.
  const fixedUnitOf = (product) => {
    const n = up((product || "").trim());
    if (!existing || !existing.products.includes(n)) return null;
    return Object.keys(db.fixed || {}).find((u) => (db.fixed[u] || []).some((x) => x.name === n)) || null;
  };
  function save() {
    const res = validateFamily(db.families, name, products, editingName);
    if (res.errors) return setErrors(res.errors);
    setErrors({});
    const now = nowStamp();
    setDb((d) => {
      let { families, mappings, schedules, activitySchedules } = d;
      if (editingName) {
        families = families.map((f) =>
          f.name === editingName ? { name: res.name, products: res.products, createdAt: f.createdAt, updatedAt: now } : f,
        );
        if (editingName !== res.name) {
          const rename = (f) => (f === editingName ? res.name : f);
          mappings = mappings.map((m) => ({
            ...m,
            families: m.families.map(rename),
            links: m.links ? Object.fromEntries(Object.entries(m.links).map(([p, arr]) => [p, arr.map(rename)])) : m.links,
          }));
          schedules = schedules.map((s) => ({ ...s, family: rename(s.family) }));
          activitySchedules = activitySchedules.map((s) => ({ ...s, family: rename(s.family) }));
        }
      } else families = [...families, { name: res.name, products: res.products, createdAt: now, updatedAt: now }];
      return withTabDots(
        d,
        pruneSchedule({
          ...d,
          families,
          mappings,
          schedules,
          activitySchedules,
          changedFamilies: withAdded(d.changedFamilies, res.name),
        }).db,
        fromTab,
      );
    });
    onDone();
    notify(editingName ? "Product Family updated" : "Product Family created");
  }
  return (
    <>
      <div className="modal-body fam-body">
        <FamilyFields
          idPrefix="fam"
          name={name}
          setName={setName}
          products={products}
          setProducts={setProducts}
          errors={errors}
          setErrors={setErrors}
          dirty={dirty}
          fixedUnitOf={fixedUnitOf}
        />
      </div>
      <div className="modal-footer">
        <Button variant="primary" disabled={!changed} onClick={save}>
          {editingName ? "Update" : "Create"}
        </Button>
        <Button variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
        {editingName ? (
          <Button
            variant="dangerOutline"
            className="footer-delete"
            disabled={editingName === FIXED_FAMILY}
            onClick={async () => {
              if (await deleteFamily(editingName)) {
                dirtyRef.current = false;
                onDone();
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </>
  );
}
