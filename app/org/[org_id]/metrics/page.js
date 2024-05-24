"use client"
import { getMetricsData } from '@/config';
import Protected from '@/components/protected';
import Table from '@/components/table';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const runtime = 'edge';

function Page({ params }) {
  const today = new Date().toISOString().split('T')[0];
  const [metricsData, setMetricsData] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const currentOrgId = useSelector((state) => state.orgReducer.currentOrgId);

  const adjustTimeForUTC = (date, includeEndTime) => {
    const localDate = new Date(date);
    if (includeEndTime) {
      localDate.setHours(23, 59, 59, 999);
    }

    // Calculate timezone offset in milliseconds (local time minus UTC)
    const timezoneOffset = localDate.getTimezoneOffset() * 60000;

    // Subtract timezone offset to get the exact UTC equivalent for the local end of day
    const adjustedDate = new Date(localDate.getTime() - timezoneOffset);

    return adjustedDate.toISOString();
  };

  // Usage
  let startTime = adjustTimeForUTC(startDate, false); // Start of day is not that critical unless needed
  let endTime = adjustTimeForUTC(endDate, true); // Adjust end time to reflect local end of day


  // Update fetch logic to call the correct API based on the date being today
  const fetchData = () => {
    if (!params.org_id) return;

    const isToday = startDate === today && endDate === today;

    if (isToday) {
      getMetricsData(params.org_id)
        .then(handleResponse)
        .catch(handleError);
    } else {
      let startTime = adjustTimeForUTC(startDate, false);
      let endTime = adjustTimeForUTC(endDate, true);

      getMetricsData(params.org_id, startTime, endTime)
        .then(handleResponse)
        .catch(handleError);
    }
  };


  const handleResponse = (data) => {
    if (data && data.statusCode === 200) {
      setMetricsData(data.data);
    } else {
      console.error("Received non-200 status code:", data.statusCode);
    }
  };

  const handleError = (error) => {
    console.error("Failed to fetch metrics data:", error);
  };

  useEffect(() => {
    fetchData(); // Fetch data on initial load and subsequent data changes
  }, []); // React to changes in dates or organization ID

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
              max={endDate}
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
              min={startDate}
              max={today}
            />
          </div>
          <button onClick={fetchData} className="btn btn-primary btn-sm my-2">Filter</button>
        </div>
        <Table data={metricsData} />
      </div>
      {/* <Sidebar orgid={params.org_id} /> */}
    </div>
  );
}

export default Protected(Page);





