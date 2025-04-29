// PageHeader.js
import React from 'react';

/**
 * Reusable page header component
 * @param {string} title - The page title
 * @param {string} description - The page description
 * @returns {JSX.Element}
 */
const PageHeader = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      {description && (
        <p className="text-base text-gray-700">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;