/* ==========================================================================
   Manage Products · design theme — PRIZM 3.0 (v3.1.1), dark theme
   --------------------------------------------------------------------------
   Everything visual lives here. Edit this file to match your design library,
   then hand it back and it gets dropped into the page unchanged.

   1. TOKENS     colours, font, radius. Most restyling only needs this.
   2. MUI        theme passed to MUI createTheme(): palette + per-component
                 overrides (Button, Select/OutlinedInput, Autocomplete, Chip,
                 Checkbox, Dialog, Tabs, ToggleButton, Tooltip, Snackbar …).
                 Custom Button variants used by the app:
                   primary       main CTA (Create, Save, Update)
                   ghost         secondary (Discard, Cancel)
                   destructive   filled red (confirm Delete in dialogs)
                   dangerOutline outlined red (Delete in forms, bottom-left)
                   link          text button (+ Add year, + Add month, toast action)
                   nav           Prev / Next on Schedule
                   rowRemove     ✕ beside product rows
                   launcher      "Manage Products" launch button
                 Custom Chip variants: tag (tables), cellTag (Schedule cells)
   3. AG GRID    params passed to AG Grid themeQuartz.withParams() for all tables.
   4. CSS        styles for app parts that aren't MUI/AG Grid components
                 (dialog layout, count badge, legend, cycle tag colours …).
   ========================================================================== */
// Everything visual: tokens, MUI theme overrides, AG Grid params and the global CSS. Edit here to restyle.

/* ---------- 0. PRIZM PALETTE ----------
   Rule: any colour that matches a PRIZM palette step is referenced through P (token name in the comment).
   A raw hex is used only when PRIZM has no match, and is recorded as a deviation in the design system. */
const P = {
  white: "#FFFFFF", // prizm-white
  grey00: "#FDFDFD", // prizm-grey-00
  grey1000: "#121212", // prizm-grey-1000
  grey950: "#1F1F1F", // prizm-grey-950
  grey900: "#2C2C2C", // prizm-grey-900
  grey850: "#393939", // prizm-grey-850
  grey800: "#3D3D3D", // prizm-grey-800
  grey700: "#525252", // prizm-grey-700
  grey650: "#5C5C5C", // prizm-grey-650
  grey600: "#6E6E6E", // prizm-grey-600
  grey300: "#C2C2C2", // prizm-grey-300
  grey200: "#DBDBDB", // prizm-grey-200
  cyan1000: "#003D54", // prizm-cyan-1000
  cyan400: "#00DCFF", // prizm-cyan-400
  cyan600: "#00AED8", // prizm-cyan-600
  blue200: "#A5CAFF", // prizm-blue-200
  amber300: "#FDB47C", // prizm-amber-300
  red400: "#F35962", // prizm-red-400
  red500: "#E93842", // prizm-red-500
  red600: "#DA1E28", // prizm-red-600
  red800: "#9F0711", // prizm-red-800
};

/* ---------- 1. TOKENS ---------- */
/* PRIZM 3.0 (v3.1.1), dark theme. Values are PRIZM tokens; the token name is in each comment.
   https://claude.ai/artifact/ANkuQDnGSUNhB3tp8d8Q1S */
const t = {
  // surfaces
  bg: P.grey1000, // color-bg (dark) · grey/1000 — page background
  panel: P.grey1000, // product surface (deviation: PRIZM dark surface is grey/900 #2C2C2C) — dialogs
  panel2: P.grey950, // grey/950 — sunken areas
  menu: P.grey800, // color-surface-alt (dark) · grey/800 — menus, dropdowns (snackbars: grey/900 + grey/800 border)
  border: "rgba(255,255,255,0.23)", // MUI outlined border on dark — inputs, outlined chips
  borderStrong: "rgba(255,255,255,0.5)", // inherit-white outlined button border
  borderSoft: "rgba(255,255,255,0.12)", // prizm-divider-on-dark — dividers, table row lines, fieldsets
  hover: "rgba(255,255,255,0.08)", // hover overlay on dark
  // text & icons
  text: "rgba(255,255,255,0.87)", // prizm-text-pri-on-dark
  muted: "rgba(255,255,255,0.60)", // prizm-text-sec-on-dark — labels, helper text, placeholders
  disabled: "rgba(255,255,255,0.5)", // product: 50% (PRIZM disabled is 38%) — disabled text, icons, placeholders in disabled fields
  placeholder: "rgba(255,255,255,0.6)", // placeholder in enabled fields (kept above the 50% disabled level)
  arrow: "rgba(255,255,255,0.56)", // dropdown arrow (MUI action.active on dark)
  chipInk: "rgba(0,0,0,0.87)", // text on filled cycle chips
  icon: "rgba(255,255,255,0.87)", // action icons, chevrons, clear ✕
  white: P.white, // prizm-white — text on destructive buttons
  // brand & status
  accent: P.cyan400, // primary-main · cyan/400 — primary buttons, focus, active tab, links
  accentDark: P.cyan600, // primary-dark · cyan/600 — hover/pressed primary
  ink: "rgba(0,0,0,0.87)", // primary-contrasttext — text on accent
  accentHover: "rgba(0,220,255,0.08)", // primary hover overlay
  accentTint: "rgba(0,220,255,0.16)", // selected option / selected toggle background
  accentBorder: "rgba(0,220,255,0.5)", // primary-states-outlinedborder
  danger: P.red400, // prizm-error · red/400 — error text and borders on dark surfaces
  destructive: P.red600, // error-main · red/600 — filled delete buttons
  destructiveDark: P.red800, // error-dark · red/800 — hover
  destructiveTint: "rgba(243,89,98,0.08)",
  countChip: "rgba(255,255,255,0.16)", // round count badge in multi-selects
  // cycle colours (tags/chips) — nearest PRIZM palette steps
  // filled chips with black text (chipInk); exploring blue / grey / amber
  cycleO: P.blue200, // blue/200
  cycleT: P.grey200, // grey/200
  cycleX: P.amber300, // amber/300
  // schedule
  rowEditing: P.cyan1000, // cyan/1000 — household row being edited inline
  allRow: "#283A3D", // product deviation: cyan 8% over grey/900 — pinned "All" row background
  allRowBorder: "rgba(0,220,255,0.5)", // primary-states-outlinedborder
  highlight: "rgba(0,220,255,0.5)", // section highlight after "Schedule for All Households"
  highlightGlow: "rgba(0,220,255,0.16)",
  // product table (AG Grid) — product styling, deviates from PRIZM base
  gridHeaderBg: P.grey900, // grey/900
  gridHeaderText: P.grey00, // grey/00
  gridText: P.white, // prizm-white
  gridRowOdd: P.grey700, // grey/700 — 1st, 3rd, 5th… row
  gridRowOddHover: P.grey650, // grey/650
  gridRowEven: P.grey800, // grey/800 — 2nd, 4th, 6th… row
  gridRowEvenHover: P.grey850, // grey/850
  gridRowSelected: P.cyan1000, // cyan/1000 — selected and edited rows
  modalBorder: P.grey600, // prizm-grey-600 — 1 px border on every modal and dialog
  emptyFill: P.grey950, // prizm-grey-950 — empty-state area inside forms
  // type, shape, elevation
  font: "'Open Sans', Helvetica, Arial, sans-serif", // product default (PRIZM base is Roboto)
  radius: 4, // prizm-radius-sm
  elev2: "0px 3px 1px -2px rgba(0,0,0,0.20), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  elev4: "0px 2px 4px -1px rgba(0,0,0,0.20), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
  elev8: "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
  elev24: "0px 11px 15px -7px rgba(0,0,0,0.20), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)",
};

/* PRIZM button type: Roboto Medium 14, 0.4px tracking, sentence case */
const btnType = { fontFamily: t.font, fontSize: 14, fontWeight: 500, lineHeight: 1.75, letterSpacing: "0.4px", textTransform: "none" };
/* PRIZM menu/list rows */
const optionRow = { fontSize: 16, lineHeight: 1.5, letterSpacing: "0.15px", minHeight: 36, padding: "6px 16px" };

/* ---------- 2. MUI ---------- */
const mui = {
  palette: {
    mode: "dark",
    primary: { main: t.accent, dark: t.accentDark, contrastText: t.ink },
    error: { main: t.danger, dark: t.destructive, contrastText: t.white },
    background: { default: t.bg, paper: t.panel },
    text: { primary: t.text, secondary: t.muted, disabled: t.disabled },
    divider: t.borderSoft,
    action: {
      hover: t.hover,
      selected: t.accentTint,
      disabled: t.disabled,
      disabledBackground: "rgba(255,255,255,0.12)",
      disabledOpacity: 0.5,
    },
  },
  typography: { fontFamily: t.font, fontSize: 14, button: { textTransform: "none", fontWeight: 500, letterSpacing: "0.4px" } },
  shape: { borderRadius: t.radius },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { ...btnType, padding: "6px 16px", borderRadius: t.radius, minWidth: 0 } },
      variants: [
        // contained · primary
        {
          props: { variant: "primary" },
          style: {
            background: t.accent,
            color: t.ink,
            boxShadow: t.elev2,
            "&:hover": { background: t.accentDark, boxShadow: t.elev4 },
            "&.Mui-disabled": { background: "rgba(255,255,255,0.12)", color: t.disabled, boxShadow: "none" },
          },
        },
        // contained · primary · large
        {
          props: { variant: "launcher" },
          style: {
            background: t.accent,
            color: t.ink,
            fontSize: 15,
            letterSpacing: "0.46px",
            padding: "8px 22px",
            boxShadow: t.elev2,
            "&:hover": { background: t.accentDark, boxShadow: t.elev4 },
          },
        },
        // outlined · inherit
        {
          props: { variant: "ghost" },
          style: {
            background: "transparent",
            color: t.text,
            border: `1px solid ${t.borderStrong}`,
            padding: "5px 15px",
            "&:hover": { background: t.hover, borderColor: t.text },
          },
        },
        // contained · error — product: red/400
        {
          props: { variant: "destructive" },
          style: { background: t.danger, color: P.grey00, boxShadow: t.elev2, "&:hover": { background: P.red500, boxShadow: t.elev4 } },
        }, // product: red/400 fill, #FDFDFD label (3.2:1, below WCAG AA 4.5:1 — accepted deviation); hover red/500
        // outlined · error
        {
          props: { variant: "dangerOutline" },
          style: {
            background: "transparent",
            color: t.danger,
            border: `1px solid rgba(243,89,98,0.5)`,
            padding: "5px 15px",
            "&:hover": { background: t.destructiveTint, borderColor: t.danger },
            "&.Mui-disabled": { color: t.disabled, borderColor: t.borderSoft },
          },
        },
        // text · primary
        {
          props: { variant: "link" },
          style: {
            "& .MuiButton-startIcon": { marginRight: 6, marginLeft: -2 },
            "& .MuiSvgIcon-root": { fontSize: 18 },
            background: "transparent",
            color: t.accent,
            padding: "6px 8px",
            marginLeft: -8,
            "&:hover": { background: t.accentHover },
          },
        },
        // outlined · inherit · small
        {
          props: { variant: "nav" },
          style: {
            "& .MuiButton-startIcon": { marginRight: 2, marginLeft: -4 },
            "& .MuiButton-endIcon": { marginLeft: 2, marginRight: -4 },
            "& .MuiSvgIcon-root": { fontSize: 18 },
            background: "transparent",
            color: t.text,
            border: `1px solid ${t.borderStrong}`,
            fontSize: 13,
            letterSpacing: "0.46px",
            padding: "3px 9px",
            "&:hover": { background: t.hover, borderColor: t.text },
          },
        },
        // outlined · inherit · icon-only remove
        {
          props: { variant: "rowRemove" },
          style: {
            "& .MuiSvgIcon-root": { fontSize: 18 },
            background: "transparent",
            color: t.muted,
            border: `1px solid ${t.border}`,
            padding: "7px 9px",
            "&:hover": { background: t.destructiveTint, color: t.danger, borderColor: t.danger },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: t.icon,
          padding: 5,
          borderRadius: "50%",
          lineHeight: 1,
          "& .MuiSvgIcon-root": { fontSize: 20 },
          "&:hover": { background: "var(--IconButton-hoverBg)" },
          "&.Mui-disabled": { color: t.disabled },
        },
      },
      variants: [
        {
          props: { className: "close-btn" },
          style: {
            "& .MuiSvgIcon-root": { fontSize: 24 },
            color: t.muted,
            padding: 6,
            marginBottom: 0,
            "&:hover": { color: t.text, background: t.hover },
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "transparent",
          borderRadius: t.radius,
          fontSize: 16,
          letterSpacing: "0.15px",
          color: t.text,
          fontFamily: t.font,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border, borderWidth: 1 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: t.text },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: t.accent, borderWidth: 2 },
          "&.Mui-disabled": { cursor: "not-allowed" },
          "&.Mui-disabled .MuiOutlinedInput-notchedOutline": { borderColor: t.borderSoft },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: t.danger },
        },
        // PRIZM outlined · small: all single-line fields are 40px tall: 8.5 + 23 + 8.5 (+ border).
        input: {
          padding: "8.5px 14px",
          height: "23px",
          lineHeight: "23px",
          "&::placeholder": { color: t.placeholder, opacity: 1, textTransform: "none" },
          "&.Mui-disabled": { WebkitTextFillColor: t.disabled, cursor: "not-allowed" },
          "&.Mui-disabled::placeholder": { color: t.disabled },
        },
      },
    },
    // Standard variant: used inside editable table cells. Bottom border only (42% white), 2px primary on focus, red/400 on error.
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: 16,
          color: t.text,
          fontFamily: t.font,
          minHeight: 32,
          "&:before": { borderBottomColor: "rgba(255,255,255,0.42)" },
          "&:hover:not(.Mui-disabled, .Mui-error):before": { borderBottomColor: t.text },
          "&:after": { borderBottomColor: t.accent },
          "&.Mui-error:before, &.Mui-error:after": { borderBottomColor: t.danger },
        },
        input: { padding: "6px 0 5px", "&::placeholder": { color: t.placeholder, opacity: 1, textTransform: "none" } },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { padding: "8.5px 32px 8.5px 14px !important", height: "23px", minHeight: "23px !important", lineHeight: "23px" },
        icon: { color: t.arrow, right: 7, "&.Mui-disabled": { color: t.disabled } },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { background: t.menu, border: "none", borderRadius: t.radius, backgroundImage: "none", boxShadow: t.elev8, marginTop: 4 },
        list: { padding: "8px 0" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...optionRow,
          "&:hover": { background: t.hover },
          "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": { background: t.accentTint, color: t.text },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: { width: "100%" },
        inputRoot: {
          padding: "5px 8px 5px 9px !important",
          minHeight: 40,
          boxSizing: "border-box",
          flexWrap: "nowrap",
          gap: 6,
          cursor: "pointer",
        },
        input: { padding: "2.5px 4px 2.5px 5px !important", minWidth: "30px !important", fontSize: 16, flex: "1 1 30px" },
        tag: { margin: 0, maxWidth: "none" },
        endAdornment: { position: "static", transform: "none", display: "flex", alignItems: "center", flexShrink: 0 },
        clearIndicator: { visibility: "visible", padding: 2, marginRight: 0, color: t.arrow, "&:hover": { background: "transparent" } },
        popupIndicator: {
          padding: 0,
          marginRight: 0,
          color: t.arrow,
          "&:hover": { background: "transparent" },
          "&.Mui-disabled": { color: t.disabled },
        },
        paper: { background: t.menu, border: "none", borderRadius: t.radius, marginTop: 4, backgroundImage: "none", boxShadow: t.elev8 },
        listbox: {
          padding: "8px 0",
          maxHeight: 420,
          "& .MuiAutocomplete-option": {
            display: "block",
            ...optionRow,
            "&.Mui-focused": { background: t.hover },
            '&[aria-selected="true"], &[aria-selected="true"].Mui-focused': { background: t.accentTint, color: t.text },
            '&[aria-disabled="true"]': { opacity: 0.38 },
          },
        },
        // Group headings (Product Family / Product) look like the options; the options keep their indent beneath them
        groupLabel: {
          ...optionRow,
          position: "static",
          background: "transparent",
          color: t.text,
          fontWeight: 400,
          minHeight: 36,
          display: "flex",
          alignItems: "center",
        },
        noOptions: { fontSize: 16, color: t.muted, padding: "6px 16px" },
      },
    },
    // PRIZM Chip · outlined · small (24px, 12px radius)
    MuiChip: {
      styleOverrides: {
        root: {
          height: "auto",
          borderRadius: 12,
          background: "transparent",
          border: `1px solid ${t.border}`,
          fontSize: 12,
          color: t.text,
          padding: "3px 8px",
          margin: 0,
          flexShrink: 0,
          fontFamily: t.font,
        },
        label: { padding: 0, overflow: "visible", lineHeight: "16px" },
        deleteIcon: { margin: "0 -2px 0 4px", fontSize: 14, color: t.muted, "&:hover": { color: t.danger } },
      },
      variants: [
        { props: { variant: "tag" }, style: { padding: "3px 8px" } },
        { props: { variant: "cellTag" }, style: { padding: "3px 6px" } },
      ],
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { padding: 0, color: t.muted, "&.Mui-checked": { color: t.accent }, "& .MuiSvgIcon-root": { fontSize: 20 } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: t.panel,
          border: `1px solid ${t.modalBorder}`,
          borderRadius: 8,
          backgroundImage: "none",
          boxShadow: t.elev24,
          margin: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          color: t.text,
        },
        // overflow stays visible: a rounded, clipping paper over the grid's scrolling layers can show full-width hairline seams in Chrome. Children round their own corners instead.
      },
    },
    MuiBackdrop: { styleOverrides: { root: { "&:not(.MuiBackdrop-invisible)": { background: "rgba(0,0,0,0.5)" } } } },
    MuiTabs: {
      styleOverrides: { root: { minHeight: 0 }, indicator: { background: t.accent, height: 2 } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          ...btnType,
          minWidth: 0,
          minHeight: 0,
          padding: "12px 16px",
          marginRight: 0,
          color: t.muted,
          "&.Mui-selected": { color: t.accent },
          "&:hover": { color: t.text },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { gap: 8 },
        grouped: { borderRadius: `${t.radius}px !important`, margin: "0 !important", borderLeft: `1px solid ${t.borderSoft} !important` },
      },
    },
    // PRIZM ToggleButton · small: selected = primary tint + primary text
    MuiToggleButton: {
      styleOverrides: {
        root: {
          ...btnType,
          fontSize: 13,
          letterSpacing: "0.46px",
          lineHeight: 1.4,
          background: "transparent",
          border: `1px solid ${t.borderSoft}`,
          color: "rgba(255,255,255,0.7)",
          borderRadius: t.radius,
          padding: "5px 11px",
          "&:hover": { background: t.hover, color: t.text },
          "&.Mui-selected, &.Mui-selected:hover": { color: t.accent, background: t.accentTint, borderColor: `${t.borderSoft} !important` },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          background: P.grey900,
          color: P.grey00,
          border: "none",
          padding: "8px 16px",
          /* product: grey/900 fill, no border, grey/00 text */ borderRadius: t.radius,
          fontSize: 14,
          minWidth: "0 !important",
          boxShadow: t.elev8,
        },
        message: { padding: 0 },
      },
    },
    // PRIZM Tooltip: dark bubble (100% fill opacity per product spec), 4px radius, no border
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "#424242",
          border: "none",
          color: t.white,
          fontSize: 12,
          lineHeight: 1.4,
          padding: "12px 16px",
          borderRadius: t.radius,
          maxWidth: 288,
          boxShadow: "none",
          fontFamily: t.font,
        },
        arrow: { color: "#424242" },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: "3px 14px 0",
          fontSize: 12,
          lineHeight: 1.66,
          letterSpacing: "0.4px",
          fontFamily: t.font,
          color: t.muted,
          "&.Mui-error": { color: t.danger },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { color: t.muted, fontSize: 12, letterSpacing: "0.4px", fontFamily: t.font, "&.Mui-focused": { color: t.muted } },
      },
    },
  },
};

