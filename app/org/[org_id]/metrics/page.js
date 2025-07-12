"use client";
import Protected from '@/components/protected';
import SearchItems from '@/components/UI/SearchItems';
import { getMetricsDataApi } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { METRICS_FACTOR_OPTIONS, TIME_RANGE_OPTIONS } from '@/utils/enums';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';


const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const runtime = 'edge';

const transformDataForApexCharts = (data, factor) => {
  // Define categories based on the factor
  let categories = data?.map(item => item?.[METRICS_FACTOR_OPTIONS[factor]] || ""); // Use factor to determine the category
  // Group data by metrics
  const groupedData = data.reduce(
    (acc, item) => {
      // acc.latency.push(item?.latency_sum || item.latency);
      acc.cost.push(item?.cost_sum || item.cost || 0);
      acc.success.push(item?.success_count || item.record_count || 0);
      return acc;
    },
    { cost: [], success: [] }
  );

  // Create series array for ApexCharts
  const series = [
    // {
    //   name: "Latency",
    //   data: groupedData.latency,
    // },
    {
      name: "Cost",
      data: groupedData.cost,
    },
    {
      name: "Success Count",
      data: groupedData.success,
    },
  ];

  return { series, categories };
};

function Page({ params }) {
  const { org_id } = params;
  const [factor, setFactor] = useState(0);
  const [range, setRange] = useState(0);
  const [level, setLevel] = useState('Organization');
  const [bridge, setBridge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metricsBarChartData, setMetricsBarChartData] = useState({ series: [], categories: [] });
  const { allBridges, apikeyData } = useCustomSelector((state) => ({
    allBridges: state.bridgeReducer.org[params.org_id]?.orgs || [],
    apikeyData: state?.bridgeReducer?.apikeys[org_id] || []
  })); 
  const [filterBridges, setFilterBridges] = useState(allBridges);

  const handleFactorChange = (index, changeIn = "factor") => {
    if (changeIn === 'time') {
      setRange(index);
    } else {
      setFactor(index);
    }
  }

  function structureCategory(categories = [], factor) {
    if (METRICS_FACTOR_OPTIONS[factor] === 'bridge_id') {
      return categories.map((item) => {
        const bridge = allBridges.find(bridge => bridge._id === item);
        return bridge ? bridge.name : item;
      });
    } else if (METRICS_FACTOR_OPTIONS[factor] === 'apikey_id') {
      return categories.map((item) => {
        const apiKey = apikeyData.find(apiKey => apiKey._id === item);
        return apiKey ? apiKey.name : item;
      });
    } else {
      return categories;
    }
  }
  const fetchMetricsData = async (range) => {
    setLoading(true);
    const result = await getMetricsDataApi({ range: range + 1, org_id, factor: METRICS_FACTOR_OPTIONS[factor], bridge_id: bridge?.['bridge_id'] });
    const data = transformDataForApexCharts(result, factor);
    const structured_category = structureCategory([...data.categories], factor);
    setMetricsBarChartData({ series: data.series, categories: structured_category });
    setLoading(false);
  }

  useEffect(() => {
    fetchMetricsData(range);
  }, [factor, range, bridge?.['bridge_id']]);

  const handleLevelChange = (index) => {
    setLevel(index === 0 ? 'Organization' : 'Agent');
    if (index === 0) {
      setBridge(null);
    }
  }

  const handleBridgeChange = (bridge_id, bridge_name) => {
    setBridge({ bridge_id, bridge_name });
   
  }

  return (
    <div className="p-10 min-h-screen">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Metrics Dashboard</h1>
        <p className="text-gray-600">Monitor your application's key metrics at a glance.</p>
      </header>

      <div className='flex gap-8 justify-center'>
        <div className='flex justify-end mb-3 items-center'>
          <label className="mr-1">Level:</label>
          <div className="dropdown dropdown-end z-medium border rounded-lg">
            <label tabIndex="0" role="button" className="btn capitalize">{level} level</label>
            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {['Organization', 'Agent'].map((item, index) => (
                <li key={index}><a onClick={() => handleLevelChange(index)} className={level === item ? 'active' : ''}>{item} Level</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex justify-end mb-3 items-center'>
          <label className="mr-1">Select Agent:</label>
          <div className={`dropdown dropdown-end z-medium border rounded-lg ${level !== 'Agent' ? 'opacity-50 pointer-events-none' : ''}`}>
          <label tabIndex="0" role="button" className="btn capitalize">{bridge?.['bridge_name'] ? (bridge?.['bridge_name'].length > 15 ? bridge?.['bridge_name'].substring(0, 15) + '...' : bridge?.['bridge_name']) : 'Select Agent'}</label>
            <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box flex-row overflow-y-auto overflow-x-hidden min-w-72 max-w-72 scrollbar-hide max-h-[70vh]">
              <SearchItems setFilterItems={setFilterBridges} data={allBridges} />
              {filterBridges.map((item, index) => (
                <li key={index}><a
                  onClick={() => handleBridgeChange(item?._id, item?.name)}
                  className={`w-72 ${bridge?.['bridge_id'] === item?._id ? 'active' : ''}`}
                >
                  {item.name}
                </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Top Controls */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <span className={`${loading ? 'loading loading-ring loading-lg' : ""}`}></span>
        {loading && <span className="text-gray-600">Loading...</span>}
        <div className="dropdown border rounded-lg z-low">
          <label tabIndex="0" role="button" className="btn">{TIME_RANGE_OPTIONS?.[range]}</label>
          <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {TIME_RANGE_OPTIONS.map((item, index) => (
              <li key={index}><a className={`${index === range ? 'active' : ''}`} onClick={() => handleFactorChange(index, 'time')}>{item}</a></li>
            ))}
          </ul>
        </div>

        <div className="join border">
          {['Bridges', 'API Keys', 'Models'].map((item, index) => (
            <button key={index} className={`btn join-item ${factor === index ? 'btn-primary' : ''}`} onClick={() => handleFactorChange(index)}>{item}</button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6"> */}
      <div className='justify-center flex'>

        {/* <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Line Chart</h2>
          <div className="h-96">
            <Chart options={state.options} series={state.series} type="line" height={350} />
          </div>
        </div> */}
        <div className="bg-white shadow-md rounded-lg p-4 w-full lg:w-2/3">
          <h2 className="text-lg font-bold mb-4">Bar Chart</h2>
          <div className="h-96">
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 350
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '35%',
                    borderRadius: 5,
                    borderRadiusApplication: 'end'
                  },
                },
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ['transparent']
                },
                xaxis: {
                  categories: metricsBarChartData?.categories || [],
                },
                yaxis: {
                  title: {
                    text: 'Cost ( in $ )'
                  },
                  labels: {
                    formatter: function (value) {
                      return value.toFixed(2);
                    }
                  }
                },
                fill: {
                  opacity: 1
                },
                tooltip: {
                  y: {
                    formatter: function (val, { seriesIndex }) {
                      if (seriesIndex === 0) { // Cost
                        return "$ " + val;
                      } else { // Latency and Success Count
                        return ": " + val.toFixed(2);
                      }
                    }
                  }
                }
              }}
              series={metricsBarChartData?.series} type="bar" height={350} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Protected(Page);