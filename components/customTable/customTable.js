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
    endComponent = null
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
                if (activeColumn === 'totaltoken') {
                    // Sort by totaltoken in ascending order
                    return ascending ? a.totaltoken - b.totaltoken : b.totaltoken - a.totaltoken;
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
        setSelectedRows(!selectAll ? sortedData.map((item) => item.id) : []);
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

    // Helper function to render cell content with special handling for averageResponseTime
    const renderCellContent = (row, column) => {
        // Special handling for averageResponseTime column
        if (column === 'averageResponseTime') {
            if (row[column] === 0) {
                return "Not used in 24h";
            }
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

    return (
        <div className="overflow-x-auto m-2">
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
                            <tr key={row.id || row?._id || index} className="border-b hover:bg-gray-100 transition-colors cursor-pointer relative group" onClick={() =>
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
                                            checked={selectedRows.includes(row.id || row['_id'])}
                                            onChange={() => toggleSelectRow(row.id || row['_id'])}
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
    );
};

export default CustomTable;