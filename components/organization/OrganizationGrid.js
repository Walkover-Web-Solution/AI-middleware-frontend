import { useMemo } from 'react';
import { formatRelativeTime } from '@/utils/utility';

const OrganizationGrid = ({ displayedOrganizations = [], handleSwitchOrg, currentUserId }) => {
    const formattedOrganizations = useMemo(() => {
        return displayedOrganizations
            .slice()
            .reverse()
            .map((org) => ({
                id: org?.id,
                name: org?.name || 'Unnamed Workspace',
                createdAt: formatRelativeTime(org?.created_at),
                createdAtRaw: org?.created_at,
                role: org?.created_by === currentUserId ? 'Owner' : 'Member',
            }));
    }, [displayedOrganizations, currentUserId]);

    return (
        <div className="mb-8">
            <div className="overflow-x-auto rounded-lg shadow-lg border border-base-300 bg-base-100">
                <table className="min-w-full divide-y divide-base-300">
                    <thead className="bg-base-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-base-content/70">
                                Workspace
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-base-content/70">
                                Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-base-content/70">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-base-200">
                        {formattedOrganizations.length ? (
                            formattedOrganizations.map((org, index) => (
                                <tr
                                    key={org.id ?? index}
                                    onClick={() => org.id && handleSwitchOrg(org.id, org.name)}
                                    className="cursor-pointer transition-colors hover:bg-base-200"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-base-content">{org.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base-content/70" title={org.createdAtRaw}>
                                        {org.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base-content/70">
                                        {org.role}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-base-content/60">
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
