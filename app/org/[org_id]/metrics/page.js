"use client";
import { Calendar } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getMetricsDataApi } from '@/config';
import { METRICS_FACTOR_OPTIONS, TIME_RANGE_OPTIONS } from '@/utils/enums';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import SearchItems from '@/components/UI/SearchItems';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon } from '@/components/Icons';
import { getFromCookies } from '@/utils/utility';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
export const runtime = 'edge';

// Custom Date Range Picker Component
const DateRangePicker = ({ onDateRangeSelect, isOpen, onClose, initialStartDate, initialEndDate }) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeSelect(startDate, endDate);
      onClose();
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 shadow-xl w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Date Range</h3>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <div className="flex flex-col space-y-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered w-full"
                max={endDate || undefined}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <div className="flex flex-col space-y-2">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered w-full"
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
       
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={handleClear}
            className="btn btn-ghost"
          >
            Clear
          </button>
          <div className="space-x-2">
            <button 
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="btn btn-primary"
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const convertApiData = (
  apiData,
  factor = 0,
  range = 1,
  allBridges = [],
  apiKeys = [],
  customStartDate = null,
  customEndDate = null
) => {
  const factorOptions = ["bridge_id", "apikey_id", "model"];
  const currentFactor = factorOptions[factor];

  const uniqueEntries = {};

  // Process API data into unique entries
  apiData.forEach((entry) => {
    const entryDate = new Date(entry.created_at);

    // Round down to nearest 15 minutes for range < 5
    if (range < 5) {
      const minutes =
        Math.floor(entryDate.getMinutes() / 15) * 15;
      entryDate.setMinutes(minutes, 0, 0);
    }

    // Key depends on range
    const key =
      range < 5
        ? entryDate.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
        : entryDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const entryId = entry[currentFactor];
    const uniqueKey = `${key}+${
      currentFactor === "bridge_id"
        ? entry.bridge_id
        : currentFactor === "apikey_id"
        ? entry.apikey_id
        : currentFactor === "model"
        ? entry.model
        : ""
    }`;

    if (!uniqueEntries[uniqueKey]) {
      uniqueEntries[uniqueKey] = {
        date: entryDate,
        id: entryId,
        cost: entry.cost_sum || 0,
        tokens: entry.total_token_count || 0,
        successCount: entry.success_count || 0,
      };
    } else {
      uniqueEntries[uniqueKey].cost += entry.cost_sum || 0;
      uniqueEntries[uniqueKey].tokens += entry.total_token_count || 0;
      uniqueEntries[uniqueKey].successCount += entry.success_count || 0;
    }
  });

  let timePoints = [];
  let intervalType = "day";
  let intervalMs = 24 * 60 * 60 * 1000;

  if (range === 10 && customStartDate && customEndDate) {
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      timePoints.push(new Date(date));
    }

    intervalType = "day";
    intervalMs = 24 * 60 * 60 * 1000;
  } else {
    const now = new Date();
    const roundedNow = new Date(now);
    roundedNow.setMinutes(
      Math.floor(now.getMinutes() / 15) * 15,
      0,
      0
    );

    switch (range) {
      case 0: // 1 hour → 15 min
        intervalType = "hour";
        intervalMs = 15 * 60 * 1000;
        timePoints = Array.from({ length: 4 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 1: // 3 hours → 15 min
        intervalType = "hour";
        intervalMs = 15 * 60 * 1000;
        timePoints = Array.from({ length: 12 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 2: // 6 hours → 30 min
        intervalType = "hour";
        intervalMs = 15 * 60 * 1000;
        timePoints = Array.from({ length: 24 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 3: // 12 hours → 1 hour
        intervalType = "hour";
        intervalMs = 15 * 60 * 1000;
        timePoints = Array.from({ length: 48 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 4: // 1 day → 2 hours
        intervalType = "hour";
        intervalMs = 15 * 60 * 1000;
        timePoints = Array.from({ length: 96 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 5: // 2 days → 4 hours
        intervalType = "day";
        intervalMs = 24 * 60 * 60 * 1000;
        timePoints = Array.from({ length: 2 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 6: // 7 days
        intervalType = "day";
        intervalMs = 24 * 60 * 60 * 1000;
        timePoints = Array.from({ length: 7 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 7: // 14 days
        intervalType = "day";
        intervalMs = 24 * 60 * 60 * 1000;
        timePoints = Array.from({ length: 14 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
      case 8: // 30 days
      default:
        intervalType = "day";
        intervalMs = 24 * 60 * 60 * 1000;
        timePoints = Array.from({ length: 30 }, (_, i) =>
          new Date(roundedNow.getTime() - i * intervalMs)
        ).reverse();
        break;
    }
  }

  // Initialize grouped data
  const groupedByDate = {};

  timePoints.forEach((date) => {
    const dateStr =
      range < 5
        ? new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(date)
        : new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "short",
          }).format(date);

    groupedByDate[dateStr] = {
      items: [],
      totalCost: 0,
      rawDate: new Date(date),
    };
  });

  // Fill grouped data from uniqueEntries
  Object.values(uniqueEntries).forEach((entry) => {
    const dateStr =
      range < 5
        ? new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(entry.date)
        : new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "short",
          }).format(entry.date);

    if (groupedByDate[dateStr]) {
      let name = "";
      if (currentFactor === "bridge_id") {
        const bridge = allBridges.find((b) => b._id === entry.id);
        name = bridge ? bridge.name : `Bridge ${entry.id?.substring(0, 6)}`;
      } else if (currentFactor === "apikey_id") {
        const apiKey = apiKeys.find((k) => k._id === entry.id);
        name = apiKey ? apiKey.name : `API Key ${entry.id?.substring(0, 6)}`;
      } else {
        name = entry.id || "Unknown Model";
      }

      const existingItemIndex = groupedByDate[dateStr].items.findIndex(
        (item) => item.id === entry.id
      );

      if (existingItemIndex >= 0) {
        groupedByDate[dateStr].items[existingItemIndex].cost += entry.cost;
        groupedByDate[dateStr].items[existingItemIndex].tokens += entry.tokens;
        groupedByDate[dateStr].items[existingItemIndex].successCount +=
          entry.successCount;
      } else {
        groupedByDate[dateStr].items.push({
          id: entry.id,
          name: name,
          cost: entry.cost,
          tokens: entry.tokens,
          successCount: entry.successCount,
        });
      }

      groupedByDate[dateStr].totalCost += entry.cost;
    }
  });

  return Object.keys(groupedByDate)
    .map((date) => ({
      period: date,
      date: groupedByDate[date].rawDate,
      totalCost: groupedByDate[date].totalCost,
      items:
        groupedByDate[date].items.length > 0
          ? groupedByDate[date].items
          : [],
    }))
    .sort((a, b) => a.date - b.date);
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
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [factor, setFactor] = useState(parseInt(searchParams.get('factor')) || 0);
  const [range, setRange] = useState(parseInt(searchParams.get('range')) || 0);
  const [customStartDate, setCustomStartDate] = useState(searchParams.get('start_date') || null);
  const [customEndDate, setCustomEndDate] = useState(searchParams.get('end_date') || null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [bridge, setBridge] = useState(() => {
    const bridgeId = searchParams.get('bridge_id');
    const bridgeName = searchParams.get('bridge_name');
    return bridgeId && bridgeName ? { bridge_id: bridgeId, bridge_name: bridgeName } : null;
  });
  const [loading, setLoading] = useState(false);
  const [filterBridges, setFilterBridges] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('light');
  const orgId = resolvedParams?.org_id;
  const [rawData, setRawData] = useState([]);

  const FACTOR_OPTIONS = ['Bridges', 'API Keys', 'Models'];
  const EXTENDED_TIME_RANGE_OPTIONS = [...TIME_RANGE_OPTIONS, 'Custom Range'];

  const { allBridges, apikeyData, descriptions } = useCustomSelector((state) => ({
    allBridges: state.bridgeReducer.org[orgId]?.orgs || [],
    apikeyData: state?.bridgeReducer?.apikeys[orgId] || [],
    descriptions: state.flowDataReducer?.flowData?.descriptionsData?.descriptions||{},
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

  // Effect to track theme changes
  useEffect(() => {
    // Initial theme
    const getInitialTheme = () => {
      const savedTheme = getFromCookies("theme");
      return savedTheme
    };

    setCurrentTheme(getInitialTheme());

    // Set up listener for theme changes
    const handleStorageChange = () => {
      const newTheme = getFromCookies("theme");
      if (newTheme === "dark" || newTheme === "light") {
        setCurrentTheme(newTheme);
      } else {
        // System theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setCurrentTheme(systemTheme);
      }
    };

    // Listen for theme changes
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('themeChange', handleStorageChange);

    // Setup mutation observer to watch for theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          if (newTheme === 'dark' || newTheme === 'light') {
            setCurrentTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('themeChange', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  const fetchMetricsData = async () => {
    setLoading(true);
    
    // Create request body according to the required format
    const requestBody = {
      range: range === 10 ? 10 : range + 1,
      factor: METRICS_FACTOR_OPTIONS[factor],
    };
    
    // Add bridge_id only if it exists
    if (bridge?.bridge_id) {
      requestBody.bridge_id = bridge.bridge_id;
    }
    
    // Add custom date parameters if using custom range
    if (range === 10 && customStartDate && customEndDate) {
      requestBody.start_date = customStartDate;
      requestBody.end_date = customEndDate;
    }
    
    // Add org_id
    requestBody.org_id = orgId;
    
    
    const response = await getMetricsDataApi(requestBody);
    
    const data = convertApiData(response, factor, range, allBridges, apikeyData, customStartDate, customEndDate);
    setRawData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetricsData();
  }, [factor, range, bridge, customStartDate, customEndDate]);

  const handleFactorChange = (index) => {
    setFactor(index);
    updateURLParams({ factor: index })
  };

  const handleTimeRangeChange = (index) => {
    if (index === TIME_RANGE_OPTIONS.length) {
      // Custom range selected
      setIsDatePickerOpen(true);
    } else {
      setRange(index);
      // Clear custom date params when switching to predefined ranges
      setCustomStartDate(null);
      setCustomEndDate(null);
      updateURLParams({ 
        range: index,
        start_date: null,
        end_date: null
      });
    }
  };

  const handleDateRangeSelect = (startDate, endDate) => {
    // Store the selected dates in ISO format
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setRange(10); // Set range to 10 for custom
    
    // Update URL parameters
    updateURLParams({
      range: 10,
      start_date: startDate,
      end_date: endDate
    });
  };

  const handleBridgeChange = (bridge_id, bridge_name) => {
    setBridge({
      bridge_id: bridge_id,
      bridge_name: bridge_name
    });
    updateURLParams({
      bridge_id: bridge_id,
      bridge_name: bridge_name
    });
  };

  const getDisplayRangeText = () => {
    if (range === 10 && customStartDate && customEndDate) {
      // Format dates for display in a more readable format
      const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short', 
          day: 'numeric'
        });
      };
      
      const start = formatDisplayDate(customStartDate);
      const end = formatDisplayDate(customEndDate);
      return `${start} - ${end}`;
    }
    return TIME_RANGE_OPTIONS[range] || 'Select Range';
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
        <p className="text-base-content">{descriptions?.['Metrics'] || "Monitor your application's key metrics at a glance."}</p>
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
                      updateURLParams({ bridge_id: null, bridge_name: null })
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
                        handleBridgeChange(item?._id, item?.name);
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

          {/* Right side - Time Range with Custom Option */}
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
                {range === 10 ? getDisplayRangeText() : TIME_RANGE_OPTIONS?.[range]}
                <ChevronDownIcon className="w-3 h-3 ml-2" />
              </summary>
              <ul tabIndex="0" className="z-high dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52">
                {TIME_RANGE_OPTIONS.map((item, index) => (
                  <li key={index}>
                    <a
                      className={`${index === range && range !== 10 ? 'active' : ''}`}
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
                {/* Custom Range Option */}
                <li>
                  <a
                    className={`${range === 10 ? 'active' : ''} flex items-center gap-2`}
                    onClick={(e) => {
                      handleTimeRangeChange(TIME_RANGE_OPTIONS.length);
                      const details = e.currentTarget.closest('details');
                      if (details) details.removeAttribute('open');
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Custom Range
                  </a>
                </li>
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

      {/* Date Range Picker Modal */}
      <DateRangePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateRangeSelect={handleDateRangeSelect}
        initialStartDate={customStartDate}
        initialEndDate={customEndDate}
      />

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
                      width: '100%', // Changed to full width
                      background: 'transparent',
                      foreColor: 'oklch(var(--bc))',
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
                      },
                    },
                    theme: {
                      mode: currentTheme
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
                          colors: 'oklch(var(--bc))'
                        }
                      },
                      axisBorder: {
                        show: true,
                        color: 'oklch(var(--bc))'
                      },
                      axisTicks: {
                        show: true,
                        
                      }
                    },
                    yaxis: {
                      title: {
                        text: 'Cost ( in $ )',
                        style: {
                          color: 'oklch(var(--bc))'
                        }
                      },
                      labels: {
                        style: {
                          colors: 'oklch(var(--bc))'
                        },
                        formatter: function (value) {
                          return '$' + (value?.toFixed(2) || '0.00');
                        }
                      },
                    },
                    fill: {
                      opacity: 0.9
                    },
                    colors: ['#4ade80'],
                    grid: {
                      borderColor: 'oklch(var(--bc) / 0.2)',
                      strokeDashArray: 3
                    },
                    tooltip: {
                      theme: 'dark',
                      style: {
                        fontSize: '12px',
                      },
                      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        const periodData = rawData[dataPointIndex];
                        if (!periodData) return '';

                        const totalCost = series[seriesIndex][dataPointIndex];

                        return `
                <div style="
                  background: #fff;
                  border: none;
                  border-radius: 0px;
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
                    },
                    legend: {
                      labels: {
                        colors: 'oklch(var(--bc))'
                      }
                    }
                    
                  }}
                  series={chartData.series}
                  type="bar"
                  height={350}
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