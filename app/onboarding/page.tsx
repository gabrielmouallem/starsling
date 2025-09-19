"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [hasOrg, setHasOrg] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await authClient.organization.list();
      if (!mounted) return;
      if ((data?.length ?? 0) > 0) {
        setHasOrg(true);
      } else {
        setHasOrg(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const createDefault = async () => {
    setSubmitting(true);
    try {
      // Create a simple default org for first-time users
      const { data, error } = await authClient.organization.create({
        name: "Default organization",
        slug: `default-organization-${Math.random().toString(36).slice(2, 8)}`,
      });
      if (!error && data?.id) {
        await authClient.organization.setActive({
          organizationId: data.id,
        });
        router.replace("/integrations");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (hasOrg === null) {
    return <div className="p-6">Loading...</div>;
  }

  if (hasOrg) {
    router.replace("/integrations");
    return null;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to StarSling</CardTitle>
            <CardDescription>
              Let’s create your first organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={createDefault}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create default organization"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
