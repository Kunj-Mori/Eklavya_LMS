"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center justify-center w-full py-2">
      <div className="relative w-[250px] h-[100px] flex items-center">
        <Image
          fill
          alt="Eklavya Logo"
          src="/logo4.svg"
          priority
          className="object-contain"
          sizes="250px"
        />
      </div>
    </Link>
  );
};

export default Logo;
