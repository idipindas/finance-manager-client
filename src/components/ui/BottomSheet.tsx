import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full bg-bg-elevated rounded-t-[24px] shadow-2xl slide-up",
          "border-t border-border max-h-[90dvh] overflow-y-auto",
          className
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-4">
            <h2 className="text-lg font-semibold text-text-primary font-heading">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-card"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
