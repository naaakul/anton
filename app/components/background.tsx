"use client";

import { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

export default function Background() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      setSize({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // prevent hydration mismatch
  if (size.w === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 bg-[#3a3a3a]">
      <GrainGradient
        width={size.w}
        height={size.h}
        colors={["#5a5a5a", "#000000"]}
        colorBack="#000000"
        softness={0}
        intensity={1}
        noise={1}
        shape="wave"
        speed={0.9}
        scale={2.4}
        offsetX={-0.5}
      />
    </div>
  );
}
//#7a7a7a