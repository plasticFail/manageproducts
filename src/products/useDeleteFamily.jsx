import { DeleteFamilyPreview, UndoNote } from "../components/previews";
import { hasGroups, without } from "../lib/utils";
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
    let body;
    const confirmLabel = "Delete";
    if (mapped) {
      // Mappings left with no Product Family are deleted as a whole row.
      const emptiedCount = db.mappings.filter((m) => m.families.length === 1 && m.families[0] === name).length;
      const mp = db.mappings.find((m) => m.families.includes(name));
      const mapName = mp ? (mp.type === "O" ? "Type O Mapping" : mp.code ? `${mp.type} - ${mp.code} Mapping` : "Type T/X Mapping") : "Mapping";
      const where = inMapping && scheduled ? `${mapName} and Schedule` : inMapping ? mapName : "Schedule";
      body = (
        <>
          <p style={{ margin: 0 }}>
            {`Product Family is currently in use. Deleting this will also remove it from ${where}`}
            {emptiedCount ? ", and delete the Mapping as it has no other Product Family." : "."}
          </p>
          <div style={{ marginTop: 16 }}>
            <DeleteFamilyPreview db={db} name={name} />
          </div>
        </>
      );
    } else {
      body = <p style={{ margin: 0 }}>Product Family is not currently in use. Deleting this will not affect Mapping or Schedule.</p>;
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
        if (!hasGroups(m)) return { ...m, families: without(m.families, name) };
        const linked = Object.fromEntries(Object.entries(m.links || {}).map(([p, arr]) => [p, without(arr, name)]));
        // A Category left with no Product Family goes too.
        const category = (m.category || []).filter((p) => (linked[p] || []).length > 0);
        return { ...m, category, links: Object.fromEntries(category.map((p) => [p, linked[p]])), families: without(m.families, name) };
      });
      // O/T/X Mappings hold Products from FIXED, not Product Families, so they never count as emptied.
      const emptied = mappings.filter((m) => m.families.length === 0 && !m.units).map((m) => m.id);
      mappings = mappings.filter((m) => !emptied.includes(m.id));
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
