import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black h-screen p-3">
      <div className="bg-secondary h-full w-full rounded-2xl flex flex-col">
        <nav className="p-6">
          <div className="flex items-center gap-3">
            <Image
              className="size-10"
              alt=""
              src={"/logo.svg"}
              height={200}
              width={200}
            ></Image>
            <p className="font-aver text-3xl text-[#fef28e]">Saves</p>
          </div>
        </nav>
        <div className="flex-1 flex justify-center items-center">
            {children}
        </div>
      </div>
    </div>
  );
}