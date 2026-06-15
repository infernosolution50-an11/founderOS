import { Slider } from "@/components/ui/Slider";
import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

type MoatCardProps = {
  label: string;
  tooltip?: ReactNode;
  value: number;
  colorClass: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function MoatCard({ label, tooltip, value, colorClass, disabled, onChange }: MoatCardProps) {
  return (
    <Card>
      <Slider label={label} tooltip={tooltip} value={value} disabled={disabled} onChange={onChange} />
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-os-panel">
        <div className={colorClass} style={{ width: `${value * 10}%`, height: "100%" }} />
      </div>
    </Card>
  );
}
