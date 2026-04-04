"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/auth-client";

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function handleGoogleSignIn() {
    setError(null);

    await signIn.social(
      {
        provider: "google",
        callbackURL: "/apps",
      },
      {
        onRequest: () => setLoading("google"),
        onResponse: () => setLoading(null),
        onError: () => {
          setLoading(null);
          setError("Google login failed");
        },
      },
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
      }}
    >
      {/* Combined SVG: lines + logo */}
      <svg
        viewBox="0 50 1757 2001"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background lines */}
        <line
          x1="1568.4"
          y1="1618.79"
          x2="497.127"
          y2="0.275989"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.551937 -0.833886 -0.833886 -0.551937 186.046 1621.95)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.551937 -0.833886 -0.833886 -0.551937 186.046 1674.56)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.618409 -0.785857 -0.785857 -0.618408 121.532 1651.97)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.618409 -0.785857 -0.785857 -0.618408 121.532 1700)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.688355 -0.725375 -0.725374 -0.688355 158.932 1546.79)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="1940.93"
          y2="-0.5"
          transform="matrix(0.688355 -0.725375 -0.725374 -0.688355 158.932 1590.25)"
          stroke="#5E5E5E"
        />
        <line
          x1="69.7221"
          y1="1570.63"
          x2="1635.64"
          y2="218.483"
          stroke="#5E5E5E"
        />
        <line
          x1="69.7221"
          y1="1608.37"
          x2="1635.64"
          y2="256.224"
          stroke="#5E5E5E"
        />
        <line
          x1="0.286454"
          y1="1554.95"
          x2="1695.04"
          y2="368.268"
          stroke="#5E5E5E"
        />
        <line
          x1="0.286454"
          y1="1589.26"
          x2="1695.04"
          y2="402.581"
          stroke="#5E5E5E"
        />
        <line
          x1="1570.06"
          y1="1673.69"
          x2="498.784"
          y2="55.1753"
          stroke="#5E5E5E"
        />
        <line
          x1="1634.59"
          y1="1651.13"
          x2="434.306"
          y2="125.837"
          stroke="#5E5E5E"
        />
        <line
          x1="1634.59"
          y1="1699.16"
          x2="434.306"
          y2="173.872"
          stroke="#5E5E5E"
        />
        <line
          x1="1597.23"
          y1="1545.99"
          x2="261.18"
          y2="138.092"
          stroke="#5E5E5E"
        />
        <line
          x1="1597.23"
          y1="1589.45"
          x2="261.18"
          y2="181.552"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="2068.91"
          y2="-0.5"
          transform="matrix(-0.756881 -0.653553 -0.653553 0.756881 1686.47 1569.86)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="2068.91"
          y2="-0.5"
          transform="matrix(-0.756881 -0.653553 -0.653553 0.756881 1686.47 1607.6)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="2068.91"
          y2="-0.5"
          transform="matrix(-0.819152 -0.573576 -0.573577 0.819152 1755.95 1554.21)"
          stroke="#5E5E5E"
        />
        <line
          y1="-0.5"
          x2="2068.91"
          y2="-0.5"
          transform="matrix(-0.819152 -0.573576 -0.573577 0.819152 1755.95 1588.53)"
          stroke="#5E5E5E"
        />

        {/* Logo mark — centered in the upper half of the viewBox */}
        <g>
          <path
            d="M824.377 1012.31C857.118 989.685 900.424 989.608 933.245 1012.12L1015.06 1068.22C1029.66 1078.23 1048.9 1078.3 1063.58 1068.4L942.58 984.792C904.18 958.26 853.352 958.323 815.018 984.95L694.884 1068.4C709.71 1078.31 729.084 1078.16 743.755 1068.02L824.377 1012.31Z"
            fill="#D9D9D9"
          />
          <path
            d="M922.527 909.647C897.368 887.993 860.148 888.026 835.027 909.722L670.321 1051.98L694.884 1068.4L846.669 936.356C865.072 920.347 892.448 920.311 910.892 936.272L1063.58 1068.4L1087.9 1051.98L922.527 909.647Z"
            fill="#D9D9D9"
          />
          <path
            d="M922.162 835.895C898.514 811.155 858.996 811.175 835.373 835.94L645.271 1035.23L670.321 1051.98L849.748 862.454C865.507 845.808 892.005 845.785 907.794 862.404L1087.9 1051.98L1112.7 1035.23L922.162 835.895Z"
            fill="#D9D9D9"
          />
          <path
            d="M937.692 766.191C907.655 728.053 849.85 728.066 819.83 766.218L620.951 1018.97L645.271 1035.23L838.657 788.673C859.063 762.656 898.451 762.636 918.883 788.633L1112.7 1035.23L1136.78 1018.97L937.692 766.191Z"
            fill="#D9D9D9"
          />
          <path
            d="M959.601 699.023C921.238 641.135 836.25 641.135 797.887 699.023L612.791 978.331C603.855 991.814 607.504 1009.98 620.951 1018.97L817.028 722.136C846.273 677.863 911.237 677.849 940.501 722.11L1136.78 1018.97C1150.11 1009.97 1153.69 991.907 1144.81 978.498L959.601 699.023Z"
            fill="#D9D9D9"
          />
        </g>
      </svg>

      {/* Buttons */}
      <div className="relative z-10 flex flex-wrap justify-center gap-4 px-4 pt-[240px]">
        {/* GitHub Button */}
        <button className="flex items-center cursor-pointer justify-center gap-[10px] px-8 py-[13px] min-w-[160px] rounded-full border border-[#3a3a3a] bg-[#111111] text-white text-[15px] font-medium tracking-[0.01em] transition-all duration-200 ease-in-out hover:bg-[#2a2a2a] hover:-translate-y-[1px]">
          <GithubIcon />
          GitHub
        </button>

        {/* Google Button */}
        <button
          disabled={loading !== null}
          onClick={handleGoogleSignIn}
          className="flex items-center cursor-pointer justify-center gap-[10px] px-8 py-[13px] min-w-[160px] rounded-full border border-[#e0e0e0] bg-white text-[#1a1a1a] text-[15px] font-medium tracking-[0.01em] transition-all duration-200 ease-in-out hover:bg-[#f5f5f5] hover:-translate-y-[1px]"
        >
          <GoogleIcon />
          {loading === "google" ? "Redirecting..." : "Google"}
        </button>
      </div>
    </div>
  );
}
