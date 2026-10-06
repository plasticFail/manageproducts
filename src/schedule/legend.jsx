import { Chip } from "@mui/material";

function LegendRow({ sample, children }) {
  return (
    <>
      <div className="legend-sample">{sample}</div>
      <div className="legend-desc">{children}</div>
    </>
  );
}
const SampleChip = ({ type, icon }) => (
  <Chip variant="cellTag" label="FAMILY" icon={icon} className={`scope-chip ${type ? "tag-type-" + type : ""}`} />
);
function TypeLegendRows() {
  return (
    <>
      <div className="legend-tip-title">How to Read</div>
      <div className="legend-grid">
        <LegendRow sample={<SampleChip type="O" />}>Mapped to Type O</LegendRow>
        <LegendRow sample={<SampleChip type="T" />}>Mapped to Type T</LegendRow>
        <LegendRow sample={<SampleChip type="X" />}>Mapped to Type X</LegendRow>
      </div>
    </>
  );
}
export function MappingLegend() {
  return (
    <div className="legend-tip">
      <TypeLegendRows />
    </div>
  );
}
export function ScheduleLegend() {
  const row = (sample, text) => <LegendRow sample={sample}>{text}</LegendRow>;
  return (
    <div className="legend-tip">
      <div className="legend-tip-title">How to Read</div>
      <div className="legend-grid">
        {row(<SampleChip type="O" />, "Mapped to Type O")}
        {row(<SampleChip type="T" />, "Mapped to Type T")}
        {row(<SampleChip type="X" />, "Mapped to Type X")}
        {row(<SampleChip />, "Not mapped")}
        {row(<span className="plain-item">PRODUCT</span>, "Product")}
      </div>
    </div>
  );
}
