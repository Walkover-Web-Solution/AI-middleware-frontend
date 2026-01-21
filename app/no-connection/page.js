"use client";
import React, { useEffect } from "react";
import { Home, RefreshCw, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NoConnection() {
  const router = useRouter();
  const isProd = process.env.NEXT_PUBLIC_ENV === "PROD";

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.history.back();
    } else {
      window.location.reload();
    }
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-black rounded-full" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-black/60" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-black text-4xl mb-4 tracking-tight" style={{ fontWeight: 300 }}>
            No Connection
          </h1>
          <p className="text-black/50 leading-relaxed">
            Please check your internet connection and try again.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 hover:bg-black/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            <span className="font-medium">Retry</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 bg-transparent text-black px-8 py-3 border border-black/20 hover:border-black/40 transition-colors"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            <span className="font-medium">Go Home</span>
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-sm text-black/20">
        gtwy
      </div>
    </div>
  );
}
