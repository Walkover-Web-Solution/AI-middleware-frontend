import React, { useEffect, useMemo, useState } from 'react'

const SearchItems = ({ data, setFilterItems }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = data?.filter(item =>
      (item?.name && item?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
      (item?.slugName && item?.slugName?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
      (item?.service && item?.service?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
      (item?._id && item?._id?.toLowerCase()?.includes(searchTerm.toLowerCase()))
    ) || [];
    setFilterItems(filtered);
  }, [data, searchTerm, setFilterItems]);
  return (
    <div className="flex-1 max-w-md">
      <input
        type="text"
        placeholder="Search API keys..."
        className="input input-bordered w-full ml-3 mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}

export default SearchItems
