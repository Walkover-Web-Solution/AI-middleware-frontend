import React from "react";

const AutoScroll = ({ items = [] }) => {
  return (
    <div className="flex w-full overflow-hidden p-0">
      <div
        className="flex animate-scroll justify-center items-center"
        style={{ animationDuration: "30s" }}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="m-4 flex flex-col justify-center items-center text-center text-white px-5 py-2 rounded-md transition duration-500 hover:bg-zoom cursor-pointer text-xl"
          >
            <item.icon width="25px" height="25px" />
            <span className="mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoScroll;
