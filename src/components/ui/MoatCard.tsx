import { Slider } from "@/components/ui/Slider";

type MoatCardProps = {
  label: string;
  value: number;
  colorClass: string;
  onChange: (value: number) => void;
};

export function MoatCard({ label, value, colorClass, onChange }: MoatCardProps) {
  return (
    <div className="rounded-2xl border border-os-border bg-os-surface p-4">
      <Slider label={label} value={value} onChange={onChange} />
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-os-panel">
        <div className={colorClass} style={{ width: `${value * 10}%`, height: "100%" }} />
      </div>
    </div>
  );
}
