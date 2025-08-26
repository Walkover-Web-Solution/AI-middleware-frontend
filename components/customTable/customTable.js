import { MoveDownIcon } from "@/components/Icons";
import React, { useState, useMemo } from "react";

const CustomTable = ({
    data = [],
    columnsToShow = [],
    sorting = false,
    sortingColumns = [],
    showRowSelection = false,
    keysToExtractOnRowClick = [],
    keysToWrap = [],
    handleRowClick = () => { },
    handleRowSelection = () => { },
    endComponent = null,
    viewMode = 'table'
}) => {
    const keys = useMemo(() => Object.keys(data[0] || {}), [data]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [activeColumn, setActiveColumn] = useState(null);
    const [ascending, setAscending] = useState(true);
    const [selectAll, setSelectAll] = useState(false);

    // Fallback to all keys if columnsToShow is empty
    const visibleColumns = columnsToShow.length > 0 ? columnsToShow : keys;

    // Determine columns allowed for sorting
    const sortableColumns = sortingColumns.length > 0 ? sortingColumns : visibleColumns;

    // Sort the data based on active column and direction
    const sortedData = useMemo(() => {
        if (sorting && activeColumn) {
            return [...data].sort((a, b) => {
                const valueA = activeColumn === 'name' ? a.actualName : a[activeColumn];
                const valueB = activeColumn === 'name' ? b.actualName : b[activeColumn];
                
                if (activeColumn === 'totalTokens') {
                    // Handle undefined or non-numeric values
                    const tokenA = typeof a.totalTokens === 'number' ? a.totalTokens : 0;
                    const tokenB = typeof b.totalTokens === 'number' ? b.totalTokens : 0;
                    return ascending ? tokenA - tokenB : tokenB - tokenA;
                }
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
                }
                
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return ascending ? valueA - valueB : valueB - valueA;
                }
                
                if (valueA === "-") return ascending ? -1 : 1;
                if (valueB === "-") return ascending ? 1 : -1;
                if (valueA < valueB) return ascending ? -1 : 1;
                if (valueA > valueB) return ascending ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [data, sorting, activeColumn, ascending]);

    const sortByColumn = (column) => {
        if (!sorting || !sortableColumns.includes(column)) return;

        if (activeColumn === column) {
            // Toggle sorting direction
            setAscending(!ascending);
        } else {
            // Set new sorting column
            setActiveColumn(column);
            setAscending(true);
        }
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        setSelectedRows(!selectAll ? sortedData.map((item) => getRowId(item)) : []);
    };

    const toggleSelectRow = (id) => {
        setSelectedRows((prevSelectedRows) => {
            const newSelectedRows = prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id];
            handleRowSelection(newSelectedRows);
            return newSelectedRows;
        });
    };

    // Helper function to get row identifier consistently
    const getRowId = (row) => {
        return row._id || row.id || null;
    };

    // Helper function to render cell content with special handling for averageResponseTime
    const renderCellContent = (row, column) => {
        // If the content is already a React element, return it directly
        if (React.isValidElement(row[column])) {
            return row[column];
        }
        
        // Special handling for averageResponseTime column
        if (column === 'averageResponseTime') {
            if (row[column] === 0) {
                return "Not used in 24h";
            }
            // Only format if it's a number
            if (typeof row[column] === 'number') {
                return `${row[column]} s`;
            }
            return row[column];
        }
        
        // Default handling for other columns
        if (row[column] === undefined) {
            return "not available";
        } else if (keysToWrap.includes(column) && row[column] && typeof row[column] === 'string') {
            return row[column].length > 30
                ? `${row[column].substring(0, 30)}...`
                : row[column];
        } else {
            return row[column] || String(row[column]) || "-";
        }
    };

    const handleCardClick = (row) => {
        handleRowClick(
            keysToExtractOnRowClick.reduce((acc, key) => {
                acc[key] = row[key];
                return acc;
            }, {})
        );
    };

    return (
        <div className="m-2">
            {viewMode === 'table' ? (
                // Desktop Table View
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gradient-to-r from-base-200 to-base-300 text-base-content">
                            <tr className="hover">
                                {showRowSelection &&
                                    <th className="py-4 px-3 h-full justify-center items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer"
                                            checked={selectAll}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                }
                                {visibleColumns.map((column) => (
                                    <th
                                        key={column}
                                        className="py-3 px-3 capitalize"
                                    >
                                        <div className="flex items-center">
                                            {sorting && sortableColumns.includes(column) && (
                                                <MoveDownIcon
                                                    className={`w-4 h-4 cursor-pointer ${activeColumn === column
                                                        ? "text-black"
                                                        : "text-[#BCBDBE] group-hover:text-black"
                                                        } ${ascending ? "rotate-180" : "rotate-0"}`}
                                                    onClick={() => sortByColumn(column)}
                                                />
                                            )}
                                            <span
                                                className="cursor-pointer pl-1"
                                                onClick={() => sortByColumn(column)}
                                            >
                                                {column}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                {endComponent && <th className="py-3 px-3"></th>}
                            </tr>
                        </thead>
                        <tbody className="">
                            {sortedData?.length > 0 ? (
                                sortedData?.map((row, index) => (
                                    <tr key={getRowId(row) || index} className="border-b hover:bg-gray-100 transition-colors cursor-pointer relative group" onClick={() =>
                                        handleRowClick(
                                            keysToExtractOnRowClick.reduce((acc, key) => {
                                                acc[key] = row[key];
                                                return acc;
                                            }, {})
                                        )
                                    }>
                                        {showRowSelection &&
                                            <td className="w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer"
                                                    checked={selectedRows.includes(getRowId(row))}
                                                    onChange={() => toggleSelectRow(getRowId(row))}
                                                />
                                            </td>
                                        }
                                        {visibleColumns?.map((column) => (
                                            <td
                                                key={column}
                                                className="py-3 px-4 table-cell w-60"
                                            >
                                                {renderCellContent(row, column)}
                                            </td>
                                        ))}
                                        {endComponent && (
                                            <td className="py-3 px-4 table-cell w-0">
                                                {endComponent({row: row})}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={visibleColumns.length + 1}
                                        className="py-4 text-center"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Card Grid View
                <div>
                    {/* Sorting Controls */}
                    {sorting && (
                        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                                {showRowSelection && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer mr-2"
                                            checked={selectAll}
                                            onChange={toggleSelectAll}
                                        />
                                        <span className="text-sm text-gray-600">Select All</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sortableColumns.map((column) => (
                                    <button
                                        key={column}
                                        onClick={() => sortByColumn(column)}
                                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                            activeColumn === column
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {column.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        {activeColumn === column && (
                                            <span className="ml-1">
                                                {ascending ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cards Grid */}
                    {sortedData?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sortedData.map((row, index) => (
                                <div
                                    key={getRowId(row) || index}
                                    className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative group h-full flex flex-col"
                                    onClick={() => handleCardClick(row)}
                                >
                                    {/* Card Header with Selection and Actions */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            {showRowSelection && (
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer"
                                                    checked={selectedRows.includes(getRowId(row))}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectRow(getRowId(row));
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {endComponent && (
                                            <div 
                                                className="flex items-center gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {endComponent({row: row})}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="space-y-3 flex-grow">
                                        {visibleColumns.map((column) => (
                                            <div key={column} className="flex flex-col">
                                                <div className="font-medium text-gray-700 capitalize mb-1 text-sm">
                                                    {column.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                                </div>
                                                <div className="text-gray-900 break-words">
                                                    {renderCellContent(row, column)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg p-8 text-center">
                            <p className="text-gray-500">No data available</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomTable;