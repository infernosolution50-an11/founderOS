import { Slider } from "@/components/ui/Slider";
import { Card } from "@/components/ui/Card";

type MoatCardProps = {
  label: string;
  value: number;
  colorClass: string;
  onChange: (value: number) => void;
};

export function MoatCard({ label, value, colorClass, onChange }: MoatCardProps) {
  return (
    <Card>
      <Slider label={label} value={value} onChange={onChange} />
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-os-panel">
        <div className={colorClass} style={{ width: `${value * 10}%`, height: "100%" }} />
      </div>
    </Card>
  );
}
