import { getIconOfService } from '@/utils/utility';
import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { BRIDGE_TABLE_COMPONENT_COLUMNS } from '@/jsonFiles/bridgeParameter';

const TableViewComponent = ({ bridges, archiveBridge, onClickConfigure }) => {
    const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'

    const handleSort = () => {
        setSortOrder((prevOrder) => {
            if (prevOrder === 'asc') return 'desc';
            return 'asc';
        });
    };

    const sortedBridges = useMemo(() => {
        if (!sortOrder) return bridges;
        return [...bridges].sort((a, b) => {
            const nameA = a.name.toUpperCase(); 
            const nameB = b.name.toUpperCase(); 
            if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
            if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [bridges, sortOrder]);

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-base-200 to-base-300 text-base-content">
                        <tr>
                            {BRIDGE_TABLE_COMPONENT_COLUMNS.map((column, index) => (
                                <th
                                    key={index}
                                    className={column.className}
                                    onClick={column.sortable ? handleSort : undefined}
                                >
                                    <span>{column.name}</span>
                                    {column.sortable && (
                                        sortOrder === 'asc' ? (
                                            <ChevronUp className="w-4 h-4 ml-1" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        )
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {sortedBridges.map((bridge) => (
                            <tr
                                key={bridge._id}
                                className="border-b hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => onClickConfigure(bridge._id, bridge?.published_version_id || bridge?.versions?.[0])}
                            >
                                <td className="py-4 px-6 flex items-center gap-4">
                                    <div className="text-xl">
                                        {getIconOfService(bridge.service)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{bridge.name}</span>
                                        <span className="text-sm text-gray-500">{bridge.slugName}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 hidden md:table-cell">
                                    {bridge.configuration?.prompt ? (
                                        bridge.configuration.prompt.length > 30
                                            ? `${bridge.configuration.prompt.substring(0, 30)}...`
                                            : bridge.configuration.prompt
                                    ) : (
                                        <span className="text-gray-400">No prompt available</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 hidden sm:table-cell">
                                    {bridge.configuration?.model || 'N/A'}
                                </td>
                                <td className="py-4 px-6">
                                    <button
                                        className={`px-2 py-1 rounded-full text-base-100 text-sm opacity-70 ${
                                            bridge.status === 0
                                                ? 'bg-error text-base-100'
                                                : 'bg-success'
                                        } focus:outline-none transition-colors`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            archiveBridge(bridge._id, Number(!bridge.status));
                                        }}
                                    >
                                        {bridge.status === 0 ? 'Un-archive' : 'Archive'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableViewComponent;
