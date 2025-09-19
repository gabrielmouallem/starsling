import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { OrgSwitcher } from "@/components/org-switcher";
import { Button } from "@/components/ui/button";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import CreateOrganizationForm from "@/components/create-organization-form";

export async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <nav className="w-full h-16 px-6 py-4 border-b border-neutral-800 bg-background flex items-center justify-between">
      <span className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">StarSling{" > "}</span>
          <OrgSwitcher />
          {" > "}
          <span className="font-semibold">Integrations</span>
        </span>
      </span>

      <div className="flex items-center gap-4">
        <CreateOrganizationDialog
          trigger={
            <Button type="button" variant="outline">
              Create organization
            </Button>
          }
        >
          <CreateOrganizationForm />
        </CreateOrganizationDialog>
        <Avatar>
          <AvatarImage
            src={session?.user?.image || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || ""}
          </AvatarFallback>
        </Avatar>
        <LogoutButton />
      </div>
    </nav>
  );
}

export default Navbar;
