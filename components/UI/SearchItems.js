import React, { useEffect, useMemo, useState } from 'react'

const SearchItems = ({ data, setFilterItems ,item, style='' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = data?.filter(item =>
      (item?.name && item?.name?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?.slugName && item?.slugName?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?.service && item?.service?.toLowerCase()?.includes(searchTerm.toLowerCase().trim())) ||
      (item?._id && item?._id?.toLowerCase()?.includes(searchTerm.toLowerCase().trim()))
    ) || [];
    setFilterItems(filtered);
  }, [data, searchTerm]);
  return (
    <div className="flex-1 max-w-md">
      <input
        type="text"
        aria-label={`Search ${item} by Name, SlugName, Service, or ID`}
        placeholder={
          item === 'Agents' ? 'Search Agents by Name, SlugName, Service or Id' :
          item === 'Apikeys' ? 'Search Apikeys by Name, Id or Service' :
          `Search ${item} by Name`
        }
        className={`${style ? style : 'input  w-full ml-2 mb-1 border border-base-content/50'}`}
        
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}

export default SearchItems
