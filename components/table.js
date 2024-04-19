import React from 'react';

function Table({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center my-5 text-lg font-semibold text-gray-600">No data available.</div>;
  }

  const columnNames = Object.keys(data[0]);

  // Function to format the date
  const formatDate = (dateString) => {
    if (isNaN(Date.parse(dateString))) {
      return dateString; // Return original string if it's not a valid date
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata' // Explicitly set the timezone to IST
    }).format(date);
  };

  return (
    
      <table className="table">
        <thead>
          <tr>
            {columnNames.map((columnName, index) => (
              <th key={index} scope="col" className="py-3 px-6 text-gray-900 font-semibold">
                {columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover-row hover">
              {columnNames.map((columnName) => (
                <td key={columnName} className="py-4 px-6">
                  {columnName === 'created_at' ? formatDate(item[columnName]) : item[columnName]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    
  );
}

export default Table;

