"use client";
import Image from "next/image";
import { useLayoutEffect, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getFromCookies } from "@/utils/utility";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    const proxyToken = getFromCookies("proxy_token");
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
    return `relative px-6 py-2 ${isActive
      ? "text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-base-100"
      : "text-white hover:text-white"
      } transition-all duration-300 ease-in-out`;
  };

  return (
    <header className={`fixed w-full top-0 z-low-medium transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-black/60' : ''
      }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-end px-4 md:px-8 py-4">
        <div className="flex items-center justify-center">
          <div className="md:hidden dropdown dropdown-start">
            <label tabIndex={0} className="btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-black/90 backdrop-blur-md rounded-box w-52">
              <li><a onClick={() => router.push("/")} className="text-white">Home</a></li>
              <li>
                <a onClick={() => router.push("/pricing")} className="text-white">
                  Pricing
                  {pathname !== '/pricing' && (
                    <span className="ml-2 text-white bg-gradient-to-r from-blue-400 to-blue-300 px-2 py-0.5 rounded-full text-xs">
                      Free
                    </span>
                  )}
                </a>
              </li>
              <li><a onClick={() => router.push("/showcase")} className="text-white">Show case</a></li>
              <li><a onClick={() => router.push("/faq")} className="text-white">FAQ</a></li>
              <li><a onClick={() => window.open("https://blog.gtwy.ai/", "_blank")} className="text-white">Blog</a></li>
            </ul>
          </div>
          <div onClick={() => router.push("/")} className="flex items-center justify-center cursor-pointer">
            <Image
              src="/favicon.png"
              alt="GTWY AI Logo"
              width={20}
              height={20}
            />
            <span className="font-semibold text-xl ml-2 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              GTWY AI
            </span>
          </div>
        </div>

        <div className="flex items-end">
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-0 lg:space-x-8">
            <button onClick={() => router.push("/")} className={getButtonClass("/")}>Home</button>
            <button
              onClick={() => router.push("/pricing")}
              className="relative flex flex-col items-end"
            >
              {pathname !== '/pricing' && (
                <div
                  className="absolute left-16 text-white bg-gradient-to-r from-blue-400 to-blue-300 px-3 py-0.5 rounded-full font-semibold transform rotate-12"
                  style={{ fontSize: "0.75rem" }}
                >
                  Free
                </div>
              )}
              <span className={getButtonClass("/pricing")}>Pricing</span>
            </button>
            <button onClick={() => router.push("/showcase")} className={getButtonClass("/showcase")}>Show case</button>
            <button onClick={() => router.push("/faq")} className={getButtonClass("/faq")}>FAQ</button>
            <button onClick={() => window.open("https://blog.gtwy.ai/", "_blank")} className={getButtonClass("/faq")}>Blog</button>
          </nav>

        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <button
              onClick={() => router.push("/login")}
              className="btn btn-primary btn-sm"
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
                className="btn btn-primary "
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
