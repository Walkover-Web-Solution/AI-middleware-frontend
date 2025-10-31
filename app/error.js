"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();
  const isProd = process.env.NEXT_PUBLIC_ENV === 'PROD';


  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.replace(isProd ? "/login" : "/org");
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Something went wrong</h1>
              <span className="badge badge-error text-white">Error</span>
            </div>
            <p className="text-sm opacity-80">An unexpected error occurred while rendering this page.</p>

            <div className="mt-3">
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">Show details</div>
                <div className="collapse-content">
                  <pre className="p-3 bg-base-300 rounded text-xs overflow-auto max-h-[50vh] whitespace-pre-wrap">
                    {String(error?.stack || error?.message || error)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-sm  btn-primary" onClick={handleTryAgain}>Try again</button>
              <button className="btn btn-sm" onClick={handleGoHome}>Go Home</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
