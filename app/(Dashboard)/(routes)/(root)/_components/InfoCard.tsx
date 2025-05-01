"use client";

import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { IconBadge } from "@/components/Iconbadge"

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
  className?: string;
}

export const InfoCard = ({
  variant = "default",
  icon: Icon,
  numberOfItems,
  label,
  className = "",
}: InfoCardProps) => {
  return (
    <div className={`border rounded-lg flex items-center gap-x-4 p-5 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl ${className}`}>
      <div className="p-3 bg-gray-100 rounded-full">
        <Icon className="w-8 h-8 text-gray-700" />
      </div>
      <div>
        <p className="text-lg font-semibold">{label}</p>
        <p className="text-gray-600 text-sm">{numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}</p>
      </div>
    </div>
  );
};
