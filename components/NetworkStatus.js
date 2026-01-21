"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NetworkStatus() {
  const router = useRouter();

  useEffect(() => {
    const handleOffline = () => {
      router.push('/no-connection');
    };

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
