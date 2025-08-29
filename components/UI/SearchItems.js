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
  }, [data, searchTerm, setFilterItems]);
  return (
    <div className="flex-1 max-w-md">
      <input
        type="text"
        placeholder={`Search ${item}...`}
        className={`${style?  style:'input input-bor0dered w-full ml-3 mb-3'}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}

export default SearchItems
