"use client";
import Image from "next/image";
import { useLayoutEffect, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    const proxyToken = localStorage.getItem("proxy_token");
    if (proxyToken) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getButtonClass = (path) => {
    const isActive = pathname === path;
    return `relative px-6 py-2 ${
      isActive
        ? "text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400"
        : "text-white hover:text-blue-400"
    } transition-all duration-300 ease-in-out`;
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'backdrop-blur-md bg-black/30' : ''
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-6">
        <div onClick={() => router.push("/")} className="flex items-center space-x-3 cursor-pointer">
          <Image
            src="/ButtonMd.svg"
            alt="GTWY AI Logo"
            width={40}
            height={40}
          />
          <span className="font-semibold text-xl bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            GTWY AI
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => router.push("/")} className={getButtonClass("/")}>Home</button>
          <button onClick={() => router.push("/pricing")} className={getButtonClass("/pricing")}>Pricing</button>
          <button onClick={() => router.push("/faq")} className={getButtonClass("/faq")}>FAQ</button>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <button 
              onClick={() => router.push("/login")}
              className="btn btn-primary"
            >
              Go to App
            </button>
          ) : (
            <>
              <button 
                onClick={() => router.push("/login")}
                className="btn px-6 py-2 bg-transparent border border-white text-white rounded hover:text-black"
              >
                Login
              </button>
              <button 
                onClick={() => router.push("/login")}
                role="button" 
                className="btn btn-primary"
              >
                Start for free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
