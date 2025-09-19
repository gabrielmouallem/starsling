"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectValue,
} from "@/components/ui/select";

type Org = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

export function OrgSwitcher() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: listRes } = await authClient.organization.list();
        const { data: activeMember } =
          await authClient.organization.getActiveMember();
        if (!mounted) return;
        setOrgs(listRes ?? []);
        setActiveOrgId(activeMember?.organizationId ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => activeOrgId ?? undefined, [activeOrgId]);

  if (loading) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={async (orgId) => {
          await authClient.organization.setActive({
            organizationId: orgId,
          });
          setActiveOrgId(orgId);
          router.refresh();
        }}
      >
        <SelectTrigger className="min-w-30">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name || o.slug || o.id}
            </SelectItem>
          ))}
          <SelectSeparator />
        </SelectContent>
      </Select>
    </div>
  );
}

export default OrgSwitcher;
