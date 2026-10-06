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
  chipClass,
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
      multiple={!single}
      disableCloseOnSelect={!single}
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
        <div className={"msf-tags" + (stack ? " stack" : "")}>
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
                className={[className, chipClass ? chipClass(v) : ""].join(" ")}
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
        stack
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
                {showCount && !single && value.length > 0 ? <span className="count-chip">{value.length}</span> : null}
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
