import React from "react";
import Image from "next/image";
import { FEATURE_DATA } from "@/utils/enums";

const Feature = () => {
  return (
    <div className="flex flex-col gap-4 w-3/4 mx-auto mt-20 z-10">
      {Array.from(
        { length: Math.ceil(FEATURE_DATA.length / 2) },
        (_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-col md:flex-row items-stretch justify-between gap-4"
          >
            {displayFeatures
              .slice(rowIndex * 2, rowIndex * 2 + 2)
              .map((feature, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:z-0 hover:bg-zoom"
                >
                  <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
                    <Image
                      src={feature.icon}
                      alt="Feature Icon"
                      className="mr-2"
                      width={54}
                      height={34}
                    />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
                    {feature.title}
                  </h1>
                  <h2 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
                    {feature.subtitle}
                  </h2>
                  <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
                    {feature.description}
                  </p>
                  <div className="flex justify-center mt-auto">
                    <Image
                      src={feature.image}
                      alt="Feature Image"
                      width={420}
                      height={530}
                    />
                  </div>
                </div>
              ))}
          </div>
        )
      )}
    </div>
  );
};

export default Feature;
