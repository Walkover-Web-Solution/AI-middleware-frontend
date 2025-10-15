const OrganizationSearch = ({ searchQuery, setSearchQuery }) => {
    return (
        <input
            type="text"
            placeholder="Search organizations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-base-300 input input-bordered outline-none p-4 rounded-md w-full mb-4"
        />
    );
};

export default OrganizationSearch;
