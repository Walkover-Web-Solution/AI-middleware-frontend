import React from 'react';

function table({ data }) {
  if (!data || data.length === 0) {
    return <p>No data</p>;
  }

  // Extract column names from the first item's keys
  const columnNames = Object.keys(data[0]);
//   console.log(data[0])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columnNames.map((columnName, index) => (
              <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Beautify the column name */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              {columnNames.map((columnName) => (
                <td key={columnName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item[columnName]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default table;
