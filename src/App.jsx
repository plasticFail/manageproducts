import {
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import { ConfirmDialog, DbContext, UiContext } from "./components/common";
import { DATA_PRESETS, initialDb } from "./data/initialDb";
import { DEFAULT_WINDOW_START } from "./schedule/MonthNav";
import { FamilyForm } from "./products/FamilyForm";
import { MappingForm } from "./mapping/MappingForm";
import { MappingList } from "./mapping/MappingList";
import { ProductsList } from "./products/ProductsList";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScheduleGrid } from "./schedule/ScheduleGrid";
import { PERSONAS } from "./constants";
import { theme } from "./theme/index";

const isListView = (v) => ["mappingList", "scheduleGrid", "productsList"].includes(v.name);
const LIST_VIEW = { mapping: { name: "mappingList" }, schedule: { name: "scheduleGrid" }, products: { name: "productsList" } };
const SEARCH_PLACEHOLDER = { mapping: "Search Mapping\u2026", schedule: "Search Schedule\u2026", products: "Search\u2026" };
// One Manage Products window for one persona. The data (db) and its preset live in App, so every persona sees the same data.
function Workspace({ persona, db, setDb }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("mapping");
  const [view, setView] = useState(LIST_VIEW.mapping);
  const [search, setSearch] = useState({ mapping: "", schedule: "", products: "" });
  const [mappingFilter, setMappingFilter] = useState("All");
  const [windowStart, setWindowStart] = useState(DEFAULT_WINDOW_START);
  const [scheduleSub, setScheduleSub] = useState("unit");
  const dirtyRef = useRef(false);
  const [confirmState, setConfirmState] = useState(null);
  const confirm = useCallback((body, opts = {}) => new Promise((resolve) => setConfirmState({ open: true, body, ...opts, resolve })), []);
  const closeConfirm = (result) => {
    if (confirmState) confirmState.resolve(result);
    setConfirmState((s) => (s ? { ...s, open: false } : s));
  };
  const [snack, setSnack] = useState({ open: false, message: "", action: null, n: 0 });
  // Snackbar duration: min 5 s (Type O Mapping created: 8 s), grows with message length, max 10 s; with an action at least 8 s; callers can force a duration.
  const notify = useCallback(
    (message, action = null, duration = null) => setSnack((s) => ({ open: true, message, action, duration, n: s.n + 1 })),
    [],
  );
  // Every Snackbar closes on its own timer (same timing everywhere); it does not pause on hover, focus or window blur, so none can stay open.
  useEffect(() => {
    if (!snack.open) return;
    const ms = snack.duration || Math.max(snack.action ? 8e3 : 0, Math.min(1e4, 5e3 + Math.max(0, String(snack.message).length - 40) * 100));
    const id = setTimeout(() => setSnack((s) => (s.n === snack.n ? { ...s, open: false } : s)), ms);
    return () => clearTimeout(id);
  }, [snack.n, snack.open]);
  // A Unit row being edited in the Schedule table: switching tabs, paging months, opening another row or closing asks first.
  const rowEditRef = useRef({ dirty: false, cancel: () => {} });
  // A Schedule row left open while the user goes off to create a Mapping (and its unsaved choices) is restored when they come back.
  const resumeEditRef = useRef(null);
  const guardRowEdit = useCallback(async () => {
    if (!rowEditRef.current.dirty) return true;
    const ok = await confirm(<p style={{ margin: 0 }}>Changes made will not be saved.</p>, {
      title: "Discard without saving",
      confirmLabel: "Discard",
      cancelLabel: "Back",
      destructive: true,
    });
    if (ok) rowEditRef.current.cancel();
    return ok;
  }, [confirm]);
  const tabRef = useRef(tab);
  tabRef.current = tab;
  // A tab dot stays until every row dot under that tab has been cleared.
  const tabHasRowDots = (t) =>
    t === "mapping"
      ? (db.changedMappings || []).length > 0
      : t === "products"
        ? (db.changedFamilies || []).length > 0
        : (db.changedActivityRows || []).length + (db.changedUnits || []).length > 0;
  useEffect(() => {
    const gone = (db.tabDots || []).filter((t) => !tabHasRowDots(t));
    if (open && gone.length) setDb((d) => ({ ...d, tabDots: d.tabDots.filter((t) => !gone.includes(t)) }));
  }, [open, db]);
  const tabLabel = (text, key) => (
    <span className="tab-label">
      {text}
      {tabHasRowDots(key) ? <span className="tab-dot" /> : null}
    </span>
  );
  useEffect(() => {
    if (!open) resumeEditRef.current = null;
  }, [open]);
  // From the snackbar CTA: jump to Schedule on the Unit or Activity Type tab.
  const openSchedule = useCallback((sub) => {
    setScheduleSub(sub);
    setTab("schedule");
    setView(LIST_VIEW.schedule);
  }, []);
  // From the empty Activity Type tab: open Create Mapping with Type O already chosen.
  const openCreateMapping = useCallback((prefill) => {
    setView({ name: "mappingForm", editingId: null, prefill });
  }, []);
  const toList = () => setView(LIST_VIEW[tab]);
  const back = toList;
  const discard = async () => {
    if (!dirtyRef.current) return back();
    const ok = await confirm(<p style={{ margin: 0 }}>Changes made will not be saved.</p>, {
      title: "Discard without saving",
      confirmLabel: "Discard",
      cancelLabel: "Back",
      destructive: true,
    });
    if (ok) back();
  };
  // Closing Manage Products from a form with unsaved changes asks first, like Discard.
  const closeModal = async () => {
    if (!(await guardRowEdit())) return;
    if (!isListView(view) && dirtyRef.current) {
      const ok = await confirm(<p style={{ margin: 0 }}>Changes made will not be saved.</p>, {
        title: "Discard without saving",
        confirmLabel: "Discard",
        cancelLabel: "Back",
        destructive: true,
      });
      if (!ok) return;
      dirtyRef.current = false;
      toList();
    }
    setOpen(false);
  };
  async function switchTab(t) {
    if (!(await guardRowEdit())) return;
    resumeEditRef.current = null;
    setTab(t);
    setView(LIST_VIEW[t]);
  }
  const isList = ["mappingList", "scheduleGrid", "productsList"].includes(view.name);
  const title =
    {
      mappingForm: view.editingId ? "Update Mapping" : "Create Mapping",
      familyForm: view.editingName ? "Update Product Family" : "Create Product Family",
    }[view.name] || "Manage Products";
  let content = null;
  const formProps = { dirtyRef, onDone: toList, onDiscard: discard, fromTab: tab };
  switch (view.name) {
    case "mappingList":
      content = (
        <MappingList
          search={search.mapping}
          filter={mappingFilter}
          setFilter={setMappingFilter}
          onCreate={() => setView({ name: "mappingForm", editingId: null })}
          onEdit={(id) => setView({ name: "mappingForm", editingId: id })}
        />
      );
      break;
    case "mappingForm":
      content = <MappingForm key={view.editingId || "new"} editingId={view.editingId} prefill={view.prefill} {...formProps} />;
      break;
    case "scheduleGrid":
      content = (
        <ScheduleGrid
          search={search.schedule}
          windowStart={windowStart}
          setWindowStart={setWindowStart}
          sub={scheduleSub}
          setSub={setScheduleSub}
        />
      );
      break;
    case "productsList":
      content = (
        <ProductsList
          search={search.products}
          onCreate={() => setView({ name: "familyForm", editingName: null })}
          onEdit={(n) => setView({ name: "familyForm", editingName: n })}
        />
      );
      break;
    case "familyForm":
      content = <FamilyForm key={view.editingName || "new"} editingName={view.editingName} {...formProps} />;
      break;
  }
  return (
    <>
      <DbContext.Provider value={{ db, setDb }}>
        <UiContext.Provider
          value={{ confirm, notify, openSchedule, openCreateMapping, guardRowEdit, rowEditRef, resumeEditRef, access: persona.access }}
        >
          <div className="wrap">
            <Button
              variant="launcher"
              onClick={() => {
                setTab("mapping");
                setView(LIST_VIEW.mapping);
                setOpen(true);
              }}
            >
              Manage Products
            </Button>
          </div>
          <Dialog
            open={open}
            onClose={(e, reason) => reason === "backdropClick" && closeModal()}
            maxWidth={false}
            disableEscapeKeyDown // Whole-pixel position and size: a centred modal at a fractional offset (e.g. y = 24.6px) can show hairline seams
            // across its full width when the browser composites layers. Same centred look, snapped to 1px.
            sx={{ "& .MuiDialog-container": { alignItems: "flex-start", justifyContent: "flex-start" } }}
            PaperProps={{
              sx: {
                width: 1600,
                maxWidth: "calc(100% - 40px)",
                height: 800,
                maxHeight: "round(down, 94vh, 2px)",
                m: 0,
                mt: "round(down, max(12px, calc((100vh - min(800px, 94vh)) / 2)), 1px)",
                ml: "round(down, max(20px, calc((100vw - 1600px) / 2)), 1px)",
              },
            }}
          >
            <div className="modal-head">
              <h2>{title}</h2>
              <IconButton className="close-btn" onClick={() => closeModal()} aria-label="Close">
                <Close />
              </IconButton>
            </div>
            {isList ? (
              <div className="tabs">
                <Tabs value={tab} onChange={(e, v) => switchTab(v)}>
                  <Tab value="mapping" label={tabLabel("Mapping", "mapping")} />
                  <Tab value="schedule" label={tabLabel("Schedule", "schedule")} />
                  <Tab value="products" label={tabLabel("Product Family", "products")} />
                </Tabs>
                <div className="tab-tools">
                  {["mapping", "schedule", "products"].some(tabHasRowDots) ? (
                    <Button
                      variant="link"
                      sx={{ ml: 0, mr: "16px", whiteSpace: "nowrap" }}
                      onClick={() =>
                        setDb((d) => ({ ...d, changedMappings: [], changedFamilies: [], changedUnits: [], changedActivityRows: [], tabDots: [] }))
                      }
                    >
                      Mark all as reviewed
                    </Button>
                  ) : null}
                  <TextField
                    id="tabSearchInput"
                    placeholder={SEARCH_PLACEHOLDER[tab]}
                    value={search[tab]}
                    onChange={(e) => setSearch({ ...search, [tab]: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg className="search-icon" viewBox="0 0 24 24" width={20} height={20} aria-hidden>
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                          </svg>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: 260, my: "8px" }}
                  />
                </div>
              </div>
            ) : null}
            {content}
          </Dialog>
          <ConfirmDialog state={confirmState} onClose={closeConfirm} />
          <Snackbar
            key={snack.n}
            open={snack.open}
            ContentProps={{ className: snack.action ? "snack-with-action" : "" }}
            message={snack.message}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            onClose={(e, reason) => {
              if (reason === "clickaway" && snack.action) return;
              setSnack((s) => ({ ...s, open: false }));
            }}
            action={
              snack.action ? (
                <>
                  <Button
                    variant="link"
                    className="snack-cta"
                    onClick={() => {
                      setSnack((s) => ({ ...s, open: false }));
                      snack.action.onClick();
                    }}
                  >
                    {snack.action.label}
                  </Button>
                  <IconButton className="icon-action" aria-label="Dismiss" onClick={() => setSnack((s) => ({ ...s, open: false }))}>
                    <Close />
                  </IconButton>
                </>
              ) : null
            }
          />
        </UiContext.Provider>
      </DbContext.Provider>
    </>
  );
}
// Persona tabs: the same data seen by two kinds of people. Switching closes the window; the data stays.
export default function App() {
  const [preset, setPreset] = useState(
    () => ({ empty: "empty", blank: "blank", faf: "faf" })[new URLSearchParams(location.search).get("data")] || "full",
  );
  const [db, setDb] = useState(() => initialDb(preset));
  const [personaId, setPersonaId] = useState("A");
  const [resetN, setResetN] = useState(0); // bumps when the data is reset, so the window starts fresh (search, filter, month)
  const persona = PERSONAS.find((x) => x.id === personaId);
  return (
    <ThemeProvider theme={theme}>
      <div className="page">
        <div className="preset-row">
        <div className="preset">
          <div className="preset-label" id="preset-label">
            Start with
          </div>
          <ToggleButtonGroup
            exclusive
            className="segmented"
            aria-labelledby="preset-label"
            value={preset}
            onChange={(e, v) => {
              if (!v || v === preset) return;
              setPreset(v);
              setDb(initialDb(v));
              setResetN((n) => n + 1);
            }}
          >
            {DATA_PRESETS.map((o) => (
              <ToggleButton key={o.value} value={o.value}>
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        </div>
        <div className="persona-bar">
          <Tabs value={personaId} onChange={(e, v) => setPersonaId(v)} aria-label="Persona">
            {PERSONAS.map((x) => (
              <Tab key={x.id} value={x.id} label={`${x.label} \u00b7 ${x.role}`} />
            ))}
          </Tabs>
        </div>
        <Workspace key={`${personaId}-${resetN}`} persona={persona} db={db} setDb={setDb} />
      </div>
    </ThemeProvider>
  );
}
