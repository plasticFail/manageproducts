import Add from "@mui/icons-material/Add";
import { Button, Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import { CancelOutlined } from "../components/icons";
import Close from "@mui/icons-material/Close";
import { EditGrid, ErrorFlag, snap } from "../components/EditGrid";
import { FieldLabel, Section } from "../components/common";
import { useEffect, useState } from "react";
import { up } from "../lib/utils";

export function FamilyFields({ idPrefix, name, setName, products, setProducts, errors, setErrors, dirty = () => {}, rowsClassName }) {
  const perRow = errors.products || {};
  const clearProductErrors = () => {
    if (errors.products) setErrors({ ...errors, products: void 0 });
  };
  return (
    <>
      <div className="field">
        <FieldLabel htmlFor={`${idPrefix}-name`}>Product Family name</FieldLabel>
        <TextField
          id={`${idPrefix}-name`}
          fullWidth
          className="fam-input"
          placeholder="Product Family Name"
          value={name}
          error={!!errors.name}
          helperText={errors.name || void 0}
          onChange={(e) => {
            dirty();
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: void 0 });
          }}
          onBlur={() => setName(up(name))}
        />
      </div>
      <Section legend={null} className="products-section">
        <EditGrid
          fit
          className={rowsClassName}
          count={products.length}
          columns={[{ id: "product", label: "Products", required: true }]}
          renderCell={(col, i) => (
            <TextField
              id={`${idPrefix}-product-${i}`}
              fullWidth
              variant="standard"
              className="fam-input cell-input"
              placeholder="Product name"
              value={products[i] ?? ""}
              error={!!perRow[i]}
              inputProps={{ "aria-label": `Product ${i + 1}` }}
              InputProps={
                perRow[i]
                  ? {
                      endAdornment: (
                        <InputAdornment position="end" className="err-adorn">
                          <ErrorFlag message={perRow[i]} />
                        </InputAdornment>
                      ),
                    }
                  : void 0
              }
              onChange={(e) => {
                dirty();
                setProducts(products.map((p, j) => (j === i ? e.target.value : p)));
                if (perRow[i]) {
                  const next = { ...perRow };
                  delete next[i];
                  setErrors({ ...errors, products: Object.keys(next).length ? next : void 0 });
                }
              }}
              onBlur={() => setProducts((ps) => ps.map((p, j) => (j === i ? up(p) : p)))}
            />
          )}
          renderRemove={(i) =>
            products.length > 1 ? (
              <IconButton
                className="icon-action row-remove"
                title="Remove product"
                aria-label="Remove product"
                onClick={() => {
                  dirty();
                  setProducts(products.filter((_, j) => j !== i));
                  clearProductErrors();
                }}
              >
                <CancelOutlined />
              </IconButton>
            ) : null
          }
        />
        <div className="add-row">
          <Button
            variant="link"
            startIcon={<Add />}
            onClick={() => {
              dirty();
              setProducts([...products, ""]);
              // keep the new empty row in view once the list scrolls
              setTimeout(() => {
                const v = document.querySelector(".products-section .ag-body-viewport");
                if (v) v.scrollTop = v.scrollHeight;
              }, 60);
            }}
          >
            Add Product
          </Button>
        </div>
      </Section>
    </>
  );
}
export function CreateFamilyDialog({ ctx, onCancel, onSave }) {
  const [name, setName] = useState("");
  const [products, setProducts] = useState([""]);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (ctx) {
      setName(ctx.prefill || "");
      setProducts([""]);
      setErrors({});
    }
  }, [ctx]);
  const initial = snap({ name: up(((ctx && ctx.prefill) || "").trim()), products: [""] });
  const changed = snap({ name: up(name.trim()), products: products.map((p) => up((p || "").trim())) }) !== initial;
  if (!ctx) return null;
  const cta = ctx.personnel ? `Create and Map to ${ctx.personnel}` : "Create Product Family";
  return (
    <Dialog
      open
      onClose={onCancel}
      maxWidth={false}
      PaperProps={{ sx: { width: 480, maxWidth: "calc(100% - 40px)", height: 560, maxHeight: "90vh" } }}
    >
      <div className="modal-head">
        <h2>Create Product Family</h2>
        <IconButton className="close-btn" onClick={onCancel} aria-label="Close">
          <Close />
        </IconButton>
      </div>
      <div className="modal-body fam-body">
        <FamilyFields
          idPrefix="inner-fam"
          name={name}
          setName={setName}
          products={products}
          setProducts={setProducts}
          errors={errors}
          setErrors={setErrors}
          rowsClassName="inner-product-rows"
        />
      </div>
      <div className="modal-footer">
        <Button
          variant="primary"
          disabled={!changed}
          onClick={() => {
            const errs = onSave(name, products);
            if (errs) setErrors(errs);
          }}
        >
          {cta}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
