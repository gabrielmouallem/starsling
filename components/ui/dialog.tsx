"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChangeAction, children }: DialogProps) {
  React.useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChangeAction?.(false);
    }
    if (open) {
      document.addEventListener("keydown", onEsc);
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onEsc);
        document.body.style.overflow = overflow;
      };
    }
  }, [open, onOpenChangeAction]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChangeAction?.(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full max-w-lg rounded-md border bg-background shadow-lg", className)}>
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
