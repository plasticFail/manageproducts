import { DeleteFamilyPreview, UndoNote } from "../components/previews";
import { isCategoryType, without } from "../lib/utils";
import { pruneSchedule, scheduleUsage } from "../lib/domain";
import { useDb, useUi } from "../components/common";

// Delete flow shared by the Product Family list (Delete icon) and Update Product Family (Delete button). Resolves true once deleted.
export function useDeleteFamily() {
  const { db, setDb } = useDb();
  const { confirm, notify } = useUi();
  return async function deleteFamily(name) {
    const inMapping = db.mappings.some((m) => m.families.includes(name));
    const scheduled = scheduleUsage(db, [name]).length > 0;
    const mapped = inMapping || scheduled;
    let body,
      confirmLabel = "Delete",
      emptiedCount = 0;
    if (mapped) {
      // Mappings left with no Product Family are deleted as a whole row.
      emptiedCount = db.mappings.filter((m) => m.families.length === 1 && m.families[0] === name).length;
      const where = inMapping && scheduled ? "Mapping and Schedule" : inMapping ? "Mapping" : "Schedule";
      body = (
        <>
          <DeleteFamilyPreview db={db} name={name} />
          <p style={{ margin: "16px 0 0" }}>{`Deleting this Product Family will also remove it from ${where}.`}</p>
          {emptiedCount ? (
            <p style={{ margin: "16px 0 0" }}>
              {emptiedCount === 1
                ? "Its Mapping has no other Product Family, so the whole Mapping will be deleted."
                : "Its Mappings have no other Product Family, so they will be deleted."}
            </p>
          ) : null}
        </>
      );
    } else {
      body = null;
    }
    const ok = await confirm(
      <>
        {body}
        <UndoNote />
      </>,
      { title: `Delete ${name}`, confirmLabel, destructive: true },
    );
    if (!ok) return false;
    setDb((d) => {
      let mappings = d.mappings.map((m) => {
        if (!m.families.includes(name)) return m;
        if (!isCategoryType(m.type)) return { ...m, families: without(m.families, name) };
        const linked = Object.fromEntries(Object.entries(m.links || {}).map(([p, arr]) => [p, without(arr, name)]));
        const category = (m.category || []).filter((p) => (linked[p] || []).length > 0);
        return { ...m, category, links: Object.fromEntries(category.map((p) => [p, linked[p]])), families: without(m.families, name) };
      });
      const emptied = mappings.filter((m) => m.families.length === 0).map((m) => m.id);
      mappings = mappings.filter((m) => m.families.length > 0);
      return pruneSchedule({
        ...d,
        mappings,
        changedMappings: d.changedMappings.filter((id) => !emptied.includes(id)),
        families: d.families.filter((f) => f.name !== name),
        changedFamilies: without(d.changedFamilies, name),
      }).db;
    });
    notify(
      inMapping && scheduled
        ? "Product Family deleted and removed from Mapping and Schedule"
        : inMapping
          ? "Product Family deleted and removed from Mapping"
          : scheduled
            ? "Product Family deleted and removed from Schedule"
            : "Product Family deleted",
    );
    return true;
  };
}
