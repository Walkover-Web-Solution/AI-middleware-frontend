import { MoveDown } from "lucide-react";
import React, { useState, useMemo } from "react";

const TableReact = ({
    data = [],
    columnsToShow = [],
    sorting = false,
    sortingColumns = [],
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
                const valueA = a[activeColumn];
                const valueB = b[activeColumn];

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
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    return (
        <div className="min-h-screen h-full bg-white flex flex-col items-center py-4 sm:py-10 gap-12">
            <div className="w-full px-2">
                <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none mt-2">
                    <table className="table-auto w-full text-left font-inter border-separate border-spacing-y-0 border">
                        <thead className="bg-[#222E3A]/[6%] text-base text-white font-semibold w-full">
                            <tr>
                                <th className="py-4 h-full flex justify-center items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                {visibleColumns.map((column) => (
                                    <th
                                        key={column}
                                        className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group"
                                    >
                                        <div className="flex items-center">
                                            {sorting && sortableColumns.includes(column) && (
                                                <MoveDown
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
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.length > 0 ? (
                                sortedData.map((row, index) => (
                                    <tr key={row.id || index}>
                                        <td className="py-2 px-3 text-base font-normal flex items-center justify-center h-full border-t">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 cursor-pointer"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => toggleSelectRow(row.id)}
                                            />
                                        </td>
                                        {visibleColumns.map((column) => (
                                            <td
                                                key={column}
                                                className="py-2 px-3 font-normal text-base border-t whitespace-nowrap"
                                            >
                                                {row[column] || "-"}
                                            </td>
                                        ))}
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
            </div>
        </div>
    );
};

export default TableReact;
