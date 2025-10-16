import React, { useEffect, useMemo, useState } from 'react'
import { InfoIcon } from '../Icons';
import InfoTooltip from '../InfoTooltip';

const SearchItems = ({ data, setFilterItems ,item, style='' }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
      return 'Search ApiKeys by Name, or Service';
    } else if (item === 'Organizations') {
      return 'Search Organizations by Name or ID';
    } else {
      return `Search ${item} by Name`;
    }
  };

  return (
    <div className={`flex-1 ${item !== 'Organizations' ? 'max-w-md' : ''} ml-2`}>
      <div className="relative">
        <input
          type="text"
          aria-label={`Search ${item} by Name, SlugName, Service, or ID`}
          placeholder="Search..."
          className={`${style ? style : 'input w-full mb-1 border border-base-content/50 pr-10'}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <InfoTooltip tooltipContent={getTooltipContent()}>
            <InfoIcon className='w-4 h-4 cursor-help text-base-content/60 hover:text-base-content' />
          </InfoTooltip>
        </div>
      </div>
    </div>
  )
}

export default SearchItems