/* ---------- 3. AG GRID ---------- */
/* Product table spec: 16px text, 52px header, rows min 52px, 12px side padding,
   banded rows with no row lines, selected/edited rows cyan/1000. Row banding and hover are in the CSS below. */
const agGrid = {
  backgroundColor: t.panel,
  foregroundColor: t.gridText,
  textColor: t.gridText,
  accentColor: t.accent,
  headerBackgroundColor: t.gridHeaderBg,
  headerTextColor: t.gridHeaderText,
  headerFontSize: 16,
  headerFontWeight: 600,
  headerHeight: 52,
  rowHeight: 40, // minimum row height; all product tables here sit in a modal
  fontFamily: t.font,
  fontSize: 16,
  borderColor: t.borderSoft,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  rowBorder: false,
  columnBorder: false,
  headerColumnBorder: false,
  headerColumnResizeHandleColor: "transparent",
  rowHoverColor: "transparent",
  selectedRowBackgroundColor: t.gridRowSelected,
  cellHorizontalPadding: 12,
  browserColorScheme: "dark",
};

/* ---------- 4. CSS ---------- */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');
  /* CSS variables generated from the tokens above */
  :root{
    --IconButton-hoverBg: rgba(255,255,255,0.08); /* hover fill for every IconButton */
    --bg:${t.bg}; --panel:${t.panel}; --panel2:${t.panel2}; --border:${t.border}; --border-soft:${t.borderSoft};
    --text:${t.text}; --muted:${t.muted}; --accent:${t.accent}; --accent-ink:${t.ink};
    --danger:${t.danger}; --destructive:${t.destructive}; --radius:${t.radius}px; --row-dirty:${t.rowEditing};
    --hover:${t.hover}; --font:${t.font};
    color-scheme:dark;
  }
  *{box-sizing:border-box;}
  html,body{height:100%;}
  body{
    margin:0; background:var(--bg); color:var(--text);
    font-family:var(--font); font-size:14px; letter-spacing:0.15px;
  }
  #root{ min-height:100%; display:flex; align-items:center; justify-content:center; padding:32px 16px; }
  .hint{ color:var(--muted); font-size:14px; margin-top:10px; max-width:300px; text-align:center; }
  .wrap{ display:flex; flex-direction:column; align-items:center; }
  /* Prototype-only data preset picker under the launcher */
  .preset{ display:flex; flex-direction:column; align-items:center; gap:8px; margin-top:40px; }
  .preset-label{ color:var(--muted); font-size:12px; letter-spacing:0.4px; text-transform:uppercase; }
  .preset .segmented .MuiToggleButton-root{ text-transform:none; padding:6px 16px; }
  .preset .hint{ margin-top:0; }

  /* Dialog shells (MUI Dialog paper gets these classes) */
  .modal-head{ display:flex; align-items:center; justify-content:space-between; padding:24px 24px 16px; flex-shrink:0; }
  .modal-head h2{ margin:0; font-size:22px; font-weight:700; line-height:28.6px; letter-spacing:0; } /* heading small */
  .modal-head h2.destructive{ color:var(--danger); } /* red/400: readable on the #121212 surface */
  .confirm-paper .modal-head{ padding-bottom:0; }
  .confirm-paper .modal-body{ padding-top:16px; } /* product: 16px from header to description */
  .confirm-message > :first-child{ margin-top:0 !important; }
  .confirm-paper .modal-head h2{ color:var(--accent); } /* confirmation from a primary CTA: cyan/400 header */
  .confirm-paper .modal-head h2.destructive{ color:var(--danger); } /* confirmation from a destructive CTA: red/400 header */
  .tabs{ display:flex; justify-content:space-between; align-items:center; gap:4px; padding:0 24px; background:var(--panel); flex-shrink:0; }
  /* The scroll area stops 24px above the footer (margin, not padding), so content is never closer than 48px to the CTA */
  .modal-body{ padding:24px 24px 0; margin-bottom:24px; overflow-y:auto; flex:1; min-height:0; }
  .modal-body.grid-body{ display:flex; flex-direction:column; overflow:hidden; }
  .modal-subheader{ padding:16px 24px 0; flex-shrink:0; }
  /* 48px from the last form content to the CTA: 24 body padding + 24 footer padding. No divider. */
  .MuiDialog-paper > :first-child{ border-top-left-radius:7px; border-top-right-radius:7px; }
  .MuiDialog-paper > :last-child{ border-bottom-left-radius:7px; border-bottom-right-radius:7px; }
  .modal-footer{ padding:24px; background:var(--panel); display:flex; justify-content:flex-end; gap:10px; flex-shrink:0; }
  
  .confirm-message{ color:${P.grey00}; font-size:16px; font-weight:400; line-height:1.5; letter-spacing:0.00938em; } /* body1, grey/00 #FDFDFD */

  .grid-wrap{ flex:1; min-height:0; }
  .preview-grid{ width:620px; max-width:100%; margin-top:4px; }

  /* AG Grid cell content */
  /* Tables inside a modal: 40px minimum row (agGrid.rowHeight 40; 8 + 22 + 8 padding + 2 cell border). Full-page tables: 52px. */
  .ag-cell{ padding-top:15px; padding-bottom:15px; line-height:22px; }
  .MuiDialog-paper .ag-cell{ padding-top:8px; padding-bottom:8px; }
  /* Keep icon buttons and chips from stretching 40px rows: same hit area, pulled into the padding */
  .MuiDialog-paper .ag-cell .MuiIconButton-root{ margin-top:-4px; margin-bottom:-4px; }
  .MuiDialog-paper .ag-cell .MuiChip-root{ margin-top:-1px; margin-bottom:-1px; }
  /* Banded rows: counted from 1 (AG Grid's .ag-row-even is the 1st, 3rd, 5th… row) */
  .ag-row.ag-row-even{ background-color:${t.gridRowOdd}; }
  .ag-row.ag-row-even.ag-row-hover{ background-color:${t.gridRowOddHover}; }
  .ag-row.ag-row-odd{ background-color:${t.gridRowEven}; }
  .ag-row.ag-row-odd.ag-row-hover{ background-color:${t.gridRowEvenHover}; }
  .ag-row.ag-row-selected, .ag-row.ag-row-selected.ag-row-hover{ background-color:${t.gridRowSelected}; }
  .ag-row{ cursor:pointer; }
  .ag-row.row-dirty, .ag-row.row-dirty.ag-row-hover{ background-color:var(--row-dirty) !important; }
  .ag-row.row-dirty .ag-cell{ background-color:var(--row-dirty); }
  /* Schedule month headers (custom header component): label centred; Prev / Next sit on the outer edges */
  .month-hd{ position:relative; display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
  .month-hd-text{ position:relative; font-size:16px; font-weight:600; color:${t.gridHeaderText}; }
  /* Current month: label and MUI ArrowDropDown glyph in cyan (${P.cyan400}), glyph centred above the label */
  .month-hd.is-current .month-hd-text{ color:${P.cyan400}; }
  .month-hd.is-current .month-hd-text::before{
    content:""; position:absolute; bottom:100%; left:50%; transform:translateX(-50%); width:24px; height:14px; background:${P.cyan400};
    -webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5z'/></svg>") no-repeat center / 24px 24px;
    mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5z'/></svg>") no-repeat center / 24px 24px;
  }
  .month-nav.MuiIconButton-root{ position:absolute; top:50%; transform:translateY(-50%); color:${t.gridHeaderText}; padding:4px; }
  .month-nav.MuiIconButton-root:hover{ background:${t.hover}; }
  .month-nav-prev.MuiIconButton-root{ left:-4px; }
  .month-nav-next.MuiIconButton-root{ right:-4px; }
  /* Segmented single-select (MUI ToggleButtonGroup, exclusive): seamed like PRIZM ButtonGroup */
  .segmented.MuiToggleButtonGroup-root{ gap:0; }
  .segmented .MuiToggleButtonGroup-grouped{ border-radius:0 !important; margin:0 !important; min-width:48px; }
  .segmented .MuiToggleButtonGroup-grouped:not(:first-of-type){ margin-left:-1px !important; border-left:1px solid ${t.borderSoft} !important; }
  .segmented .MuiToggleButtonGroup-grouped:first-of-type{ border-radius:${t.radius}px 0 0 ${t.radius}px !important; }
  .segmented .MuiToggleButtonGroup-grouped:last-of-type{ border-radius:0 ${t.radius}px ${t.radius}px 0 !important; }
  .segmented .MuiToggleButtonGroup-grouped.Mui-selected{ position:relative; z-index:1; }
  .ag-cell.cell-editing{ overflow:visible; }

  .empty{ text-align:center; color:var(--muted); padding:40px 10px; font-size:14px; }
  /* Mapping and Product Family lists: the table always fills the body down to 48px above the footer CTA.
     Below the last row the table area shows grey/950; once rows reach the bottom they scroll under the header. */
  .list-grid .ag-root-wrapper, .list-grid .ag-body, .list-grid .ag-body-viewport, .list-grid .ag-center-cols-viewport,
  .sched-grid .ag-root-wrapper, .sched-grid .ag-body, .sched-grid .ag-body-viewport, .sched-grid .ag-center-cols-viewport{ background-color:${P.grey950}; }
  /* List with no records yet (e.g. Mapping tab with no Mappings): grey/950 panel filling the body, ending 48px above the footer CTA */
  .span-empty{ position:absolute; top:0; right:0; bottom:0; left:0; display:flex; align-items:center; justify-content:center; font-size:14px; text-align:center; } /* centred both ways in the spanned cell */
  .text-link{ background:none; border:0; padding:0; margin:0; font:inherit; color:#00DCFF; cursor:pointer; text-decoration:none; }
  .text-link:hover, .text-link:focus-visible{ text-decoration:underline; }
  .list-empty{ flex:1; min-height:0; display:flex; align-items:center; justify-content:center; text-align:center; padding:16px; background:${P.grey950}; border-radius:${t.radius}px; color:${t.text}; font-size:14px; }
  /* Form empty state (e.g. Create Mapping before a Cycle is chosen): fills the rest of the body,
     24px below the fields, ends 48px above the CTA, text centred both ways */
  .modal-body:has(> .form-empty){ display:flex; flex-direction:column; }
  .form-section.MuiFormControl-root:has(+ .form-empty){ margin-bottom:8px; } /* 16px field spacing + 8 = 24px */
  .form-empty.empty{ flex:1 1 auto; min-height:160px; display:flex; align-items:center; justify-content:center; padding:16px; background:${t.emptyFill}; border-radius:${t.radius}px; }
  .muted{ color:var(--muted); }
  .error{ color:var(--danger); font-size:12px; margin-top:6px; }

  .tag-cycle-O{ background:${t.cycleO} !important; border-color:${t.cycleO} !important; color:${t.chipInk} !important; }
  .tag-cycle-T{ background:${t.cycleT} !important; border-color:${t.cycleT} !important; color:${t.chipInk} !important; }
  .tag-cycle-X{ background:${t.cycleX} !important; border-color:${t.cycleX} !important; color:${t.chipInk} !important; }
  .tag-cycle-O .MuiChip-deleteIcon, .tag-cycle-T .MuiChip-deleteIcon, .tag-cycle-X .MuiChip-deleteIcon,
  .tag-cycle-O .chip-x, .tag-cycle-T .chip-x, .tag-cycle-X .chip-x{ color:rgba(0,0,0,0.6) !important; }
  .tag-cycle-O .chip-x:hover, .tag-cycle-T .chip-x:hover, .tag-cycle-X .chip-x:hover{ color:rgba(0,0,0,0.87) !important; }
  .family-tags-wrap{ display:flex; flex-wrap:wrap; gap:4px; }
  .cell-tags{ display:flex; flex-wrap:wrap; gap:4px; align-items:center; min-width:110px; }
  /* Schedule month cells: chips and dashes centred under the centred month header */
  .ag-cell.month-cell{ text-align:center; }
  .ag-cell.month-cell .cell-tags, .ag-cell.month-cell .all-empty{ justify-content:center; }
  /* Month cells: one chip per line, centred, in every row (read and edit mode) */
  .ag-cell.month-cell .cell-tags{ flex-direction:column; align-items:center; }
  .ag-cell.month-cell .msf-tags.stack{ align-items:center; }
  /* Empty "All" row: the whole row is the "Schedule for All Households" target.
     Hovering the row or the button tints the row with the button's hover fill and shows the button's hover. */
  .ag-row.all-empty-row{ cursor:pointer; }
  .MuiDialog-paper .ag-cell .all-empty .MuiButton-root{ margin-top:-8px; margin-bottom:-8px; }
  .ag-row.all-empty-row.ag-row-hover, .ag-row.all-empty-row:hover{ background-image:linear-gradient(${t.accentHover}, ${t.accentHover}); }
  .ag-row.all-empty-row .all-empty .MuiButton-root, .ag-row.all-empty-row .all-empty .MuiButton-root:hover{ background:transparent; }
  .indefinite-chip{ cursor:pointer; }
  /* Hovering any Indefinite chip highlights every Indefinite chip on that Household's row */
  .ag-row:has(.indefinite-chip:hover) .indefinite-chip{ box-shadow:0 0 0 2px ${P.grey00}; }
  .tab-label{ display:inline-flex; align-items:center; }
  .tab-dot{ display:inline-block; width:8px; height:8px; border-radius:50%; background:#00DCFF; margin-left:8px; flex-shrink:0; }
  .row-dot{ display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent); vertical-align:middle; }
  .action-cell{ display:flex; gap:2px; align-items:center; white-space:nowrap; }
  /* Schedule row actions: enabled Cancel is ${P.grey00}, enabled Save is primary cyan */
  .icon-cancel.MuiIconButton-root:not(.Mui-disabled){ color:${P.grey00}; }
  .icon-save.MuiIconButton-root:not(.Mui-disabled){ color:var(--accent); }

  .form-section.MuiFormControl-root{ border:none; padding:0; margin:0 0 24px; }
  .section-heading{ margin:0 0 16px; font-size:16px; line-height:22.4px; font-weight:600; color:var(--text); } /* heading xsmall */
  .form-section-legend.MuiFormLabel-root{ padding:0 6px; }
  .field{ margin-bottom:16px; min-width:0; }
  .param-label{ color:var(--muted); } /* same colour as input labels */
  .field-label{ display:block; font-size:12px; letter-spacing:0.4px; color:var(--muted); margin-bottom:6px; }
  .grid4{ display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:14px; }
  @media (max-width:760px){ .grid4{ grid-template-columns:repeat(2, minmax(0,1fr)); } }
  .fam-input input{ text-transform:uppercase; }
  .fam-input input::placeholder{ text-transform:none; }
  .select-field .muted{ color:${t.placeholder}; }
  .select-field.Mui-disabled .muted, .Mui-disabled .muted{ color:${t.disabled}; }
  /* Editable tables (AG Grid): Products, years, months. Same header, banding and hover as other product tables;
     rows min 48px; cells hold standard-variant inputs (bottom border only); last column is a 48 x 48 remove cell. */
  .edit-grid{ width:100%; margin-bottom:12px; }
  .edit-grid .ag-row{ cursor:default; }
  .edit-grid .ag-layout-auto-height .ag-center-cols-viewport, .edit-grid .ag-layout-auto-height .ag-center-cols-container, .edit-grid .ag-layout-auto-height .ag-body-viewport,
  .preview-grid .ag-layout-auto-height .ag-center-cols-viewport, .preview-grid .ag-layout-auto-height .ag-center-cols-container, .preview-grid .ag-layout-auto-height .ag-body-viewport{ min-height:0 !important; }
  .MuiDialog-paper .edit-grid .ag-cell.eg-cell{ display:flex; align-items:stretch; padding:0; overflow:visible; }
  .edit-grid .eg-cell > *{ flex:1 1 auto; min-width:0; }
  .MuiDialog-paper .edit-grid .ag-cell.eg-action{ display:flex; align-items:center; justify-content:center; padding:0; }
  .eg-head{ font-size:16px; font-weight:600; color:${t.gridHeaderText}; }
  .et-req{ color:${t.danger}; }
  /* Error icon sits inside the field: left of the dropdown chevron in selects, at the end of text inputs */
  .err-adorn.MuiInputAdornment-root{ margin-left:4px; height:auto; max-height:none; }
  .cell-select .err-adorn.MuiInputAdornment-root{ margin-right:22px; }
  .cell-select .MuiSelect-select.MuiInputBase-input{ padding:6px 24px 5px 0 !important; min-height:0 !important; flex:1 1 auto; }
  .cell-select .MuiSelect-icon{ right:0; }
  .edit-grid .MuiAutocomplete-inputRoot.MuiInput-root{ padding:4px 12px !important; }
  /* Inputs fill the whole cell (min 48px): bottom border by default, full 2px border on focus */
  .edit-grid .eg-cell .MuiFormControl-root, .edit-grid .eg-cell .MuiAutocomplete-root{ align-self:stretch; height:100%; }
  .edit-grid .eg-cell .MuiInput-root{ height:100%; min-height:48px; padding:0 12px; box-sizing:border-box; margin-top:0; }
  .edit-grid .eg-cell .MuiInput-root:after{ display:none; }
  .edit-grid .eg-cell .MuiInput-root.Mui-focused{ box-shadow:inset 0 0 0 2px ${t.accent}; }
  .edit-grid .eg-cell .MuiInput-root.Mui-focused:before{ border-bottom-color:transparent; }
  .edit-grid .eg-cell .MuiInput-root.Mui-error.Mui-focused{ box-shadow:inset 0 0 0 2px ${t.danger}; }
  .edit-grid .cell-select .MuiSelect-icon{ right:12px; }
  /* Inline error flag: ErrorOutline in red/400; message in a tooltip on hover */
  /* Product error tooltip: below the icon, white rectangle, 4px radius, 8px x 16px padding, black text, no arrow */
  .MuiTooltip-tooltip.tip-light{ background:${P.white}; color:rgba(0,0,0,0.87); border-radius:4px; padding:8px 16px; box-shadow:none; font-size:14px; line-height:20px; max-width:288px; }
  .err-flag.MuiIconButton-root{ color:${t.danger}; padding:4px; flex:none; }
  .err-flag.MuiIconButton-root:hover{ background:var(--IconButton-hoverBg); }
  .prow{ display:flex; gap:8px; align-items:flex-start; margin-bottom:12px; }
  .prow .MuiButton-root{ height:40px; }
  /* Create / Update Product Family: the body doesn't scroll. The Products table takes its natural height (53 + 48 per row)
     until it runs out of room, then scrolls under its fixed header. "+ Add Product" sits 8px below the table and
     stays 48px above the Create / Discard buttons (body margin 24 + footer padding 24). */
  .modal-body.fam-body{ display:flex; flex-direction:column; overflow:hidden; }
  .fam-body > .field{ flex-shrink:0; }
  .fam-body .products-section.form-section.MuiFormControl-root{ flex:1 1 auto; min-height:0; display:flex; flex-direction:column; margin-bottom:0; }
  .fam-body .edit-grid-fit{ flex:0 1 auto; min-height:101px; margin-bottom:0; }
  .fam-body .add-row{ flex-shrink:0; margin-top:8px; }

  .count-chip{
    display:inline-flex; flex-shrink:0; align-items:center; justify-content:center;
    width:26px; height:26px; border-radius:50%; background:${t.countChip};
    color:var(--text); font-size:12px; margin-left:4px;
  }
  /* Autocomplete (multi-select) internals */
  .msf-tags{ display:flex; align-items:center; gap:6px; overflow-x:auto; overflow-y:hidden; flex:0 1 auto; min-width:0; } /* never scroll vertically */
  /* Schedule cell picker: chips stack one per line and hug their content (not stretched to the field width) */
  .msf-tags.stack{ flex-direction:column; align-items:flex-start; overflow:visible; width:100%; }
  .msf-tags.stack .MuiChip-root{ width:auto; max-width:100%; }
  .msf-clear-x{ color:${t.icon}; font-size:16px !important; }
  .msf-clear-x:hover{ color:var(--destructive); }
  .msf-chevron{ color:${t.icon}; font-size:20px !important; margin-left:2px; }
  .chip-x{ color:var(--muted); cursor:pointer; }
  .chip-x:hover{ color:var(--danger); }
  .msf-check-row{ display:flex; align-items:center; gap:8px; pointer-events:none; }
  .msf-sub{ font-size:11px; color:var(--muted); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .msf-detail{ font-size:12px; color:var(--muted); margin-top:6px; }
  .msf-extra{ color:var(--text); } /* 'Create "X"' option: same colour as the other options */
  .fam-with-team{ display:inline-flex; align-items:center; gap:8px; }
  .fam-sched-team{ font-size:11px; color:var(--muted); }
  /* Delete Mapping table (ScrollPreviewGrid): grows with rows up to 300px, then scrolls under its header */
  .confirm-message .undo-note{ margin:16px 0 0; } /* 'This action cannot be undone.' always closes a destructive dialog, on its own line */

  .select-chevron{ color:${t.icon} !important; font-size:20px !important; pointer-events:none; right:6px !important; top:50% !important; transform:translateY(-50%) !important; }
  .select-clear-icon{ font-size:16px !important; display:block; }
  .select-field .MuiOutlinedInput-root{ padding-right:30px; }
  .select-clear-inner{ background:transparent; border:none; color:${t.icon}; cursor:pointer; padding:2px; line-height:1; display:flex; }
  .select-clear-inner:hover{ color:var(--destructive); }

  /* Schedule: All Households pinned row + legend */
  /* The "All" row is an ordinary first row: normal banding, no special fill or border. */
  .all-hh{ white-space:nowrap; display:inline-flex; align-items:center; gap:6px; }
  .all-hh .MuiSvgIcon-root{ font-size:18px; }
  .scope-chip .MuiChip-icon{ font-size:13px; margin:0 4px 0 0; color:inherit; }
  .sched-legend{ display:flex; flex-wrap:wrap; align-items:center; gap:6px 16px; font-size:12px; color:var(--muted); }
  .sched-legend > span{ display:inline-flex; align-items:center; gap:4px; }
  .sched-legend .MuiSvgIcon-root{ font-size:14px; }
  .sched-legend-note{ flex-basis:100%; }

  /* Schedule for All Households form */
  .form-intro{ margin:0 0 20px; font-size:14px; color:var(--muted); line-height:1.5; max-width:70ch; }
  .section-help{ margin:0 0 12px; font-size:12px; color:var(--muted); }
  /* Repeating input rows leave room for a helper/error line under each field */
  .year-row{ display:flex; gap:10px; align-items:flex-start; margin-bottom:16px; }
  .year-row-year{ width:130px; flex-shrink:0; }
  .year-row-families{ flex:1; min-width:0; }
  .year-row .icon-action{ margin-top:5px; }
  .month-picker{ max-width:420px; }
  .month-picker-head{ display:flex; align-items:center; justify-content:space-between; font-size:14px; font-weight:500; margin-bottom:8px; }
  .month-grid{ display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); gap:6px; }
  .month-grid .MuiToggleButton-root{ padding:5px 0; }
  .sched-toolbar{ display:flex; align-items:center; justify-content:space-between; gap:12px 20px; flex-wrap:wrap; margin-bottom:12px; }
  .sched-nav{ display:flex; align-items:center; gap:12px; }
  .sched-range{ font-size:14px; min-width:150px; text-align:center; }
  .legend-icon{ display:inline-flex; align-items:center; gap:6px; }
  .legend-icon .MuiSvgIcon-root{ font-size:15px; }
  .all-empty{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-size:12px; }
  .tab-tools{ display:flex; align-items:center; gap:6px; }
  .search-icon{ fill:currentColor; color:var(--muted); }
  .MuiOutlinedInput-root.MuiInputBase-adornedStart{ padding-left:12px; }
  .MuiOutlinedInput-root .MuiInputBase-inputAdornedStart{ padding-left:0 !important; }
  .MuiInputAdornment-positionStart{ margin-right:8px; }
  .info-btn.MuiIconButton-root{ color:var(--muted); padding:4px; }
  .info-btn.MuiIconButton-root:hover{ color:var(--text); }
  .info-btn .MuiSvgIcon-root{ font-size:19px; }
  .legend-tip{ display:grid; gap:12px; color:${P.grey00}; }
  .legend-tip-title{ font-weight:600; font-size:12px; color:${P.grey300}; } /* section header: grey/300 */
  /* Info legend tooltip: grey/1000 surface, grey/600 border, 8px radius, no arrow */
  .MuiTooltip-tooltip:has(.legend-tip){ background:${P.grey1000}; border:1px solid ${P.grey600}; border-radius:8px; color:${P.grey00}; }
  /* Forms: 24px between the content above and the top of a table */
  .modal-body .edit-grid{ margin-top:8px; } /* + 16px flex gap = 24px */
  .modal-body .section-help + .edit-grid{ margin-top:12px; } /* + 12px gap = 24px */
  .sched-grid.sizing{ visibility:hidden; }
  /* Schedule tab: Household / Project Type tabs, then the half-year navigator directly under them */
  /* One toolbar line: tabs left, half-year stepper centred, Current month right. Whole-pixel height keeps the table on the pixel grid. */
  .sched-toolbar{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; box-sizing:border-box; height:64px; padding:16px 24px; }
  .sched-toolbar > :first-child{ justify-self:start; }
  .sched-toolbar > :last-child{ justify-self:end; margin-left:0; }
  .month-stepper{ display:flex; align-items:center; gap:8px; }
  .sched-toolbar .month-range{ line-height:24px; }
  /* Schedule tables: column headers and row headers (Fixed) centred like the months; Household, Project Type and Personnel stay left-aligned */
  .hdr-center .ag-header-cell-label{ justify-content:center; }
  /* A cell always holds at least one 24px line (chip height), so rows are 40px + multiples of 28px (all multiples of 4) */
  .sched-grid .ag-cell .cell-tags{ min-height:24px; }
  .sched-grid .ag-cell .cell-tags .MuiChip-root{ margin-top:0; margin-bottom:0; } /* chips take their full 24px so stacked rows stay on a 4px multiple */
  .sched-grid .ag-cell{ padding-top:7px; padding-bottom:7px; } /* + 1px cell borders: a one-chip row is 40px */
  /* Fixed column: a Product Family is a chip, a Product is plain text (no container) */
  .fixed-tags{ gap:4px 8px; }
  .MuiAutocomplete-listbox .MuiAutocomplete-option.msf-indent{ padding-left:44px; } /* Products under their Product Family in the Fixed picker */
  .plain-item{ font-size:12px; line-height:24px; color:${t.text}; padding:0 2px; letter-spacing:0.02em; }
  .plain-item-edit{ display:inline-flex; align-items:center; gap:2px; }
  .plain-x{ background:none; border:0; padding:0; margin:0; cursor:pointer; color:${t.muted || "inherit"}; display:inline-flex; align-items:center; }
  .plain-x .chip-x{ font-size:14px; }
  .plain-x:hover{ color:${t.text}; }
  .plain-x:focus-visible{ outline:2px solid ${t.accent}; border-radius:2px; }
  .menu-opt{ display:flex; flex-direction:column; }
  .menu-hint{ font-size:11px; color:var(--muted); margin-top:4px; } /* why an option is unavailable */
  /* Schedule tab: month navigator (above strip + table) */
  .month-navigator{ display:flex; align-items:center; gap:8px; padding-bottom:16px; }
  .month-step.MuiIconButton-root{ width:32px; height:32px; border:1px solid ${t.borderSoft}; border-radius:${t.radius}px; color:${t.text}; }
  .month-step .MuiSvgIcon-root{ font-size:20px; }
  .month-range{ font-size:16px; font-weight:600; line-height:22.4px; min-width:176px; text-align:center; }
  .month-navigator .MuiButton-root{ margin-left:8px; }
  /* Schedule tab: All Households summary strip above the table */
  .ah-strip{ cursor:default; display:grid; grid-template-columns:146px minmax(0,1fr) 90px; align-items:center; border:1px solid ${P.grey800}; border-bottom:0; border-radius:8px 8px 0 0; background:#1F1F1F; flex-shrink:0; } /* joined to the table; columns match Household | months | Actions */
  .ah-strip-head{ padding:16px 0 16px 47px; position:relative; } /* "All" lines up with the Household text */
  .ah-strip-head .row-dot{ position:absolute; left:14px; top:50%; margin-top:-4px; } /* same spot as the table's changed-dot column */
  .ah-strip-title{ font-size:16px; font-weight:600; line-height:22.4px; display:flex; align-items:center; gap:8px; }
  .ah-groups{ display:flex; align-items:center; justify-content:center; gap:32px; padding:14px 16px; min-width:0; } /* centred over the month columns */
  .ah-group{ flex:0 1 auto; min-width:0; max-width:360px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; } /* label and chips centred within the group */
  .ah-group-label{ font-size:12px; color:var(--muted); line-height:16px; }
  .ah-group-chips{ display:flex; flex-wrap:wrap; justify-content:center; gap:4px; }
  .ah-empty{ font-size:14px; color:var(--muted); text-align:center; }
  .ah-strip .ah-edit{ justify-self:end; margin-right:15px; } /* same x as the row Save icon */
  .legend-divider{ border-top:1px solid var(--border-soft); padding-top:12px; margin-top:4px; }
  .legend-caption{ color:${P.grey00}; font-size:12px; line-height:1.4; }
  .legend-grid{ display:grid; grid-template-columns:max-content 1fr; column-gap:16px; row-gap:12px; align-items:center; }
  .legend-sample{ display:flex; }
  .legend-desc{ font-size:12px; line-height:1.4; color:${P.grey00}; }
  .legend-tip .scope-chip .MuiSvgIcon-root{ font-size:13px; }
  .section-highlight{ scroll-margin-top:16px; }
  /* Arriving from the snackbar CTA: the fields in the target section get the primary highlight, not the section */
  .section-highlight .MuiOutlinedInput-root{ transition:box-shadow .6s ease; }
  .section-highlight .MuiOutlinedInput-notchedOutline{ transition:border-color .6s ease; }
  .section-highlight.on .MuiOutlinedInput-root{ box-shadow:0 0 0 3px ${t.highlightGlow}; }
  .section-highlight.on .MuiOutlinedInput-notchedOutline{ border-color:${t.accent} !important; border-width:2px; }
  .snack-with-action.MuiSnackbarContent-root{ flex-wrap:nowrap; align-items:center; padding-right:14px; }
  .snack-with-action .MuiSnackbarContent-message{ flex:0 0 auto; }
  .snack-with-action .MuiSnackbarContent-action{ margin:0 0 0 24px; padding:0; align-self:center; display:flex; align-items:center; gap:8px; } /* CTA sits right, next to the dismiss X */
  .snack-cta.MuiButton-root{ font-weight:400; padding:4px 8px; margin:0; white-space:nowrap; } /* not bold */
  .MuiSnackbarContent-root .icon-action{ color:${P.grey00}; }
  .MuiSnackbarContent-root{ width:max-content; max-width:calc(100vw - 48px); flex-wrap:nowrap !important; } /* hugs its content, one line */
  .MuiSnackbarContent-message{ white-space:nowrap; }
`;

const style = document.createElement("style");
style.id = "manage-products-theme";
style.textContent = css;
// Appended to <body> so these rules come after MUI's injected styles in the cascade.
(document.body || document.head).appendChild(style);
export const MP_THEME = { tokens: t, mui, agGrid };
