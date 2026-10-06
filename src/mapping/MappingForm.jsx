import { Button } from "@mui/material";
import { CreateFamilyDialog } from "../products/FamilyFields";
import { FieldLabel, Section, useDb, useUi } from "../components/common";
import { CATEGORY_BY_ACTIVITY_TYPE, ACTIVITY_TYPES } from "../constants";
import { PickerField, SelectField } from "../components/PickerField";
import { useEffect, useState } from "react";
import { RemovedSchedulePreview, UndoNote } from "../components/previews";
import { isCategoryType, nowStamp, ownershipLabels, productTextList, toggle, withAdded, without } from "../lib/utils";
import { activityRows, pruneSchedule, validateFamily, withTabDots } from "../lib/domain";
import { snap, useInitialSnapshot } from "../components/EditGrid";

export function MappingForm({ editingId, prefill, fromTab, dirtyRef, onDone, onDiscard }) {
  const { db, setDb } = useDb();
  const { confirm, notify, openSchedule } = useUi();
  const m = editingId ? db.mappings.find((x) => x.id === editingId) : null;
  const [type, setTypeRaw] = useState(m ? m.type : (prefill && prefill.type) || "");
  const [code, setCode] = useState(m ? m.code || "" : (prefill && prefill.code) || "");
  const [pt, setPt] = useState(m ? m.activityType || "" : "");
  const [category, setCategory] = useState(m ? [...(m.category || [])] : []);
  const [links, setLinks] = useState(() => {
    const l = {};
    if (m && isCategoryType(m.type))
      (m.category || []).forEach((p) => {
        l[p] = [...((m.links || {})[p] || [])];
      });
    return l;
  });
  const [tFam, setTFam] = useState(m && m.type === "T" ? [...m.families] : []);
  const [xFam, setXFam] = useState(m && m.type === "X" ? [...m.families] : []);
  const [drafts, setDrafts] = useState([]);
  const [errors, setErrors] = useState({});
  const initialMapping = useInitialSnapshot({ type, code, pt, category, links, tFam, xFam });
  const mappingChanged = snap({ type, code, pt, category, links, tFam, xFam }) !== initialMapping;
  const clearError = (...keys) =>
    setErrors((e) => {
      if (!keys.some((k) => e[k])) return e;
      const n = { ...e };
      keys.forEach((k) => delete n[k]);
      return n;
    });
  const [createCtx, setCreateCtx] = useState(null);
  useEffect(() => {
    dirtyRef.current = false;
  }, []);
  const dirty = () => {
    dirtyRef.current = true;
  };
  const allFamilies = [...db.families, ...drafts];
  const familyNames = allFamilies.map((f) => f.name).sort((a, b) => a.localeCompare(b));
  const productsOf = (name) => productTextList((allFamilies.find((f) => f.name === name) || { products: [] }).products);
  const prepExists = db.mappings.some((x) => x.type === "X" && x.code === "PREP" && x.id !== editingId);
  const tExists = db.mappings.some((x) => x.type === "T" && x.id !== editingId);
  const xFull = db.mappings.some((x) => x.type === "X" && !x.code && x.id !== editingId) && prepExists;
  const xPlainExists = db.mappings.some((x) => x.type === "X" && !x.code && x.id !== editingId);
  // One Mapping each for T, X (no Code) and X · PREP: once X (no Code) exists, X can only be PREP.
  const codeDisabled = type !== "X" || prepExists || xPlainExists;
  const single = type === "X" && code === "PREP";
  function setType(v) {
    dirty();
    setErrors({});
    setTypeRaw(v);
    if (v !== "X" || prepExists) setCode("");
    else if (xPlainExists) setCode("PREP");
    if (!isCategoryType(v)) {
      setPt("");
      setCategory([]);
      setLinks({});
    }
  }
  function changeCode(v) {
    dirty();
    setCode(v);
    if (v === "PREP" && xFam.length > 1) setXFam([xFam[0]]);
  }
  function changePt(v) {
    dirty();
    setPt(v);
    clearError("pt", "category");
    if (!v) {
      setCategory([]);
      setLinks({});
      return;
    }
    const allowed = CATEGORY_BY_ACTIVITY_TYPE[v] || [];
    setCategory(category.filter((p) => allowed.includes(p)));
  }
  function toggleCategory(p) {
    dirty();
    clearError("category", `fam:${p}`);
    if (category.includes(p)) {
      setCategory(without(category, p));
      const l = { ...links };
      delete l[p];
      setLinks(l);
    } else {
      setCategory([...category, p]);
      setLinks({ ...links, [p]: [] });
    }
  }
  const toggleCategoryFamily = (p, f) => {
    dirty();
    clearError(`fam:${p}`);
    setLinks({ ...links, [p]: toggle(links[p] || [], f) });
  };
  const toggleT = (f) => {
    dirty();
    clearError("fam:T");
    setTFam(toggle(tFam, f));
  };
  const toggleX = (f) => {
    dirty();
    clearError("fam:X");
    setXFam(single ? (xFam.includes(f) ? [] : [f]) : toggle(xFam, f));
  };
  const owners = (f, exclude) => ownershipLabels(db, f, { excludeCategory: exclude, editingId, formLinks: links });
  function saveDraft(name, products) {
    const res = validateFamily(allFamilies, name, products);
    if (res.errors) return res.errors;
    dirty();
    clearError(createCtx.category ? `fam:${createCtx.category}` : createCtx.forT ? "fam:T" : "fam:X");
    setDrafts([...drafts, { name: res.name, products: res.products }]);
    if (createCtx.category) setLinks({ ...links, [createCtx.category]: [...(links[createCtx.category] || []), res.name] });
    else if (createCtx.forT) setTFam([...tFam, res.name]);
    else if (createCtx.forX) setXFam(single ? [res.name] : [...xFam, res.name]);
    setCreateCtx(null);
    return null;
  }
  async function save() {
    let data;
    let used = [];
    const errs = {};
    if (!type) errs.type = "This is a required field.";
    if (isCategoryType(type)) {
      if (!pt) errs.pt = "This is a required field.";
      else if (!category.length) errs.category = "This is a required field.";
      category
        .filter((p) => !(links[p] || []).length)
        .forEach((p) => {
          errs[`fam:${p}`] = "This is a required field.";
        });
      used = [...new Set(category.flatMap((p) => links[p] || []))];
      data = {
        type,
        code: null,
        activityType: pt,
        category: [...category],
        links: Object.fromEntries(category.map((p) => [p, [...(links[p] || [])]])),
        families: used,
      };
    } else if (type === "T") {
      if (!tFam.length) errs["fam:T"] = "This is a required field.";
      used = [...tFam];
      data = { type, code: null, activityType: null, category: null, links: null, families: used };
    } else if (type === "X") {
      if (!xFam.length) errs["fam:X"] = "This is a required field.";
      used = [...xFam];
      data = { type, code: code || null, activityType: null, category: null, links: null, families: used };
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const usedDrafts = drafts.filter((d) => used.includes(d.name));
    const now = nowStamp();
    const buildNext = (d) => {
      const families = [...d.families];
      usedDrafts.forEach((dr) => {
        if (!families.some((f) => f.name === dr.name)) families.push({ ...dr, createdAt: now, updatedAt: now });
      });
      let mappings,
        savedId,
        nextMappingId = d.nextMappingId;
      if (m) {
        savedId = m.id;
        mappings = d.mappings.map((x) => (x.id === m.id ? { ...x, ...data, updatedAt: now } : x));
      } else {
        savedId = nextMappingId++;
        mappings = [...d.mappings, { id: savedId, ...data, createdAt: now, updatedAt: now }];
      }
      // New Activity Type + Category rows show up in Schedule > Activity Type with the changed dot.
      const newFamilies = usedDrafts.map((dr) => dr.name).filter((n) => !d.families.some((f) => f.name === n)); // Product Families created with this Mapping get the changed dot too
      const next = {
        ...d,
        families,
        mappings,
        nextMappingId,
        changedMappings: withAdded(d.changedMappings, savedId),
        changedFamilies: [...new Set([...d.changedFamilies, ...newFamilies])],
      };
      const before = new Set(activityRows(d).map((r) => r.rowId));
      next.changedActivityRows = [
        ...new Set([
          ...d.changedActivityRows,
          ...activityRows(next)
            .map((r) => r.rowId)
            .filter((id) => !before.has(id)),
        ]),
      ];
      return pruneSchedule(next);
    };
    // Preview what this save would take out of Schedule (e.g. a Product Family unmapped from Type O while still scheduled).
    const removed = buildNext(db).removed;
    const removedFams = [...new Set(removed.map((r) => r.family))];
    const unmapped = removedFams.filter((f) => !used.includes(f)); // taken out of this Mapping
    const moved = removedFams.filter((f) => used.includes(f)); // still mapped, but its Type / Code no longer fits where it's scheduled
    if (usedDrafts.length || removed.length) {
      const draftLine = usedDrafts.length ? (
        <p
          style={{ margin: 0 }}
        >{`${m ? "Updating" : "Creating"} this Mapping will also create new Product Family ${usedDrafts.map((d) => d.name).join(", ")}.`}</p>
      ) : null;
      const ok = await confirm(
        <>
          {draftLine}
          {removed.length ? (
            <>
              <div style={{ marginTop: draftLine ? 16 : 0 }}>
                <RemovedSchedulePreview db={db} rows={removed} />
              </div>
              {unmapped.length ? (
                <p style={{ margin: "16px 0 0" }}>
                  {unmapped.length === 1
                    ? "Removing this Product Family from this Mapping will also remove it from Schedule."
                    : "Removing these Product Families from this Mapping will also remove them from Schedule."}
                </p>
              ) : null}
              {moved.length ? (
                <p
                  style={{ margin: "16px 0 0" }}
                >{`Moving ${moved.length === 1 ? "this Product Family" : "these Product Families"} to Type ${type}${code ? ", Code " + code : ""} will also remove ${moved.length === 1 ? "it" : "them"} from Schedule.`}</p>
              ) : null}
              <UndoNote />
            </>
          ) : null}
        </>,
        { title: m ? "Update Mapping" : "Create Mapping", confirmLabel: m ? "Update" : "Create" },
      );
      if (!ok) return;
    }
    setDb((d) => withTabDots(d, buildNext(d).db, fromTab));
    onDone();
    // Snackbar CTA: Type O rows appear in Schedule > Activity Type; Type T goes to Schedule > Unit.
    let cta = null;
    if (type === "O") {
      if (
        !(prefill && prefill.fromSchedule) &&
        category.some((p) => !db.activitySchedules.some((x) => x.activityType === pt && x.category === p))
      )
        cta = { label: "Schedule for Activity Type", onClick: () => openSchedule("activity") };
    } else if (type === "T") {
      if (!(prefill && prefill.fromSchedule) && used.some((f) => !db.schedules.some((x) => x.family === f)))
        cta = { label: "Schedule for Unit", onClick: () => openSchedule("unit") };
    }
    // New Product Families created with this Mapping are named in the snackbar too.
    const createdPart = usedDrafts.length === 1 ? `Product Family ${usedDrafts[0].name}` : usedDrafts.length + " Product Families";
    const removedPart = removedFams.length
      ? `${removedFams.length === 1 ? removedFams[0] : removedFams.length + " Product Families"} removed from Schedule`
      : "";
    const done = !m
      ? usedDrafts.length
        ? `Mapping and ${createdPart} created.`
        : "Mapping created."
      : usedDrafts.length && removedPart
        ? `Mapping updated, ${createdPart} created and ${removedPart}.`
        : usedDrafts.length
          ? `Mapping updated and ${createdPart} created.`
          : removedPart
            ? `Mapping updated and ${removedPart}.`
            : "Mapping updated.";
    notify(done, cta);
  }
  function familyPicker({ key, legend, value, onToggle, onClear, exclude = null, activityType, createCtxValue, isSingle = false }) {
    return (
      <Section key={key} legend={legend}>
        <PickerField
          id={`fam-${key}`}
          options={familyNames}
          value={value}
          single={isSingle}
          onToggle={onToggle}
          onClear={onClear}
          getDisabled={(f) => owners(f, exclude, activityType).length > 0}
          getSub={(f) => {
            const o = owners(f, exclude, activityType);
            return o.length ? `Mapped to: ${o.join(", ")}` : "";
          }}
          getDetail={productsOf}
          allowCreate
          chipClass={() => `tag-type-${type}`}
          onCreate={(term) => setCreateCtx({ ...createCtxValue, prefill: term })}
          error={errors[`fam:${key}`]}
        />
      </Section>
    );
  }
  let familySection;
  if (isCategoryType(type)) {
    if (!pt) familySection = <div className="empty form-empty">Select all dropdown options to continue</div>;
    else if (!category.length) familySection = <div className="empty form-empty">Select all dropdown options to continue</div>;
    else
      familySection = category.map((p) =>
        familyPicker({
          key: p,
          legend: `Product Family mapped to ${p}`,
          value: links[p] || [],
          exclude: p,
          activityType: pt,
          onToggle: (f) => toggleCategoryFamily(p, f),
          onClear: () => {
            dirty();
            setLinks({ ...links, [p]: [] });
          },
          createCtxValue: { category: p },
        }),
      );
  } else if (type === "T") {
    familySection = familyPicker({
      key: "T",
      legend: "Product Family",
      value: tFam,
      onToggle: toggleT,
      onClear: () => {
        dirty();
        setTFam([]);
      },
      createCtxValue: { forT: true },
    });
  } else if (type === "X") {
    familySection = familyPicker({
      key: "X",
      legend: "Product Family",
      value: single ? xFam.slice(0, 1) : xFam,
      isSingle: single,
      onToggle: toggleX,
      onClear: () => {
        dirty();
        setXFam([]);
      },
      createCtxValue: { forX: true },
    });
  } else {
    familySection = <div className="empty form-empty">Select all dropdown options to continue</div>;
  }
  const familyInputShown = !!familySection && !(familySection.props && String(familySection.props.className || "").includes("form-empty"));
  const categoryOptions = pt ? CATEGORY_BY_ACTIVITY_TYPE[pt] || [] : [];
  const categoryUsed = (p) => db.mappings.some((mm) => mm.activityType === pt && (mm.category || []).includes(p) && mm.id !== editingId);
  return (
    <>
      <div className="modal-body">
        <Section>
          <div className="grid4">
            <div className="field">
              <FieldLabel htmlFor="f-type">Type</FieldLabel>
              <SelectField
                id="f-type"
                placeholder="Type"
                value={type}
                onChange={setType}
                onClear={() => setType("")}
                error={errors.type}
                options={[
                  { value: "O" },
                  { value: "T", disabled: tExists, hint: tExists ? "Mapped" : "" },
                  { value: "X", disabled: xFull, hint: xFull ? "Mapped" : "" },
                ]}
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="f-code">Code</FieldLabel>
              <SelectField
                id="f-code"
                placeholder="Code"
                value={code}
                disabled={codeDisabled}
                clearable={!xPlainExists}
                onChange={changeCode}
                onClear={() => changeCode("")}
                options={[{ value: "PREP" }]}
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="f-activityType">Activity Type</FieldLabel>
              <SelectField
                id="f-activityType"
                placeholder="Activity Type"
                value={pt}
                disabled={!isCategoryType(type)}
                onChange={changePt}
                onClear={() => changePt("")}
                error={errors.pt}
                options={ACTIVITY_TYPES.map((p) => ({ value: p }))}
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="f-category">Category</FieldLabel>
              <PickerField
                id="f-category"
                placeholder="Category"
                uppercase={false}
                disabled={!isCategoryType(type) || !pt}
                options={categoryOptions}
                value={category}
                onToggle={toggleCategory}
                onClear={() => {
                  dirty();
                  setCategory([]);
                  setLinks({});
                }}
                getDisabled={categoryUsed}
                getSub={(p) => {
                  if (!categoryUsed(p) || category.includes(p)) return "";
                  const other = db.mappings.find((mm) => mm.activityType === pt && (mm.category || []).includes(p) && mm.id !== editingId);
                  return other ? `Mapped to ${((other.links || {})[p] || []).join(", ")}` : "";
                }}
                error={errors.category}
              />
            </div>
          </div>
        </Section>
        {familySection}
      </div>
      <div className="modal-footer">
        <Button variant="primary" disabled={!familyInputShown || (!!m && !mappingChanged)} onClick={save}>
          {m ? "Update" : "Create"}
        </Button>
        <Button variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>
      <CreateFamilyDialog ctx={createCtx} onCancel={() => setCreateCtx(null)} onSave={saveDraft} />
    </>
  );
}
