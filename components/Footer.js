"use client"
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://flow.sokt.io/func/scri4pu3FJQc", { email });
      console.log(response.data);
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-4/5 px-4  mx-auto mt-20 pb-10">
      <div className="border-b-2 pb-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Join our newsletter</h1>
          <h5 className="text-sm text-gray-600">
            Keep up to date with everything Reflect
          </h5>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter your Email"
            className="input input-bordered w-full max-w-xs text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            role="button"
            className="btn btn-primary"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex gap-6">
          <Link href="/privacy">
            <h6 className="hover:text-blue-500 cursor-pointer">Privacy Policy</h6>
          </Link>
          <h6>-</h6>
          <Link href="/terms">
            <h6 className="hover:text-blue-500 cursor-pointer">
              Terms of Conditions
            </h6>
          </Link>
        </div>
        <div className="text-sm">All rights reserved</div>

      </div>
    </div>
  );
};

export default Footer;
