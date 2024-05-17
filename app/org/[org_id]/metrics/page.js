"use client"
import React, { useEffect, useState } from 'react';
import Table from '@/components/table';
import Sidebar from '@/components/Sidebar';
import { getMetricsData } from '@/config';
import Protected from '@/components/protected';

export const runtime = 'edge';
function Page({ params }) {
  // Get today's date in the required format
  const today = new Date().toISOString().split('T')[0];

  const [metricsData, setMetricsData] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Function to handle data fetching
  const fetchData = () => {
    if (params.org_id) {
      getMetricsData(params.org_id, startDate, endDate)
        .then((data) => {
          if (data && data.statusCode === 200) {
            setMetricsData(data.data);
          } else {
            console.error("Received non-200 status code:", data.statusCode);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch metrics data:", error);
        });
    }
  };


  useEffect(()=> {
    fetchData();
  },[]) 

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <div className="flex items-center justify-start space-x-4 mb-4">
          <div className="flex items-center">
            <label htmlFor="start-date" className="mr-2">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-bordered input-sm"
              max={today}  // Ensure start date is not in the future
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="end-date" className="mr-2">End Date:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-bordered input-sm"
              max={today}  // Prevent selection of a future date
            />
          </div>
          <button onClick={fetchData} className="btn btn-primary btn-sm my-2">Filter</button>
        </div>
        <Table data={metricsData} />
      </div>
      <Sidebar orgid={params.org_id} />
    </div>
  );
}

export default Protected(Page);





