import { DeleteMappingPreview, UndoNote, mappingSummary } from "../components/previews";
import { pruneSchedule } from "../lib/domain";
import { useDb, useUi } from "../components/common";
import { without } from "../lib/utils";

// Delete flow shared by the Mapping list (Delete icon) and Update Mapping (Delete button). Resolves true once the Mapping is deleted.
export function useDeleteMapping() {
  const { db, setDb } = useDb();
  const { confirm, notify } = useUi();
  return async function deleteMapping(id) {
    const m = db.mappings.find((x) => x.id === id);
    if (!m) return false;
    // Schedule entries that only this Mapping allowed go with it.
    const afterDelete = (d) => ({ ...d, mappings: d.mappings.filter((x) => x.id !== id), changedMappings: without(d.changedMappings, id) });
    const { removed } = pruneSchedule(afterDelete(db));
    const ok = await confirm(
      <>
        <p style={{ margin: "0 0 16px" }}>
          {mappingSummary(m)}
          <span className="param-label">:</span>
        </p>
        <DeleteMappingPreview db={db} m={m} removed={removed} />
        {removed.length ? <p style={{ margin: "16px 0 0" }}>Deleting this Mapping will also remove it from Schedule.</p> : null}
        <UndoNote />
      </>,
      { title: "Delete Mapping", confirmLabel: "Delete", destructive: true },
    );
    if (!ok) return false;
    setDb((d) => pruneSchedule(afterDelete(d)).db);
    notify(removed.length ? "Mapping deleted and removed from Schedule" : "Mapping deleted");
    return true;
  };
}
