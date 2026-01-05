import { MoveDownIcon, ChevronRightIcon } from "@/components/Icons"; // Corrected import to ChevronRightIcon
import React, { useState, useMemo, useEffect } from "react";

const CustomTable = ({
    data = [],
    columns = [], // New generic columns prop: [{ key, title, render, sortable, width }]
    columnsToShow = [], // Legacy support
    sorting = false,
    sortingColumns = [],
    showRowSelection = false,
    keysToExtractOnRowClick = [],
    keysToWrap = [],
    handleRowClick = () => { },
    handleRowSelection = () => { },
    endComponent = null, // Legacy actions
    customGetColumnLabel = null, // Legacy label
    customRenderUsageCell = null, // Legacy usage render

    // New Props for Expansion
    expandable = false,
    renderExpandedRow = null, // (row) => ReactNode
    expandedRowIds = [], // Controlled expansion: array of IDs
    onRowExpand = null, // (rowId, isExpanded) => void
    defaultExpandedRowIds = [], // Uncontrolled expansion initial state
}) => {
    // Standardize columns from legacy props if 'columns' prop is not provided
    const normalizedColumns = useMemo(() => {
        if (columns && columns.length > 0) return columns;

        // Fallback to legacy props
        const keys = columnsToShow.length > 0 ? columnsToShow : (data.length > 0 ? Object.keys(data[0]) : []);
        return keys.map(key => ({
            key,
            title: customGetColumnLabel ? customGetColumnLabel(key) : key.replace(/_/g, ' '),
            sortable: sortingColumns.length > 0 ? sortingColumns.includes(key) : true,
            // Legacy render logic embedded in renderRow
        }));
    }, [columns, columnsToShow, data, customGetColumnLabel, sortingColumns]);

    const [internalSelectedRows, setInternalSelectedRows] = useState([]);
    const [internalExpandedRows, setInternalExpandedRows] = useState(
        defaultExpandedRowIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
    );
    const [activeColumn, setActiveColumn] = useState(null);
    const [ascending, setAscending] = useState(true);
    const [selectAll, setSelectAll] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const isControlledExpansion = !!onRowExpand;
    const currentExpandedRows = isControlledExpansion
        ? expandedRowIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
        : internalExpandedRows;

    const toggleRowExpansion = (rowId, e) => {
        e?.stopPropagation();
        const isExpanded = !!currentExpandedRows[rowId];

        if (isControlledExpansion) {
            onRowExpand(rowId, !isExpanded);
        } else {
            setInternalExpandedRows(prev => ({
                ...prev,
                [rowId]: !isExpanded
            }));
        }
    };

    // Check screen width
    useEffect(() => {
        const handleResize = () => {
            // Access window only on client side
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                setIsSmallScreen(width < 768);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sort the data
    const sortedData = useMemo(() => {
        if (!sorting || !activeColumn) return data;

        return [...data].sort((a, b) => {
            // Find column definition to check for custom sorter
            const colDef = normalizedColumns.find(c => c.key === activeColumn);
            if (colDef?.sorter) {
                const res = colDef.sorter(a, b);
                return ascending ? res : -res;
            }

            // Legacy/Default Sorting Logic
            let valueA = a[activeColumn];
            let valueB = b[activeColumn];

            // Handle specific legacy cases if not using custom columns with sorters
            if (activeColumn === 'name') {
                valueA = a.actualName || a.name;
                valueB = b.actualName || b.name;
            }

            // Handle usage and cost columns that might have complex data
            if (activeColumn === 'totalTokens') {
                // Extract numeric value from formatted strings or use raw value
                const extractNumeric = (val) => {
                    if (typeof val === 'string') {
                        if (val === 'Loading...' || val === '-') return 0;
                        return parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
                    }
                    return parseFloat(val) || 0;
                };
                valueA = extractNumeric(valueA);
                valueB = extractNumeric(valueB);
            }

            if (activeColumn === 'cost' || activeColumn === 'agent_usage' || activeColumn === 'agent_limit') {
                // Extract numeric value from cost strings like "$0.0012" or "0.0012"
                const extractCost = (val) => {
                    if (typeof val === 'string') {
                        if (val === 'Loading...' || val === '-') return 0;
                        return parseFloat(val.replace(/[$,]/g, '')) || 0;
                    }
                    return parseFloat(val) || 0;
                };
                valueA = extractCost(valueA);
                valueB = extractCost(valueB);
            }

            // Handle created_by and updated_by columns that have original values
            if (activeColumn === 'created_by' || activeColumn === 'updated_by') {
                valueA = a[`${activeColumn}_original`] || '';
                valueB = b[`${activeColumn}_original`] || '';
            }

            // Handle averageResponseTime column
            if (activeColumn === 'averageResponseTime') {
                const extractResponseTime = (val) => {
                    if (typeof val === 'string') {
                        if (val.includes('Not used')) return 0;
                        const match = val.match(/([0-9.]+)/);
                        return match ? parseFloat(match[1]) : 0;
                    }
                    if (typeof val === 'object' && val?.props?.children) {
                        // Handle React component with text content
                        const text = val.props.children;
                        if (typeof text === 'string') {
                            if (text.includes('Not used')) return 0;
                            const match = text.match(/([0-9.]+)/);
                            return match ? parseFloat(match[1]) : 0;
                        }
                    }
                    return parseFloat(val) || 0;
                };
                valueA = extractResponseTime(valueA);
                valueB = extractResponseTime(valueB);
            }

            // Handle React components or objects by extracting text content
            if (typeof valueA === 'object' && valueA !== null && !Array.isArray(valueA)) {
                // Try to extract text content from React components
                if (valueA.props && valueA.props.children) {
                    valueA = typeof valueA.props.children === 'string' ? valueA.props.children : '';
                } else {
                    valueA = '';
                }
            }
            if (typeof valueB === 'object' && valueB !== null && !Array.isArray(valueB)) {
                // Try to extract text content from React components
                if (valueB.props && valueB.props.children) {
                    valueB = typeof valueB.props.children === 'string' ? valueB.props.children : '';
                } else {
                    valueB = '';
                }
            }

            // Handle usage column (which is used as a key for combined usage display)
            if (activeColumn === 'usage') {
                // Sort by cost value since usage is a combined display
                const getCostValue = (row) => {
                    const cost = row.cost;
                    if (typeof cost === 'string') {
                        if (cost === 'Loading...' || cost === '-') return 0;
                        return parseFloat(cost.replace(/[$,]/g, '')) || 0;
                    }
                    return parseFloat(cost) || 0;
                };
                const costA = getCostValue(a);
                const costB = getCostValue(b);
                return ascending ? costA - costB : costB - costA;
            }

            // Date handling
            if (['last_used', 'created_at', 'createdAt', 'updated_at', 'updatedAt'].includes(activeColumn)) {
                const getDate = (row) => {
                    // Try multiple field variations to handle typos and different naming conventions
                    return row[`${activeColumn}_original`] || 
                           row[`${activeColumn}_orignal`] || 
                           row[activeColumn];
                };
                const dateA = new Date(getDate(a) || 0);
                const dateB = new Date(getDate(b) || 0);
                return ascending ? dateA - dateB : dateB - dateA;
            }

            // String comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }

            // Number comparison
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return ascending ? valueA - valueB : valueB - valueA;
            }

            // Null/Undefined handling
            if (!valueA && valueA !== 0) return 1;
            if (!valueB && valueB !== 0) return -1;

            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    }, [data, sorting, activeColumn, ascending, normalizedColumns]);

    const sortByColumn = (columnKey) => {
        if (!sorting) return;
        const colDef = normalizedColumns.find(c => c.key === columnKey);
        if (colDef && colDef.sortable === false) return; // Explicitly not sortable
        // Legacy check
        if (!colDef && sortingColumns.length > 0 && !sortingColumns.includes(columnKey)) return;

        if (activeColumn === columnKey) {
            setAscending(!ascending);
        } else {
            setActiveColumn(columnKey);
            setAscending(true);
        }
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        const ids = !selectAll ? sortedData.map(item => item.id || item._id) : [];
        setInternalSelectedRows(ids);
        if (handleRowSelection) handleRowSelection(ids);
    };

    const toggleSelectRow = (id) => {
        const newSelection = internalSelectedRows.includes(id)
            ? internalSelectedRows.filter(rowId => rowId !== id)
            : [...internalSelectedRows, id];
        setInternalSelectedRows(newSelection);
        if (handleRowSelection) handleRowSelection(newSelection);
    };

    const getDisplayValue = (row, colDef) => {
        // If colDef has a render function, use it
        if (colDef.render) {
            return colDef.render(row);
        }

        // Legacy special handling fallback
        if (colDef.key === 'usage' && customRenderUsageCell) {
            return customRenderUsageCell(row);
        }

        const val = row[colDef.key];
        if (val === undefined || val === null) return "-";

        // Wrap long text
        if (keysToWrap.includes(colDef.key) && typeof val === 'string' && val.length > 30) {
            return `${val.substring(0, 30)}...`;
        }

        return val;
    };

    const renderTableView = () => {
        return (
            <div className="overflow-x-auto relative z-30 w-full mb-6">
                <table className="table table-sm bg-base-100 shadow-md w-auto border-collapse" style={{ tableLayout: 'auto' }}>
                    <thead className="bg-gradient-to-r from-base-200 to-base-300 text-base-content">
                        <tr className="hover">
                            {/* Checkbox Column */}
                            {showRowSelection && (
                                <th className="px-4 py-2 w-10">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 cursor-pointer"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                            )}

                            {/* Expand Column */}
                            {expandable && (
                                <th className="px-2 py-2 w-10"></th>
                            )}

                            {/* Data Columns */}
                            {normalizedColumns.map((col) => {
                                const isSortable = sorting && col.sortable !== false;
                                return (
                                    <th
                                        key={col.key}
                                        className={`px-3 py-2 text-left whitespace-nowrap capitalize ${col.width || ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`select-none ${isSortable ? 'cursor-pointer hover:text-primary' : ''}`}
                                                onClick={() => isSortable && sortByColumn(col.key)}
                                            >
                                                {col.title}
                                            </span>
                                            {isSortable && activeColumn === col.key && (
                                                <MoveDownIcon
                                                    className={`w-4 h-4 transition-transform ${ascending ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}

                            {/* Legacy End Component / Actions */}
                            {endComponent && (
                                <th className="px-4 py-2 text-center">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, index) => {
                                const id = row.id || row._id || row.collection_id || index;
                                const isExpanded = !!currentExpandedRows[id];
                                return (
                                    <React.Fragment key={id}>
                                        <tr
                                            className={`border-b border-base-300 hover:bg-base-200/60 transition-colors cursor-pointer ${row.isLoading ? 'opacity-60 cursor-wait' : ''
                                                }`}
                                            onClick={(e) => {
                                                if (expandable && !e.target.closest('button') && !e.target.closest('input')) {
                                                    // Optional: Click row to expand? 
                                                    // toggleRowExpansion(id, e);
                                                }
                                                handleRowClick && handleRowClick(row);
                                            }}
                                        >
                                            {/* Selection Checkbox */}
                                            {showRowSelection && (
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 cursor-pointer"
                                                        checked={internalSelectedRows.includes(id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleSelectRow(id);
                                                        }}
                                                    />
                                                </td>
                                            )}

                                            {/* Expand Button */}
                                            {expandable && (
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        className="btn btn-ghost btn-xs p-0 w-6 h-6 min-h-0"
                                                        onClick={(e) => toggleRowExpansion(id, e)}
                                                    >
                                                        <ChevronRightIcon
                                                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                        />
                                                    </button>
                                                </td>
                                            )}

                                            {/* Data Cells */}
                                            {normalizedColumns.map((col) => (
                                                <td key={col.key} className="px-3 py-2 text-left">
                                                    {getDisplayValue(row, col)}
                                                </td>
                                            ))}

                                            {/* Actions */}
                                            {endComponent && (
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center">
                                                        {endComponent({ row })}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>

                                        {/* Expanded Row Content */}
                                        {expandable && isExpanded && (
                                            <tr className="bg-base-200/30 border-b border-base-300">
                                                <td
                                                    colSpan={normalizedColumns.length + (showRowSelection ? 1 : 0) + (expandable ? 1 : 0) + (endComponent ? 1 : 0)}
                                                    className="px-6 py-4 cursor-default"
                                                >
                                                    {renderExpandedRow ? renderExpandedRow(row) : null}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={normalizedColumns.length + (showRowSelection ? 1 : 0) + (expandable ? 1 : 0) + (endComponent ? 1 : 0)}
                                    className="px-4 py-8 text-center text-gray-500"
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

    // Card View for Mobile (simplified for now, can be expanded to use generic columns)
    const renderCardView = () => (
        <div className="grid grid-cols-1 gap-4">
            {sortedData.map((row, index) => {
                const id = row.id || row._id || row.collection_id || index;
                return (
                    <div key={id} className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                            {showRowSelection && (
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={internalSelectedRows.includes(id)}
                                    onChange={() => toggleSelectRow(id)}
                                />
                            )}
                            {/* Primary Identifier (usually first column) */}
                            <div className="font-bold">{getDisplayValue(row, normalizedColumns[0])}</div>
                        </div>

                        {/* Body */}
                        <div className="space-y-2 text-sm">
                            {normalizedColumns.slice(1).map(col => (
                                <div key={col.key} className="flex justify-between">
                                    <span className="text-gray-500">{col.title}:</span>
                                    <span>{getDisplayValue(row, col)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        {endComponent && (
                            <div className="mt-4 pt-2 border-t border-base-200 flex justify-end">
                                {endComponent({ row })}
                            </div>
                        )}

                        {/* Expansion in Card View */}
                        {expandable && (
                            <div className="mt-2 text-center">
                                <button
                                    className="btn btn-ghost btn-xs w-full"
                                    onClick={(e) => toggleRowExpansion(id, e)}
                                >
                                    {currentExpandedRows[id] ? "Hide Details" : "Show Details"}
                                </button>
                                {currentExpandedRows[id] && (
                                    <div className="mt-2 pt-2 text-left border-t border-base-200">
                                        {renderExpandedRow ? renderExpandedRow(row) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="w-full">
            {isSmallScreen ? renderCardView() : renderTableView()}
        </div>
    );
};

export default CustomTable;
