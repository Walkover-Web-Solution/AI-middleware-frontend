import { useMemo } from 'react';

const OrganizationGrid = ({ displayedOrganizations, handleSwitchOrg }) => {
    const renderedOrganizations = useMemo(() => (
        displayedOrganizations.slice().reverse().map((org, index) => (
            <div
                key={index}
                onClick={() => handleSwitchOrg(org.id, org.name)}
                className="bg-base-300 shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
                <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{org.name}</div>
                </div>
            </div>
        ))
    ), [displayedOrganizations, handleSwitchOrg]);

    return (
        <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4 mb-8 cursor-pointer">
            {renderedOrganizations}
        </div>
    );
};

export default OrganizationGrid;
