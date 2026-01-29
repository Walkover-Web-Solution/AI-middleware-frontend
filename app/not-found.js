"use client";
import React from "react";
import { Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const isProd = process.env.NEXT_PUBLIC_ENV === "PROD";

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    const isEmbedContext =
      window.location.pathname.includes("/embed") ||
      sessionStorage.getItem("embedUser") === "true" ||
      window.location.hostname.includes("embed");

    if (isEmbedContext) {
      router.replace("/session-expired");
    } else {
      router.replace(isProd ? "/login" : "/org");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="opacity-[0.03] absolute top-20 right-20 w-96 h-96 border-2 border-black rounded-full" />
        <div className="opacity-[0.03] absolute bottom-40 left-20 w-64 h-64 border-2 border-black rotate-[15deg]" />
        <div className="opacity-[0.03] absolute top-1/2 left-1/4 w-48 h-48" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}>
          <div className="w-full h-full border-2 border-black" />
        </div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-black text-[120px] md:text-[180px] leading-none tracking-tight font-mono font-light">
            404
          </h1>
        </div>

        <div className="mb-12">
          <h2 className="text-black text-2xl md:text-3xl mb-4 tracking-tight">Page Not Found</h2>
          <p className="text-black/60 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 bg-transparent text-black px-8 py-4 border border-black/20 hover:border-black hover:bg-black/5 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </button>
          <button
            onClick={handleTryAgain}
            className="group flex items-center gap-2 bg-black text-white px-8 py-4 hover:bg-black/90 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Try Again</span>
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-black/10">
          <p className="font-mono text-xs text-black/40 tracking-wider">ERROR_CODE: 404_PAGE_NOT_FOUND</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 font-mono text-sm text-black/30">
        gtwy<span className="animate-[blink_1s_infinite]">|</span>
      </div>
    </div>
  );
}
