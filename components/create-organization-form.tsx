// Unused file placeholder: remove unused imports
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";
import { slugify } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function CreateOrganizationForm() {
  async function createOrg(formData: FormData) {
    "use server";
    const hdrs = await headers();
    const name = (formData.get("name") as string)?.trim();
    if (!name) {
      return; // keep modal open; could enhance with error state later
    }
    const slug = slugify(name);
    const created = await auth.api.createOrganization({
      body: { name, slug },
      headers: hdrs,
    });

    if (created?.id) {
      await auth.api.setActiveOrganization({
        body: { organizationId: created.id },
        headers: hdrs,
      });
      redirect("/integrations");
    }
  }

  return (
    <form action={createOrg} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium mb-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Acme Inc"
        />
      </div>
      <Button type="submit" className="w-full">
        Create organization
      </Button>
    </form>
  );
}
