"use client"
import React, { useEffect, useState } from 'react';
import Table from '@/components/table'; 
import Sidebar from '@/components/Sidebar';
import { getMetricsData } from '@/api'; 
import { useSelector } from 'react-redux';
import Protected from '@/components/protected';
import { useParams } from 'next/navigation';

function Page() {
  const [metricsData, setMetricsData] = useState([]);
  const currentOrgId = useSelector((state) => state.orgReducer.currentOrgId);
  const params = useParams()

  useEffect(() => {
    // Make sure to call the API and update state only if currentOrgId is available
    // if (currentOrgId) {
      getMetricsData(params.id).then((data) => {
        
        if (data && data.statusCode === 200) {
          setMetricsData(data.data); // Update the state with the actual data
        }
      }).catch((error) => {
        console.error('Failed to fetch metrics data:', error);
      });
    // }
  }, [currentOrgId]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <Table data={metricsData} />
      </div>
      <Sidebar />
    </div>
  );
}

export default Protected(Page);

