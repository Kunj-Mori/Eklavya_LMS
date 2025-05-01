"use client";

import { Layout, Compass, List, BarChart, Code, PenTool, ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

const guestRoutes = [
  {
    icon: <Layout size={22} />,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: <Compass size={22} />,
    label: "Browse",
    href: "/search",
  },
  {
    icon: <PenTool size={22} />,
    label: "Examination",
    href: "/examination",
  },
  {
    icon: <Code size={22} />,
    label: "Coding Platform",
    href: "/coding",
  },
];

const teacherRoutes = [
  {
    icon: <List size={22} />,
    label: "Courses",
    href: "/teacher/courses",
  },
  {
    icon: <ClipboardList size={22} />,
    label: "Assessments",
    href: "/teacher/assessment",
  },
  {
    icon: <BarChart size={22} />,
    label: "Analytics",
    href: "/teacher/analytics",
  },
];

interface SidebarRouteProps {
  icon: JSX.Element;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarRoute = ({
  icon,
  label,
  href,
  isActive,
}: SidebarRouteProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <div className={cn(
          "text-slate-500",
          isActive && "text-sky-700"
        )}>
          {icon}
        </div>
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-sky-700 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </Link>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.includes("/teacher");
  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-4">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        {routes.map((route) => (
          <SidebarRoute
            key={route.href}
            {...route}
            isActive={
              (pathname === "/" && route.href === "/") ||
              pathname === route.href ||
              pathname?.startsWith(`${route.href}/`)
            }
          />
        ))}
      </div>
    </div>
  );
};
