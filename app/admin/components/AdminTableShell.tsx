import { cn } from "@/lib/utils";

type AdminTableShellProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AdminTableShell({
  children,
  className,
}: AdminTableShellProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}
