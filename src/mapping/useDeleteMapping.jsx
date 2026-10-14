import { DeleteMappingPreview, UndoNote } from "../components/previews";
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
    // The title names what is deleted; a Type O Mapping is also identified by its Activity Type.
    const title = m.type === "O" ? "Delete Type O Mapping" : m.type === "X" ? `Delete X - ${m.code} Mapping` : "Delete Type T/X Mapping";
    const ok = await confirm(
      <>
        {m.type === "O" ? (
          <p style={{ margin: removed.length ? "0 0 16px" : 0 }}>
            <span className="param-label">Activity Type</span> {m.activityType}
            {removed.length ? <span className="param-label">:</span> : null}
          </p>
        ) : null}
        {removed.length ? (
          <>
            <DeleteMappingPreview db={db} m={m} removed={removed} />
            <p style={{ margin: "16px 0 0" }}>Deleting this Mapping will also remove it from Schedule.</p>
          </>
        ) : null}
        <UndoNote />
      </>,
      { title, confirmLabel: "Delete", destructive: true },
    );
    if (!ok) return false;
    setDb((d) => pruneSchedule(afterDelete(d)).db);
    notify(removed.length ? "Mapping deleted and removed from Schedule" : "Mapping deleted");
    return true;
  };
}
