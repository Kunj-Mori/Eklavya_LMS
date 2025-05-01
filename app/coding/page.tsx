'use client';

import { CodingPlatform } from "@/components/coding/CodingPlatform";

export default function CodingPage() {
  return (
    <div className="h-full">
      <div className="mb-6 bg-slate-100 p-8 border-b">
        <h1 className="text-3xl font-bold text-slate-800">Code Editor</h1>
        <p className="text-slate-600 mt-2">
          Write, test, and run code in multiple programming languages. Perfect for practice and learning.
        </p>
      </div>
      <div className="p-6">
        <CodingPlatform />
      </div>
    </div>
  );
} 