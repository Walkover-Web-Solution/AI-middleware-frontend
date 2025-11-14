import { useMemo, useState } from 'react';
import { formatDate, formatRelativeTime } from '@/utils/utility';

const OrganizationGrid = ({ displayedOrganizations = [], handleSwitchOrg, currentUserId }) => {
    const [loadingOrgId, setLoadingOrgId] = useState(null);
    const formattedOrganizations = useMemo(() => {
        return displayedOrganizations
            .slice()
            .reverse()
            .map((org) => ({
                id: org?.id,
                name: org?.name || 'Unnamed Workspace',
                createdAt: formatRelativeTime(org?.created_at),
                createdAtRaw: formatDate(org?.created_at),
                role: org?.created_by === currentUserId ? 'Owner' : 'Member',
            }));
    }, [displayedOrganizations, currentUserId]);

    const handleOrgClick = async (orgId, orgName) => {
        if (!orgId) return;
        
        setLoadingOrgId(orgId);
        try {
            await handleSwitchOrg(orgId, orgName);
        } catch (error) {
            console.error('Error switching organization:', error);
        }
    };

    return (
        <div className="mb-8">
            <div className="overflow-x-auto rounded-lg shadow-lg border border-base-300 bg-base-100">
                <table className="table  bg-base-100 shadow-md overflow-visible relative z-50 border-collapse">
                    <thead className="bg-gradient-to-r from-base-200 to-base-300 text-base-content">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs uppercase tracking-wide text-base-content">
                                Workspace
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs uppercase tracking-wide text-base-content">
                                Created At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs uppercase tracking-wide text-base-content">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-base-200">
                        {formattedOrganizations.length ? (
                            formattedOrganizations.map((org, index) => {
                                const isLoading = loadingOrgId === org.id;
                                return (
                                    <tr
                                        key={org.id ?? index}
                                        onClick={() => handleOrgClick(org.id, org.name)}
                                        className={`cursor-pointer transition-colors hover:bg-base-200 group ${
                                            isLoading ? 'opacity-60 cursor-wait' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {isLoading && (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                )}
                                                <span className="font-medium text-base-content">{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base-content" title={org.createdAtRaw}>
                                            <div className="w-40">
                                                <span className="group-hover:hidden block">{org.createdAt}</span>
                                                <span className="hidden group-hover:block">{org.createdAtRaw}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base-content">
                                            {org.role}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-base-content">
                                    No workspaces found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrganizationGrid;
