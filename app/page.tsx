"use client";

import QrScanner from "@/components/QRScanner";
import Receive from "@/components/Receive";
import { Send } from "lucide-react";
import { useState } from "react";
const page = () => {
  const [send, setSend] = useState(true);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-black">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-around w-full">
          <button className="text-zinc-200 text-3xl" onClick={() => setSend(true)}>Send</button>
          <button className="text-zinc-200 text-3xl" onClick={() => setSend(false)}>Receive</button>
        </div>
        <div className="w-full h-[1px] bg-zinc-600"></div>
        {send ? <Send/> : <Receive/>}
        <QrScanner /> 
      </div>
    </main>
  );
};

export default page;
