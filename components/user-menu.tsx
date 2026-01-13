"use client";

import { signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="px-4 py-1.5 border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:border-[#e6edf3] hover:bg-[#e6edf3]/5 transition-all"
      >
        Sign in
      </button>
    );
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full ring-1 ring-[#30363d] hover:ring-purple-500/50 transition-all">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="bg-[#161b22] text-[#e6edf3] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#161b22] border-[#30363d]"
        align="end"
        forceMount
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium text-[#e6edf3]">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-[#7d8590]">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-[#30363d]" />
        {user.isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="cursor-pointer text-[#7d8590] hover:text-[#e6edf3] focus:text-[#e6edf3] focus:bg-[#21262d]"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#30363d]" />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
