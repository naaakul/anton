"use client"

import { useState } from "react";

type App = {
  id: string;
  trackingId: string;
  name: string;
  domain: string;
  framework: string;
  dbType: string;
  createdAt: string;
};

export type AppStatus = "live" | "waiting";

interface AppCardProps {
  app: App;
}

export default function AppCard({ app }: AppCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative bg-[#1a1a1a] border border-white/[0.07] rounded-2xl px-4 pt-3 pb-4 flex flex-col gap-3 hover:border-white/[0.14] transition-colors cursor-pointer group">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${
            // app.status === "live"
            true
              ? "bg-green-500/15 text-green-400"
              : "bg-orange-500/15 text-orange-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              // app.status === "live" ? "bg-green-400" : "bg-orange-400"
              true ? "bg-green-400" : "bg-orange-400"
            }`}
          />
          {true ? "Live" : "Waiting to connect"}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <circle cx="8" cy="3" r="1.2" />
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="8" cy="13" r="1.2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-[#222] border border-white/10 rounded-xl shadow-xl py-1 text-sm text-neutral-300">
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors">
                Open
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors">
                Settings
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors text-red-400">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex-shrink-0 overflow-hidden">
          <img
            src={`https://www.google.com/s2/favicons?domain=https://${app.domain}&sz=64`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-tight truncate">
            {app.name}
          </p>
          <p className="text-neutral-500 text-xs truncate mt-0.5">{app.domain}</p>
        </div>

        <div className="flex items-center gap-1 text-neutral-500 text-xs flex-shrink-0">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3 h-3"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3.5l2 1.5" strokeLinecap="round" />
          </svg>
          <span>4 days</span>
        </div>
      </div>
    </div>
  );
}
