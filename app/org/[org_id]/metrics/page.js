"use client"
import React, { useEffect, useState } from 'react';
import Table from '@/components/table';
import Sidebar from '@/components/Sidebar';
import { getMetricsData } from '@/api';
import { useSelector } from 'react-redux';
import Protected from '@/components/protected';
import { useParams } from 'next/navigation';

/**
 * The page component for the metrics page.
 * @returns {ReactElement} The metrics page component.
 */
function Page({ params }) {
  // State to store the metric data.
  const [metricsData, setMetricsData] = useState([]);
  // Get the current org id from the redux store.
  const currentOrgId = useSelector((state) => state.orgReducer.currentOrgId);
  // Get the id from the url using next/navigation.
  // const params = useParams();

  // Use effect to call the api and update the state if orgId is available
  useEffect(() => {
    // If orgId is available, fetch the data and update the state
    if (currentOrgId) {
      getMetricsData(params.org_id)
        .then((data) => {
          if (data && data.statusCode === 200) {
            // Update the state with the actual data
            setMetricsData(data.data);
          }
        })
        .catch((error) => {
          // Log the error to the console if there is any
          console.error("Failed to fetch metrics data:", error);
        });
    }
  }, []); // Run the effect on component mount and never again

  return (
    <div className="drawer lg:drawer-open">
      {/* Drawer toggle for the sidebar */}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <Table data={metricsData} />
      </div>
      <Sidebar orgid={params.org_id} />
    </div>
  );
}

export default Protected(Page);

