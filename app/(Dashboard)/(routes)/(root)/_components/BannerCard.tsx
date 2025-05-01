import { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/Iconbadge"

interface BannerCardProps {
  variant?: "default" | "success";
  label: string;
  description: string;
  icon: LucideIcon;
}

export const BannerCard = ({
  variant,
  icon: Icon,
  description,
  label,
}: BannerCardProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg rounded-xl p-6 flex items-center gap-x-6 animate-fade-in">
      <div className="p-4 bg-white bg-opacity-20 rounded-full">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div>
        <p className="text-xl font-semibold">{label}</p>
        <p className="text-sm opacity-90 mt-1">{description}</p>
      </div>
    </div>
  );
};
