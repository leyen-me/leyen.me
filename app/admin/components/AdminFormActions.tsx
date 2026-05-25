import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminFormActionsProps = {
  saving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  onCancel: () => void;
  className?: string;
};

export default function AdminFormActions({
  saving,
  saveLabel = "保存",
  savingLabel = "保存中...",
  onCancel,
  className,
}: AdminFormActionsProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? savingLabel : saveLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onCancel}
      >
        取消
      </Button>
    </div>
  );
}
