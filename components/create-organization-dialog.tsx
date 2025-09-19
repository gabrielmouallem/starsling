"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CreateOrganizationDialog({
  trigger,
  children,
}: {
  trigger: React.ReactElement;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const enhancedTrigger = React.cloneElement(trigger, {
    onClick: (e: any) => {
      trigger.props?.onClick?.(e);
      setOpen(true);
    },
  });

  return (
    <>
      {enhancedTrigger}
      <Dialog open={open} onOpenChangeAction={setOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <div className="p-4 border-b">
            <DialogHeader>
              <DialogTitle>Create organization</DialogTitle>
              <DialogDescription>
                Provide a name; slug is generated automatically.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
