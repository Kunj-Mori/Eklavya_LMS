"use client";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SearchInput } from "@/components/SearchInput";

function NavbarRoutes() {
  const pathname = usePathname();
  const user = useUser()
  const role = user?.user?.publicMetadata?.role;
  
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/chapter");
  const isSearchPage = pathname === "/search";

  return (
    <div className="flex items-center gap-x-2 w-full">
      {isSearchPage && (
        <div className="hidden md:block flex-1">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto items-center">
        {role === "instructor" && (
          isTeacherPage || isPlayerPage ? (
            <Link href="/">
              <Button size="sm" variant="ghost" className="hidden md:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <Button size="sm" variant="ghost" className="md:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/teacher/courses">
              <Button size="sm" variant="ghost" className="text-sm">
                Teacher mode
              </Button>
            </Link>
          )
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

export default NavbarRoutes;
