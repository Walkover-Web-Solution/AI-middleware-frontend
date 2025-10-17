import SearchItems from "../UI/SearchItems";

const OrganizationSearch = ({ organizationsArray, setDisplayedOrganizations }) => {
    return (
        <>
        {organizationsArray?.length > 5 && (
            <SearchItems
              data={organizationsArray}
              setFilterItems={setDisplayedOrganizations}
              item="Organizations"
              style="border border-base-300 input input-bordered outline-none  rounded-md w-full pr-10"
            />
            
          )}</>
    );
};

export default OrganizationSearch;
