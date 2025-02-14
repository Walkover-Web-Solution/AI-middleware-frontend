"use client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useLayoutEffect(() => {
    const proxyToken = localStorage.getItem("proxy_token");
    if (proxyToken) {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <header className="flex justify-between items-center px-3 md:px-28 py-8">
      <div className="flex space-x-12">
        <Link href="/">
          <div className="flex">
            <Image
              src="/ButtonMd.svg"
              alt="Background"
              className=""
              width={32}
              height={32}
            />
            <p className="font-medium cursor-pointer">GTWY AI</p>
          </div>
        </Link>
      </div>

      <div className="flex gap-4">
        {isLoggedIn ? (
          <Link href="/login">
            <button className="btn px-6 py-2 bg-transparent border border-white text-white rounded hover:text-black">
              Go to App
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="btn px-6 py-2 bg-transparent border border-white text-white rounded hover:text-black">
              Login
            </button>
          </Link>
        )}
        {!isLoggedIn && (
          <Link href="/login">
            <button role="button" className="btn btn-primary">
              Start for free
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
