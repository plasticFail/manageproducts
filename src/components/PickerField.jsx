import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  createFilterOptions,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import { ErrorFlag } from "./EditGrid";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import { up } from "../lib/utils";

const baseFilter = createFilterOptions();
export function PickerField({
  id,
  options,
  value,
  onToggle,
  onClear,
  single = false,
  placeholder = "Product Family",
  disabled = false,
  getSub,
  getDisabled,
  getDetail,
  checkboxes = true,
  allowCreate = false,
  onCreate,
  showCount = true,
  showChevron = true,
  stack = false,
  uppercase = true,
  emptyText = "No matches",
  error = "",
  onCommit,
  inlineError = false,
  variant = "outlined",
  groupBy,
  tagKind,
  hideTag,
  optionIndent,
  indeterminate,
  swapCount = false,
  hideZero = false,
}) {
  const [inputValue, setInputValue] = useState("");
  const filterOptions = (opts, state) => {
    const filtered = baseFilter(opts, state);
    const term = state.inputValue.trim();
    if (allowCreate && term && !opts.some((o) => o.toLowerCase() === term.toLowerCase())) filtered.push({ create: term });
    return filtered;
  };
  const field = (
    <Autocomplete
      onBlur={() => onCommit && onCommit()}
      id={id}
      className={swapCount && inputValue ? "typing" : undefined}
      multiple={!single}
      disableCloseOnSelect={!single}
      openOnFocus={swapCount}
      disabled={disabled}
      options={options}
      {...(groupBy ? { groupBy } : {})}
      value={single ? (value[0] ?? null) : value}
      inputValue={inputValue}
      onInputChange={(e, v) => setInputValue(v)}
      filterOptions={filterOptions}
      getOptionLabel={(o) => (typeof o === "string" ? o : o.create)}
      isOptionEqualToValue={(a, b) => a === b}
      getOptionDisabled={(o) => typeof o === "string" && !!getDisabled && !value.includes(o) && getDisabled(o)}
      noOptionsText={options.length ? "No matches" : emptyText}
      forcePopupIcon={showChevron}
      clearIcon={<Close className="msf-clear-x" titleAccess="Clear" fontSize="small" />}
      slotProps={{ popper: { placement: "bottom-start", sx: { minWidth: 300 } } }}
      onChange={(e, newValue, reason, details) => {
        const opt = details && details.option;
        if (reason === "clear") {
          onClear();
          return;
        }
        if (opt && typeof opt === "object" && opt.create) {
          setInputValue("");
          onCreate(opt.create);
          return;
        }
        if (opt) onToggle(opt);
      }}
      renderTags={(vals, getTagProps) => (
        <div className={"msf-tags" + (stack ? " stack" : "") + (swapCount ? " wrap" : "")}>
          {vals.map((v, i) => {
            const { key, className, ...tagProps } = getTagProps({ index: i });
            if (hideTag && hideTag(v)) return null;
            if (tagKind && tagKind(v) === "product")
              return (
                <span key={key} className="plain-item plain-item-edit">
                  {v}
                  <button type="button" className="plain-x" aria-label={`Remove ${v}`} onClick={tagProps.onDelete}>
                    <Close className="chip-x" />
                  </button>
                </span>
              );
            return (
              <Chip
                key={key}
                {...tagProps}
                className={[className, "multi-chip"].join(" ")}
                label={v}
                deleteIcon={<Close className="chip-x" />}
              />
            );
          })}
        </div>
      )}
      renderOption={(props, o, { selected }) => {
        const { key, ...rest } = props;
        if (typeof o === "object")
          return (
            <li key={key} {...rest} className={rest.className + " msf-extra"}>
              Create "{up(o.create)}"
            </li>
          );
        const sub = getSub ? getSub(o) : "";
        const detail = getDetail ? getDetail(o) : "";
        return (
          <li key={key} {...rest} className={rest.className + (optionIndent && optionIndent(o) ? " msf-indent" : "")}>
            <div className="msf-check-row">
              {checkboxes && !single ? (
                <Checkbox checked={selected} indeterminate={!selected && !!(indeterminate && indeterminate(o))} tabIndex={-1} />
              ) : null}
              <span>{o}</span>
            </div>
            {sub ? <div className="msf-sub">{sub}</div> : null}
            {detail ? <div className="msf-detail">{detail}</div> : null}
          </li>
        );
      }}
      sx={
        swapCount
          ? {
              // Schedule cell: chips left (wrapping), then one group on the right: the 32px counter (or the Clear X in its place while the field is active) and the chevron
              // No border of its own: the white line under each month cell is drawn by the cell (see .month-cell.cell-editing)
              "& .MuiOutlinedInput-notchedOutline": { border: "0 !important" },
              "& .MuiAutocomplete-inputRoot": { flexWrap: "nowrap", alignItems: "center", gap: 0, paddingLeft: "8px !important", paddingRight: "4px !important" },
              "& .MuiAutocomplete-endAdornment": { gap: "4px" },
              // The month cell is the field: no left / right / top border, only a white bottom border (accent, 2px while active)
              "& .MuiOutlinedInput-root": { borderRadius: 0, background: "transparent", minHeight: 40 },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline, & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderWidth: "0 0 1px 0",
                borderColor: "#FFFFFF",
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: "0 0 2px 0", borderColor: "var(--accent)" },
              "& .count-chip": { width: 32, height: 32, marginLeft: "auto", marginRight: "4px", fontSize: 14, borderRadius: "4px" },
              "& .msf-tags": { marginRight: "4px" },
              // Focus shows the Clear X (no counter); otherwise the counter shows the number of chips
              // While the field has focus the Clear X replaces the counter (also after an option is picked); once focus leaves, the counter returns
              "&:focus-within .typing-x": { display: "inline-flex" },
              "&:focus-within .typing-x + .count-chip": { display: "none" },
              "&.typing .count-chip": { display: "none" },
              "& .MuiAutocomplete-clearIndicator": { display: "none" },
              "& .typing-x": { width: 32, height: 32, marginLeft: "auto", marginRight: "4px", display: "none", alignItems: "center", justifyContent: "center", padding: 0, border: 0, background: "transparent", color: "inherit", cursor: "pointer", flexShrink: 0 },
              ...(value.length ? { "& .MuiAutocomplete-input": { width: "0 !important", minWidth: "0 !important", flex: "0 0 0", padding: "0 !important" }, "&:focus-within .MuiAutocomplete-input": { width: "24px !important", minWidth: "24px !important", flex: "0 0 24px", padding: "0 !important" } } : {}),
            }
          : stack
          ? {
              "& .MuiAutocomplete-inputRoot": { flexDirection: "column", alignItems: "stretch" },
              "& .MuiAutocomplete-endAdornment": { alignSelf: "flex-end" },
              "& .MuiAutocomplete-input": { width: "100% !important", flex: "none" },
            }
          : void 0
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          placeholder={value.length ? "" : placeholder}
          error={!!error}
          helperText={inlineError ? void 0 : error || void 0}
          inputProps={{ ...params.inputProps, style: uppercase ? { textTransform: "uppercase" } : void 0 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {inlineError && error ? <ErrorFlag message={error} /> : null}
                {swapCount && (inputValue || value.length > 0) ? (
                  <button type="button" className="typing-x" aria-label="Clear" onMouseDown={(e) => e.preventDefault()} onClick={() => (inputValue ? setInputValue("") : onClear())}>
                    <Close fontSize="small" />
                  </button>
                ) : null}
                {showCount && !single && (value.length > 0 || (swapCount && !hideZero)) ? (
                  <span className={"count-chip" + (value.length ? " has-value" : "")}>{value.length}</span>
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
  return field;
}
const Chevron = (props) => <KeyboardArrowDown className={props.className + " select-chevron"} />;
export function SelectField({
  id,
  value,
  onChange,
  onClear,
  placeholder,
  options,
  disabled = false,
  clearable = true,
  error = "",
  inlineError = false,
  variant = "outlined",
}) {
  const field = (
    <FormControl
      fullWidth
      variant={variant}
      className={"select-field" + (variant === "standard" ? " cell-select" : "")}
      error={!!error}
      disabled={disabled}
    >
      <Select
        id={id}
        displayEmpty
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(v) =>
          v !== "" && v != null ? ((options.find((o) => o.value === v) || {}).label ?? v) : <span className="muted">{placeholder}</span>
        }
        variant={variant}
        endAdornment={
          inlineError && error ? (
            <InputAdornment position="end" className="err-adorn">
              <ErrorFlag message={error} />
            </InputAdornment>
          ) : clearable && value && !disabled ? (
            <InputAdornment position="end" sx={{ ml: 0 }}>
              <button type="button" className="select-clear-inner" onClick={onClear} title="Clear">
                <Close className="select-clear-icon" />
              </button>
            </InputAdornment>
          ) : null
        }
      >
        {options.length ? (
          options.map((o) => (
            <MenuItem key={o.value} value={o.value} disabled={!!o.disabled}>
              {o.hint ? (
                <div className="menu-opt">
                  <span>{o.label ?? o.value}</span>
                  <span className="menu-hint">{o.hint}</span>
                </div>
              ) : (
                (o.label ?? o.value)
              )}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="" disabled>
            No options
          </MenuItem>
        )}
      </Select>
      {error && !inlineError ? <FormHelperText>{error}</FormHelperText> : null}
    </FormControl>
  );
  return field;
}
