import React from 'react';

const GenericTable = ({ headers, data }) => {
  return (
    <div className="relative rounded-xl overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-100 dark:text-gray-100">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
