"use client";
import Image from "next/image";
import React from "react";

const ShowcaseCard = ({ img, heading, text }) => {
  return (
    <div>
      <div className="card bg-base-100 w-full h-[600px] shadow-xl p-4 bg-transparent text-white border-[0.1px] border-gray-500">
        <div className="h-[300px] border-[0.1px] bg-white">
          {/* image here */}
        </div>
        <div className="card-body">
          <div className="flex justify-between">
            <h2 className="card-title text-4xl">{heading}</h2>
            <Image src="/RightArrow.svg" width={20} height={20} alt="Right icon"/>
          </div>
          <p className="pt-10">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCard;
