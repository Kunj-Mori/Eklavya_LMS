"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Logo = () => {
  return (
    <div className="flex items-center gap-x-3">
      <div className="relative w-[300px] h-[100px] flex items-center sm:w-[320px] sm:h-[110px] lg:w-[360px] lg:h-[120px]">
        <Image
          fill
          alt="Logo"
          src="/logo4.svg"
          priority
          className="object-contain"
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 360px"
        />
      </div>
    </div>
  );
};

export default Logo; 