"use client";

import {
  LayoutDashboard,
  ListChecks,
  CircleDollarSign,
  File,
  Code,
  PenTool,
  BarChart,
  Compass,
  Layout,
  Eye,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ListChecks,
  CircleDollarSign,
  File,
  Code,
  PenTool,
  BarChart,
  Compass,
  Layout,
  Eye,
  Video
};

interface IconBadgeProps {
  iconName: keyof typeof iconMap;
  size?: number;
  className?: string;
}

export function IconBadge({ iconName, size, className }: IconBadgeProps) {
  const Icon = iconMap[iconName];

  if (!Icon) {
    return <span>Invalid icon</span>;
  }

  return (
    <div className={cn(
      "p-2 w-fit rounded-full bg-sky-100 dark:bg-sky-900",
      className
    )}>
      <Icon
        size={size || 20}
        className="text-sky-700 dark:text-sky-300"
      />
    </div>
  );
}
