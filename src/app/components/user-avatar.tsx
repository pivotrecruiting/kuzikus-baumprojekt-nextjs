"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getExtendedUser } from "../services/client/users";
import type { ExtendedUserT } from "../types/users";

type TUserAvatarProps = {
  className?: string;
};

export default function UserAvatar({ className }: TUserAvatarProps) {
  const [user, setUser] = useState<ExtendedUserT | null>(null);

  useEffect(() => {
    async function fetchExtendedUser() {
      const userData = await getExtendedUser();
      setUser(userData);
    }
    fetchExtendedUser();
  }, []);

  // Generate initials from name
  const initials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return "";
    const firstInitial = user.firstName ? user.firstName[0] : "";
    const lastInitial = user.lastName ? user.lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, [user?.firstName, user?.lastName]);

  const fullName = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return "";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }, [user?.firstName, user?.lastName]);

  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Benutzermenü öffnen"
    >
      {/* Avatar */}
      <div className="bg-primary/10 relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
        {user?.profileImage?.url ? (
          <Image
            src={user.profileImage.url}
            alt={`Profilbild von ${fullName}`}
            className="h-full w-full object-cover"
            width={40}
            height={40}
          />
        ) : (
          <div className="bg-primary/10 flex h-full w-full items-center justify-center text-sm font-medium">
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}
