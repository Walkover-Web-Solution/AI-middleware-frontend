"use client";
import Image from "next/image";
import React from "react";

const ShowcaseCard = ({ img, heading, text, url }) => {
  return (
    <div className="group cursor-pointer">
      <div className="card bg-base-100 w-full h-[700px] shadow-xl p-4 bg-transparent text-white border-[0.1px] border-gray-500 transition-all duration-300 hover:border-primary">
        {/* Increased height to 400px */}
        <div className="h-[400px] border-[0.1px] bg-white overflow-hidden rounded-lg flex items-center justify-center">
          {img && (
            <Image
              src={img}
              alt={heading}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {heading}
            </h2>
            <Image
              src="/RightArrow.svg"
              width={20}
              height={20}
              alt="Right icon"
              className="transition-transform duration-300 group-hover:translate-x-2 cursor-pointer"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            />
          </div>
          <p className="pt-6 text-lg text-gray-300 leading-relaxed">{text}</p>
          {url && (
            <div className="card-actions justify-end mt-4">
              <a
                href={url}
                className="btn bg-primary text-white hover:bg-primary hover:text-white border-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCard;
