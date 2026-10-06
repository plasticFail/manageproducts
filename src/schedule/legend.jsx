import { Chip } from "@mui/material";

function LegendRow({ sample, children }) {
  return (
    <>
      <div className="legend-sample">{sample}</div>
      <div className="legend-desc">{children}</div>
    </>
  );
}
const SampleChip = ({ cycle, icon }) => (
  <Chip variant="cellTag" label="FAMILY" icon={icon} className={`scope-chip ${cycle ? "tag-cycle-" + cycle : ""}`} />
);
function CycleLegendRows() {
  return (
    <>
      <div className="legend-tip-title">How to Read</div>
      <div className="legend-grid">
        <LegendRow sample={<SampleChip cycle="O" />}>Mapped to Type O</LegendRow>
        <LegendRow sample={<SampleChip cycle="T" />}>Mapped to Type T</LegendRow>
        <LegendRow sample={<SampleChip cycle="X" />}>Mapped to Type X</LegendRow>
      </div>
    </>
  );
}
export function MappingLegend() {
  return (
    <div className="legend-tip">
      <CycleLegendRows />
    </div>
  );
}
export function ScheduleLegend() {
  const row = (sample, text) => <LegendRow sample={sample}>{text}</LegendRow>;
  return (
    <div className="legend-tip">
      <div className="legend-tip-title">How to Read</div>
      <div className="legend-grid">
        {row(<SampleChip cycle="O" />, "Mapped to Type O")}
        {row(<SampleChip cycle="T" />, "Mapped to Type T")}
        {row(<SampleChip cycle="X" />, "Mapped to Type X")}
        {row(<SampleChip />, "Not mapped")}
        {row(<span className="plain-item">PRODUCT</span>, "Product")}
      </div>
    </div>
  );
}
