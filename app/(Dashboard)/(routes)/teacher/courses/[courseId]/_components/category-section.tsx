"use client";

import { IconBadge } from "@/components/Iconbadge";
import { CreateCategoryModal } from "@/components/modals/create-category-modal";
import { CategoryForm } from "./CategoryForm";

interface CategorySectionProps {
  initialData: any;
  courseId: string;
  options: { label: string; value: string; }[];
}

export const CategorySection = ({
  initialData,
  courseId,
  options
}: CategorySectionProps) => {
  const onSuccess = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <IconBadge iconName="ListChecks" />
          <h2 className="text-xl">Course category</h2>
        </div>
        <CreateCategoryModal onSuccess={onSuccess} />
      </div>
      <CategoryForm
        initialData={initialData}
        courseId={courseId}
        options={options}
      />
    </div>
  );
}; 