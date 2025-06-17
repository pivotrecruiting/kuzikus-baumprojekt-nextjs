import { LinkAnchor } from "@/app/components/ui/link-anchor";
import { Bell } from "lucide-react";
import { NavButton } from "@/app/components/navbar/nav-button";
import Container from "@/app/components/container";
import UserDropdown from "../ui/user-dropdown";
import Link from "next/link";
import { CompanyLogo } from "../logos/company-logo";

export function Navbar() {
  return (
    <nav className="border-b px-10" aria-label="Backend-Navigation">
      <Container>
        <div className="flex items-center justify-between py-2">
          <Link href="/">
            <CompanyLogo className="w-48" />
          </Link>
          <div className="flex items-center gap-8 py-6">
            <LinkAnchor
              className="text-muted-foreground font-medium"
              size="lg"
              href="/"
            >
              Dashboard
            </LinkAnchor>
            <LinkAnchor
              className="text-muted-foreground font-medium"
              size="lg"
              href="/zertifikate"
            >
              Zertifikate
            </LinkAnchor>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <NavButton
                variant="link"
                linkSize="lg"
                className="svg-crisp"
                aria-label="Benachrichtigungen öffnen"
              >
                <Bell strokeWidth={2} size={20} />
              </NavButton>
            </div>
            {/* User Avatar */}
            <UserDropdown />
          </div>
        </div>
      </Container>
    </nav>
  );
}
