import { Button } from "@mui/material";
import { CreateFamilyDialog } from "../products/FamilyFields";
import { FieldLabel, Section, useDb, useUi } from "../components/common";
import { PERSONNEL_BY_PROJECT_TYPE, PROJECT_TYPES } from "../constants";
import { PickerField, SelectField } from "../components/PickerField";
import { useEffect, useState } from "react";
import { RemovedSchedulePreview, UndoNote } from "../components/previews";
import { isPersonnelCycle, nowStamp, ownershipLabels, productTextList, toggle, withAdded, without } from "../lib/utils";
import { projectRows, pruneSchedule, validateFamily, withTabDots } from "../lib/domain";
import { snap, useInitialSnapshot } from "../components/EditGrid";

export function MappingForm({ editingId, prefill, fromTab, dirtyRef, onDone, onDiscard }) {
  const { db, setDb } = useDb();
  const { confirm, notify, openSchedule } = useUi();
  const m = editingId ? db.mappings.find((x) => x.id === editingId) : null;
  const [cycle, setCycleRaw] = useState(m ? m.cycle : (prefill && prefill.cycle) || "");
  const [code, setCode] = useState(m ? m.code || "" : (prefill && prefill.code) || "");
  const [pt, setPt] = useState(m ? m.projectType || "" : "");
  const [personnel, setPersonnel] = useState(m ? [...(m.personnel || [])] : []);
  const [links, setLinks] = useState(() => {
    const l = {};
    if (m && isPersonnelCycle(m.cycle))
      (m.personnel || []).forEach((p) => {
        l[p] = [...((m.links || {})[p] || [])];
      });
    return l;
  });
  const [tFam, setTFam] = useState(m && m.cycle === "T" ? [...m.families] : []);
  const [xFam, setXFam] = useState(m && m.cycle === "X" ? [...m.families] : []);
  const [drafts, setDrafts] = useState([]);
  const [errors, setErrors] = useState({});
  const initialMapping = useInitialSnapshot({ cycle, code, pt, personnel, links, tFam, xFam });
  const mappingChanged = snap({ cycle, code, pt, personnel, links, tFam, xFam }) !== initialMapping;
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
  const prepExists = db.mappings.some((x) => x.cycle === "X" && x.code === "PREP" && x.id !== editingId);
  const tExists = db.mappings.some((x) => x.cycle === "T" && x.id !== editingId);
  const xFull = db.mappings.some((x) => x.cycle === "X" && !x.code && x.id !== editingId) && prepExists;
  const xPlainExists = db.mappings.some((x) => x.cycle === "X" && !x.code && x.id !== editingId);
  // One Mapping each for T, X (no Code) and X · PREP: once X (no Code) exists, X can only be PREP.
  const codeDisabled = cycle !== "X" || prepExists || xPlainExists;
  const single = cycle === "X" && code === "PREP";
  function setCycle(v) {
    dirty();
    setErrors({});
    setCycleRaw(v);
    if (v !== "X" || prepExists) setCode("");
    else if (xPlainExists) setCode("PREP");
    if (!isPersonnelCycle(v)) {
      setPt("");
      setPersonnel([]);
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
    clearError("pt", "personnel");
    if (!v) {
      setPersonnel([]);
      setLinks({});
      return;
    }
    const allowed = PERSONNEL_BY_PROJECT_TYPE[v] || [];
    setPersonnel(personnel.filter((p) => allowed.includes(p)));
  }
  function togglePersonnel(p) {
    dirty();
    clearError("personnel", `fam:${p}`);
    if (personnel.includes(p)) {
      setPersonnel(without(personnel, p));
      const l = { ...links };
      delete l[p];
      setLinks(l);
    } else {
      setPersonnel([...personnel, p]);
      setLinks({ ...links, [p]: [] });
    }
  }
  const togglePersonnelFamily = (p, f) => {
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
  const owners = (f, exclude) => ownershipLabels(db, f, { excludePersonnel: exclude, editingId, formLinks: links });
  function saveDraft(name, products) {
    const res = validateFamily(allFamilies, name, products);
    if (res.errors) return res.errors;
    dirty();
    clearError(createCtx.personnel ? `fam:${createCtx.personnel}` : createCtx.forT ? "fam:T" : "fam:X");
    setDrafts([...drafts, { name: res.name, products: res.products }]);
    if (createCtx.personnel) setLinks({ ...links, [createCtx.personnel]: [...(links[createCtx.personnel] || []), res.name] });
    else if (createCtx.forT) setTFam([...tFam, res.name]);
    else if (createCtx.forX) setXFam(single ? [res.name] : [...xFam, res.name]);
    setCreateCtx(null);
    return null;
  }
  async function save() {
    let data;
    let used = [];
    const errs = {};
    if (!cycle) errs.cycle = "This is a required field.";
    if (isPersonnelCycle(cycle)) {
      if (!pt) errs.pt = "This is a required field.";
      else if (!personnel.length) errs.personnel = "This is a required field.";
      personnel
        .filter((p) => !(links[p] || []).length)
        .forEach((p) => {
          errs[`fam:${p}`] = "This is a required field.";
        });
      used = [...new Set(personnel.flatMap((p) => links[p] || []))];
      data = {
        cycle,
        code: null,
        projectType: pt,
        personnel: [...personnel],
        links: Object.fromEntries(personnel.map((p) => [p, [...(links[p] || [])]])),
        families: used,
      };
    } else if (cycle === "T") {
      if (!tFam.length) errs["fam:T"] = "This is a required field.";
      used = [...tFam];
      data = { cycle, code: null, projectType: null, personnel: null, links: null, families: used };
    } else if (cycle === "X") {
      if (!xFam.length) errs["fam:X"] = "This is a required field.";
      used = [...xFam];
      data = { cycle, code: code || null, projectType: null, personnel: null, links: null, families: used };
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
      // New Project Type + Personnel rows show up in Schedule > Project Type with the changed dot.
      const newFamilies = usedDrafts.map((dr) => dr.name).filter((n) => !d.families.some((f) => f.name === n)); // Product Families created with this Mapping get the changed dot too
      const next = {
        ...d,
        families,
        mappings,
        nextMappingId,
        changedMappings: withAdded(d.changedMappings, savedId),
        changedFamilies: [...new Set([...d.changedFamilies, ...newFamilies])],
      };
      const before = new Set(projectRows(d).map((r) => r.rowId));
      next.changedProjectRows = [
        ...new Set([
          ...d.changedProjectRows,
          ...projectRows(next)
            .map((r) => r.rowId)
            .filter((id) => !before.has(id)),
        ]),
      ];
      return pruneSchedule(next);
    };
    // Preview what this save would take out of Schedule (e.g. a Product Family unmapped from Cycle O while still scheduled).
    const removed = buildNext(db).removed;
    const removedFams = [...new Set(removed.map((r) => r.family))];
    const unmapped = removedFams.filter((f) => !used.includes(f)); // taken out of this Mapping
    const moved = removedFams.filter((f) => used.includes(f)); // still mapped, but its Cycle / Code no longer fits where it's scheduled
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
                >{`Moving ${moved.length === 1 ? "this Product Family" : "these Product Families"} to Type ${cycle}${code ? ", Code " + code : ""} will also remove ${moved.length === 1 ? "it" : "them"} from Schedule.`}</p>
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
    // Snackbar CTA: Cycle O rows appear in Schedule > Project Type; Cycle T goes to Schedule > Household.
    let cta = null;
    if (cycle === "O") {
      if (
        !(prefill && prefill.fromSchedule) &&
        personnel.some((p) => !db.projectSchedules.some((x) => x.projectType === pt && x.personnel === p))
      )
        cta = { label: "Schedule for Activity Type", onClick: () => openSchedule("project") };
    } else if (cycle === "T") {
      if (!(prefill && prefill.fromSchedule) && used.some((f) => !db.schedules.some((x) => x.family === f)))
        cta = { label: "Schedule for Unit", onClick: () => openSchedule("household") };
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
  function familyPicker({ key, legend, value, onToggle, onClear, exclude = null, projectType, createCtxValue, isSingle = false }) {
    return (
      <Section key={key} legend={legend}>
        <PickerField
          id={`fam-${key}`}
          options={familyNames}
          value={value}
          single={isSingle}
          onToggle={onToggle}
          onClear={onClear}
          getDisabled={(f) => owners(f, exclude, projectType).length > 0}
          getSub={(f) => {
            const o = owners(f, exclude, projectType);
            return o.length ? `Mapped to: ${o.join(", ")}` : "";
          }}
          getDetail={productsOf}
          allowCreate
          chipClass={() => `tag-cycle-${cycle}`}
          onCreate={(term) => setCreateCtx({ ...createCtxValue, prefill: term })}
          error={errors[`fam:${key}`]}
        />
      </Section>
    );
  }
  let familySection;
  if (isPersonnelCycle(cycle)) {
    if (!pt) familySection = <div className="empty form-empty">Select all dropdown options to continue</div>;
    else if (!personnel.length) familySection = <div className="empty form-empty">Select all dropdown options to continue</div>;
    else
      familySection = personnel.map((p) =>
        familyPicker({
          key: p,
          legend: `Product Family mapped to ${p}`,
          value: links[p] || [],
          exclude: p,
          projectType: pt,
          onToggle: (f) => togglePersonnelFamily(p, f),
          onClear: () => {
            dirty();
            setLinks({ ...links, [p]: [] });
          },
          createCtxValue: { personnel: p },
        }),
      );
  } else if (cycle === "T") {
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
  } else if (cycle === "X") {
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
  const personnelOptions = pt ? PERSONNEL_BY_PROJECT_TYPE[pt] || [] : [];
  const personnelUsed = (p) => db.mappings.some((mm) => mm.projectType === pt && (mm.personnel || []).includes(p) && mm.id !== editingId);
  return (
    <>
      <div className="modal-body">
        <Section>
          <div className="grid4">
            <div className="field">
              <FieldLabel htmlFor="f-cycle">Type</FieldLabel>
              <SelectField
                id="f-cycle"
                placeholder="Type"
                value={cycle}
                onChange={setCycle}
                onClear={() => setCycle("")}
                error={errors.cycle}
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
              <FieldLabel htmlFor="f-projectType">Activity Type</FieldLabel>
              <SelectField
                id="f-projectType"
                placeholder="Activity Type"
                value={pt}
                disabled={!isPersonnelCycle(cycle)}
                onChange={changePt}
                onClear={() => changePt("")}
                error={errors.pt}
                options={PROJECT_TYPES.map((p) => ({ value: p }))}
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="f-personnel">Category</FieldLabel>
              <PickerField
                id="f-personnel"
                placeholder="Category"
                uppercase={false}
                disabled={!isPersonnelCycle(cycle) || !pt}
                options={personnelOptions}
                value={personnel}
                onToggle={togglePersonnel}
                onClear={() => {
                  dirty();
                  setPersonnel([]);
                  setLinks({});
                }}
                getDisabled={personnelUsed}
                getSub={(p) => {
                  if (!personnelUsed(p) || personnel.includes(p)) return "";
                  const other = db.mappings.find((mm) => mm.projectType === pt && (mm.personnel || []).includes(p) && mm.id !== editingId);
                  return other ? `Mapped to ${((other.links || {})[p] || []).join(", ")}` : "";
                }}
                error={errors.personnel}
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
