import React, { useEffect, useMemo, useState } from 'react'
import { InfoIcon } from '../Icons';
import InfoTooltip from '../InfoTooltip';

const SearchItems = ({ data, setFilterItems ,item, style='' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detect platform for keyboard shortcut display
  const isMac = useMemo(() => {
    if (typeof window !== 'undefined') {
      return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }
    return false;
  }, []);
  
  const shortcutText = isMac ? '⌘K' : 'Ctrl+K';
  
  // Function to open command palette (only for non-Organizations)
  const openCommandPalette = () => {
    if (item === 'Organizations') return; // Don't open command palette for Organizations
    
    // Dispatch a custom event to trigger the command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true, // Cmd on Mac
      ctrlKey: true, // Ctrl on Windows/Linux
      bubbles: true
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const filtered = data?.filter(item =>
      (item?.name && item?.name?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?.slugName && item?.slugName?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?.service && item?.service?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?._id && item?._id?.toLowerCase()?.includes(searchTerm.toLowerCase().trim()))||
      (item?.flow_name && item?.flow_name?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?.id && item?.id?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase().trim()))
    ) || [];
    setFilterItems(filtered);
  }, [data, searchTerm]);
  // Generate tooltip content based on item type
  const getTooltipContent = () => {
    if (item === 'Agents') {
      return 'Search Agents by Name, SlugName, Service, or ID';
    } else if (item === 'ApiKeys') {
      return 'Search API Keys by Name or Service';
    } else if (item === 'Organizations') {
      return 'Search Organizations by Name or ID';
    } else {
      return `Search ${item} by Name`;
    }
  };

  return (
    <div className={`${item === 'Organizations' ? 'w-full' : 'max-w-xs'} ml-2`}>
      <div className="relative">
        <input
          type="text"
          aria-label={`Search ${item} by Name, SlugName, Service, or ID`}
          placeholder="Search"
          value={searchTerm}
          className={`${style ? style : 'input input-sm w-full border bg-white dark:bg-base-200 border-base-content/50 pr-16'}`}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={item !== 'Organizations' ? openCommandPalette : undefined}
          readOnly={item !== 'Organizations'}
        />
        {item !== 'Organizations' && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <kbd className={`kbd kbd-xs bg-base-200 text-base-content/70 border border-base-content/20 ${isMac ? 'px-1.5' : 'px-1'}`}>
              {shortcutText}
            </kbd>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchItems
