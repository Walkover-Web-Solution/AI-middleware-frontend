"use client";
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getMetricsDataApi } from '@/config';
import { METRICS_FACTOR_OPTIONS, TIME_RANGE_OPTIONS } from '@/utils/enums';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import SearchItems from '@/components/UI/SearchItems';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon } from '@/components/Icons';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Function to format dates in different formats depending on the range
const formatDate = (dateString, rangeType = 'day') => {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format based on range type
    if (rangeType === 'hour') {
      // For hourly data, show time in HH:MM format
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (rangeType === 'day') {
      // For daily data, show DD MMM format
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    } else {
      // For other ranges, show DD MMM format
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

const convertApiData = (apiData, factor = 0, range = 1, allBridges = [], apiKeys = []) => {
  const factorOptions = ['bridge_id', 'apikey_id', 'model'];
  const currentFactor = factorOptions[factor];

  // Determine the time range and interval based on the selected range option
  const now = new Date();
  let intervalType = 'day';
  let timePoints = [];
  let intervalMs = 24 * 60 * 60 * 1000; // Default to daily intervals
  
  // Configure time range and intervals based on selected range
  switch(range) {
    case 0: // 1 hour
      intervalType = 'hour';
      intervalMs = 15 * 60 * 1000; // 15 minutes intervals
      timePoints = Array.from({ length: 4 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 1: // 3 hours
      intervalType = 'hour';
      intervalMs = 15 * 60 * 1000; // 15 minutes intervals
      timePoints = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 2: // 6 hours
      intervalType = 'hour';
      intervalMs = 30 * 60 * 1000; // 30 minutes intervals
      timePoints = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 3: // 12 hours
      intervalType = 'hour';
      intervalMs = 60 * 60 * 1000; // 1 hour intervals
      timePoints = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 4: // 1 day
      intervalType = 'hour';
      intervalMs = 2 * 60 * 60 * 1000; // 2 hour intervals
      timePoints = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 5: // 2 days
      intervalType = 'day';
      intervalMs = 4 * 60 * 60 * 1000; // 4 hour intervals
      timePoints = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 6: // 7 days
      intervalType = 'day';
      intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
      timePoints = Array.from({ length: 7 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 7: // 14 days
      intervalType = 'day';
      intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
      timePoints = Array.from({ length: 14 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
    case 8: // 30 days
    default:
      intervalType = 'day';
      intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
      timePoints = Array.from({ length: 30 }, (_, i) => new Date(now.getTime() - i * intervalMs)).reverse();
      break;
  }

  // Calculate start time for filtering data
  const startTime = new Date(now.getTime() - timePoints.length * intervalMs);

  // Initialize groupedByDate with empty data for all timepoints
  const groupedByDate = {};
  timePoints.forEach(date => {
    // Format date according to interval type
    const dateStr = intervalType === 'hour' 
      ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
      : new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(date);
    
    groupedByDate[dateStr] = {
      items: [],
      totalCost: 0,
      rawDate: new Date(date) // Store raw date for sorting
    };
  });

  // Process API data
  apiData.forEach((entry) => {
    const entryDate = new Date(entry.created_at);
    
    // Skip entries older than our start time
    if (entryDate >= startTime) {
      // Find the appropriate time bucket for this entry
      let targetDate = null;
      
      for (let i = 0; i < timePoints.length - 1; i++) {
        if (entryDate >= timePoints[i] && entryDate < timePoints[i + 1]) {
          targetDate = timePoints[i];
          break;
        }
      }
      
      // If not found in any interval, use the last interval
      if (!targetDate && entryDate >= timePoints[timePoints.length - 1]) {
        targetDate = timePoints[timePoints.length - 1];
      }
      
      if (targetDate) {
        // Format the date string for the bucket
        const dateStr = intervalType === 'hour'
          ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(targetDate)
          : new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(targetDate);

        // Resolve names for bridges and API keys
        let name = '';
        if (currentFactor === 'bridge_id') {
          const bridge = allBridges.find(b => b._id === entry.bridge_id);
          name = bridge ? bridge.name : `Bridge ${entry.bridge_id?.substring(0, 6)}`;
        } else if (currentFactor === 'apikey_id') {
          const apiKey = apiKeys.find(k => k._id === entry.apikey_id);
          name = apiKey ? apiKey.name : `API Key ${entry.apikey_id?.substring(0, 6)}`;
        } else {
          name = entry.model || 'Unknown Model';
        }
        
        // Add the entry to the appropriate bucket
        if (groupedByDate[dateStr]) {
          groupedByDate[dateStr].items.push({
            id: entry[currentFactor],
            name: name,
            cost: entry.cost_sum || 0,
            tokens: entry.total_token_count || 0,
            successCount: entry.success_count || 0,
          });
          
          groupedByDate[dateStr].totalCost += (entry.cost_sum || 0);
        }
      }
    }
  });
  
  // Convert to array format and sort by date
  return Object.keys(groupedByDate).map(date => ({
    period: date,
    date: groupedByDate[date].rawDate,
    totalCost: groupedByDate[date].totalCost,
    items: groupedByDate[date].items.length > 0 ? groupedByDate[date].items : []
  })).sort((a, b) => a.date - b.date);
};

// New function to aggregate data by factor (API keys, bridges, models)
const aggregateDataByFactor = (rawData) => {
  // Initialize empty object to store aggregated data
  const aggregated = {};
  
  // Loop through all time periods in rawData
  rawData.forEach(period => {
    // Loop through all items in each period
    period.items.forEach(item => {
      const itemId = item.id;
      const itemName = item.name;
      
      // Create entry if it doesn't exist
      if (!aggregated[itemId]) {
        aggregated[itemId] = {
          id: itemId,
          name: itemName,
          tokens: 0,
          cost: 0,
          successCount: 0
        };
      }
      
      // Add to the totals
      aggregated[itemId].tokens += item.tokens;
      aggregated[itemId].cost += item.cost;
      aggregated[itemId].successCount += item.successCount;
    });
  });
  
  // Convert to array and sort by tokens (descending)
  return Object.values(aggregated).sort((a, b) => b.tokens - a.tokens);
};

function Page({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [factor, setFactor] = useState(parseInt(searchParams.get('factor')) || 0);
  const [range, setRange] = useState(parseInt(searchParams.get('range')) || 0);
  const [bridge, setBridge] = useState(() => {
    const bridgeId = searchParams.get('bridge_id');
    const bridgeName = searchParams.get('bridge_name');
    return bridgeId && bridgeName ? { bridge_id: bridgeId, bridge_name: bridgeName } : null;
  });
  const [loading, setLoading] = useState(false);
  const [filterBridges, setFilterBridges] = useState([]);
  const orgId = params?.org_id;
  const [rawData, setRawData] = useState([]);

  const FACTOR_OPTIONS = ['Bridges', 'API Keys', 'Models'];

  const { allBridges, apikeyData } = useCustomSelector((state) => ({
    allBridges: state.bridgeReducer.org[orgId]?.orgs || [],
    apikeyData: state?.bridgeReducer?.apikeys[orgId] || []
  }));
  const updateURLParams = (newParams) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // Push new URL without triggering a page refresh
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

  useEffect(() => {
    setFilterBridges(allBridges);
  }, [allBridges]);

  const fetchMetricsData = async () => {
    setLoading(true);
    const response = await getMetricsDataApi({ 
      bridge_id:bridge?.bridge_id,
      range: range+1, 
      org_id: orgId, 
      factor: METRICS_FACTOR_OPTIONS[factor],
    });
    const data= convertApiData(response,factor,range, allBridges, apikeyData) 
    setRawData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetricsData();
  }, [factor, range, bridge]);

  const handleFactorChange = (index) => {
    setFactor(index);
    updateURLParams({factor:index})
  };

  const handleTimeRangeChange = (index) => {
    setRange(index);
    updateURLParams({range:index})
  };

  const handleBridgeChange = (bridge_id, bridge_name) => {
    console.log("Selected bridge:", bridge_id, bridge_name);
    setBridge({ 
      bridge_id: bridge_id,
      bridge_name: bridge_name
    });
    updateURLParams({
      bridge_id: bridge_id,
      bridge_name: bridge_name
    });
  };

  const chartData = {
    series: [{
      name: 'Total Cost',
      data: rawData.map(item => item.totalCost)
    }],
    categories: rawData.map(item => item.period)
  };

  const totalCost = rawData.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="p-10 min-h-screen">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">Metrics Dashboard</h1>
        <p className="text-base-content">Monitor your application's key metrics at a glance.</p>
      </header>

      {/* Filters Card */}
      <div className="bg-base-100 shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Middle - Group By Dropdown */}
          <div className='flex items-center gap-2'>
            <span className="font-medium">Group by:</span>
            <details className="dropdown dropdown-end" 
              tabIndex={0} 
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  e.currentTarget.removeAttribute('open');
                }
              }}
            >
              <summary className="btn btn-sm m-1">
                {['Bridges', 'API Keys', 'Models'][factor]}
                <ChevronDownIcon className="w-3 h-3 ml-2" />
              </summary>
              <ul tabIndex="0" className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52 z-high">
                {['Bridges', 'API Keys', 'Models'].map((item, index) => (
                  <li key={index}>
                    <a 
                      className={`${factor === index ? 'active' : ''}`} 
                      onClick={(e) => {
                        handleFactorChange(index);
                        const details = e.currentTarget.closest('details');
                        if (details) details.removeAttribute('open');
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Left side - Agent Selection with "All" option */}
          <div className='flex items-center gap-2'>
            <span className="font-medium">Agent:</span>
            <details className="dropdown dropdown-end z-high" 
             ref={(node) => {
              if (node) {
                const handleClickOutside = (event) => {
                  const isClickInsideSearch = event.target.closest('.search-container');
                  const isClickInsideItem = event.target.closest('.dropdown-item');
                  if (!node.contains(event.target) && !isClickInsideSearch && !isClickInsideItem) {
                    node.removeAttribute('open');
                  }
                };
                document.addEventListener('mousedown', handleClickOutside);

                // Store the handler to remove it later
                node._clickOutsideHandler = handleClickOutside;
              }
            }}
            >
              <summary className="btn btn-sm m-1">
                {bridge?.['bridge_name']
                  ? bridge?.['bridge_name'].length > 15
                    ? bridge?.['bridge_name'].substring(0, 15) + '...'
                    : bridge?.['bridge_name']
                  : 'All Agents'}
                <ChevronDownIcon className="w-3 h-3 ml-2" />
              </summary>


              <ul className="menu dropdown-content bg-base-100 rounded-box z-high w-52 p-2 shadow-sm flex-row overflow-y-auto overflow-x-hidden min-w-72 max-w-72 scrollbar-hide max-h-[70vh]">
                <div className="search-container">
                  <SearchItems setFilterItems={setFilterBridges} data={allBridges} item="Agent" />
                </div>
                
                <li>
                  <a
                    onClick={(e) => {
                      updateURLParams({bridge_id:null,bridge_name:null})
                      setBridge(null);
                      const details = e.currentTarget.closest('details');
                      if (details) details.removeAttribute('open');
                    }}
                    className={`w-72 mb-1 dropdown-item ${!bridge ? 'active' : ''}`}
                  >
                    All Agents
                  </a>
                </li>


                {filterBridges.map((item, index) => (
                  <li key={index}>
                    <a
                      onClick={(e) => {
                                                                    
                        // Explicitly construct bridge object to ensure proper format
                       
                        
                        handleBridgeChange(item?._id,item?.name);
                        
                        // Close dropdown after a small delay to ensure state update
                      
                        const details = e.currentTarget.closest('details');
                        if (details) details.removeAttribute('open');
                        
                      }}
                      className={`w-72 mb-1 dropdown-item ${bridge?.['bridge_id'] === item?._id ? 'active' : ''}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Right side - Time Range */}
          <div className='flex items-center gap-2'>
            <span className="font-medium">Time Range:</span>
            <details className="dropdown dropdown-end" 
              tabIndex={0} 
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  e.currentTarget.removeAttribute('open');
                }
              }}
            >
              <summary className="btn btn-sm m-1">
                {TIME_RANGE_OPTIONS?.[range]}
                <ChevronDownIcon className="w-3 h-3 ml-2" />
              </summary>
              <ul tabIndex="0" className="z-high dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52">
                {TIME_RANGE_OPTIONS.map((item, index) => (
                  <li key={index}>
                    <a 
                      className={`${index === range ? 'active' : ''}`} 
                      onClick={(e) => {
                        handleTimeRangeChange(index);
                        const details = e.currentTarget.closest('details');
                        if (details) details.removeAttribute('open');
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center">
            <span className={`${loading ? 'loading loading-ring loading-md' : ""}`}></span>
            {loading && <span className="text-gray-600 ml-2">Loading...</span>}
          </div>
        </div>
      </div>

      {/* Cost Overview */}
      {/* <div className="bg-base-100 shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-base-content">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-base-content opacity-70">
              Total Cost - {TIME_RANGE_OPTIONS[range]}
            </div>
          </div>
        </div>
      </div> */}

      {/* Charts Section */}
      <div className="bg-base-100 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Metrics Visualization</h2>
        <div className="h-96">
        {rawData.length > 0 ? (
  <div style={{
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden'
  }}>
    <div style={{
      minWidth: Math.max(800, rawData.length * 60) + 'px',
      height: '400px'
    }}>
      <Chart
        options={{
          chart: {
            type: 'bar',
            height: 350,
            width: Math.max(800, rawData.length * 60),
            toolbar: {
              show: true,
              tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
              }
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
            }
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '40px', // Fixed width in pixels
              borderRadius: 4,
              borderRadiusApplication: 'end',
              distributed: false
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
            categories: chartData.categories,
            labels: {
              rotate: 0,
              hideOverlappingLabels: false,
              trim: false,
              style: {
                fontSize: '11px',
                fontWeight: '400'
              }
            },
            axisBorder: {
              show: true
            },
            axisTicks: {
              show: true
            }
          },
          yaxis: {
            title: {
              text: 'Cost ( in $ )'
            },
            labels: {
              formatter: function (value) {
                return '$' + (value?.toFixed(2) || '0.00');
              }
            }
          },
          fill: {
            opacity: 0.9
          },
          colors: ['#4ade80'],
          grid: {
            borderColor: '#e7e7e7',
            strokeDashArray: 3
          },
          tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
              const periodData = rawData[dataPointIndex];
              if (!periodData) return '';
              
              const totalCost = series[seriesIndex][dataPointIndex];
              
              return `
                <div style="
                  background: #fff;
                  border: none;
                  border-radius: 12px;
                  padding: 16px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                  min-width: 250px;
                  max-width: 350px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                  <div style="
                    color: #000;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-align: center;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 8px;
                  ">
                    ${periodData.period}
                  </div>
                  
                  <div style="
                    color: #000;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                  ">
                    Total Cost: $${totalCost.toFixed(3)}
                  </div>
                  
                  <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
                    ${FACTOR_OPTIONS[factor]} Breakdown:
                  </div>
                  
                  ${periodData.items.map(item => `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 4px;
                      padding: 2px 0;
                    ">
                      <div style="
                        color: #000;
                        font-size: 11px;
                        flex: 1;
                        margin-right: 8px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      ">
                        ${item.name}
                      </div>
                      <div style="
                        color: #000;
                        font-weight: 600;
                        font-size: 11px;
                        min-width: 50px;
                        text-align: right;
                      ">
                        $${item.cost.toFixed(3)}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }
          }
        }}
        series={chartData.series}
        type="bar"
        height={350}
        width={Math.max(800, rawData.length * 60)}
      />
    </div>
  </div>
) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-base-content opacity-60">No data available</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token Usage Overview */}
      <div className="bg-base-100 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Token Usage Overview</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {aggregateDataByFactor(rawData).map((item, index) => {
            // Calculate width percentage for visualization (max width 95%)
            const maxTokens = Math.max(...aggregateDataByFactor(rawData).map(i => i.tokens));
            const widthPercentage = maxTokens > 0 ? (item.tokens / maxTokens) * 95 : 0;
            
            return (
              <div key={index} className="relative mb-2">
                <div 
                  className="absolute inset-0 bg-base-300 rounded transition-all duration-300"
                  style={{ width: `${widthPercentage}%` }}
                ></div>
                
                <div className="relative flex items-center justify-between p-2 z-10">
                  <div className="flex-grow overflow-hidden text-ellipsis">
                    <div className="text-base-content font-medium text-sm">
                      {item.name || `Item ${index + 1}`}
                    </div>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <div className="font-bold text-xs text-base-content">
                      tokens: {item.tokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-base-content opacity-60">cost: ${item.cost.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {aggregateDataByFactor(rawData).length === 0 && (
            <div className="text-center py-4">
              <div className="text-base-content opacity-60">No data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Protected(Page);