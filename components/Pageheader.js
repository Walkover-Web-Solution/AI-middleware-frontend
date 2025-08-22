// PageHeader.js
import React from 'react';
import { ExternalLinkIcon } from './Icons';
import Protected from './protected';

/**
 * Reusable page header component
 * @param {string} title - The page title
 * @param {string} description - The page description
 * @returns {JSX.Element}
 */
const PageHeader = ({ title, description, docLink, isEmbedUser }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      {description && (
        <p className="text-base text-gray-700">
          {description}
          <a href={docLink}
            className="inline-flex mb-4 ml-2 items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors font-medium group"
            target={isEmbedUser ? "" : "_blank"}
            rel="noopener noreferrer">
            <span>Learn more</span>
            <ExternalLinkIcon size={16} />
          </a>
        </p>
      )}
    </div>
  );
};

export default Protected(PageHeader);