import React from 'react';

const Tooltip = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-[22rem] p-2 bg-gray-500 text-white text-sm rounded-lg shadow-lg">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
