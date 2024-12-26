"use client"
import { getMetricsData } from '@/config';
import Protected from '@/components/protected';
import Table from '@/components/table';
import { useEffect, useState } from 'react';
import { ResponsiveBar, ResponsiveBarCanvas } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

export const runtime = 'edge';

const lineChartData = [
  {
    "id": "japan",
    "color": "hsl(248, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 20
      },
      {
        "x": "helicopter",
        "y": 225
      },
      {
        "x": "boat",
        "y": 106
      },
      {
        "x": "train",
        "y": 15
      },
      {
        "x": "subway",
        "y": 259
      },
      {
        "x": "bus",
        "y": 172
      },
      {
        "x": "car",
        "y": 201
      },
      {
        "x": "moto",
        "y": 3
      },
      {
        "x": "bicycle",
        "y": 58
      },
      {
        "x": "horse",
        "y": 293
      },
      {
        "x": "skateboard",
        "y": 263
      },
      {
        "x": "others",
        "y": 204
      }
    ]
  },
  {
    "id": "france",
    "color": "hsl(192, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 48
      },
      {
        "x": "helicopter",
        "y": 43
      },
      {
        "x": "boat",
        "y": 163
      },
      {
        "x": "train",
        "y": 236
      },
      {
        "x": "subway",
        "y": 123
      },
      {
        "x": "bus",
        "y": 112
      },
      {
        "x": "car",
        "y": 79
      },
      {
        "x": "moto",
        "y": 12
      },
      {
        "x": "bicycle",
        "y": 234
      },
      {
        "x": "horse",
        "y": 151
      },
      {
        "x": "skateboard",
        "y": 250
      },
      {
        "x": "others",
        "y": 82
      }
    ]
  },
  {
    "id": "us",
    "color": "hsl(22, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 190
      },
      {
        "x": "helicopter",
        "y": 178
      },
      {
        "x": "boat",
        "y": 74
      },
      {
        "x": "train",
        "y": 160
      },
      {
        "x": "subway",
        "y": 86
      },
      {
        "x": "bus",
        "y": 147
      },
      {
        "x": "car",
        "y": 292
      },
      {
        "x": "moto",
        "y": 120
      },
      {
        "x": "bicycle",
        "y": 279
      },
      {
        "x": "horse",
        "y": 291
      },
      {
        "x": "skateboard",
        "y": 130
      },
      {
        "x": "others",
        "y": 18
      }
    ]
  },
  {
    "id": "germany",
    "color": "hsl(297, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 42
      },
      {
        "x": "helicopter",
        "y": 157
      },
      {
        "x": "boat",
        "y": 208
      },
      {
        "x": "train",
        "y": 227
      },
      {
        "x": "subway",
        "y": 36
      },
      {
        "x": "bus",
        "y": 223
      },
      {
        "x": "car",
        "y": 260
      },
      {
        "x": "moto",
        "y": 160
      },
      {
        "x": "bicycle",
        "y": 168
      },
      {
        "x": "horse",
        "y": 243
      },
      {
        "x": "skateboard",
        "y": 124
      },
      {
        "x": "others",
        "y": 53
      }
    ]
  },
  {
    "id": "norway",
    "color": "hsl(26, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 195
      },
      {
        "x": "helicopter",
        "y": 239
      },
      {
        "x": "boat",
        "y": 14
      },
      {
        "x": "train",
        "y": 174
      },
      {
        "x": "subway",
        "y": 95
      },
      {
        "x": "bus",
        "y": 223
      },
      {
        "x": "car",
        "y": 229
      },
      {
        "x": "moto",
        "y": 166
      },
      {
        "x": "bicycle",
        "y": 178
      },
      {
        "x": "horse",
        "y": 20
      },
      {
        "x": "skateboard",
        "y": 139
      },
      {
        "x": "others",
        "y": 262
      }
    ]
  }
];
const data = [
  {
    "country": "AD",
    "hot dog": 25,
    "hot dogColor": "hsl(172, 70%, 50%)",
    "burger": 0,
    "burgerColor": "hsl(346, 70%, 50%)",
    "sandwich": 174,
    "sandwichColor": "hsl(100, 70%, 50%)",
    "kebab": 65,
    "kebabColor": "hsl(107, 70%, 50%)",
    "fries": 159,
    "friesColor": "hsl(239, 70%, 50%)",
    "donut": 22,
    "donutColor": "hsl(20, 70%, 50%)"
  },
  {
    "country": "AE",
    "hot dog": 49,
    "hot dogColor": "hsl(225, 70%, 50%)",
    "burger": 35,
    "burgerColor": "hsl(57, 70%, 50%)",
    "sandwich": 20,
    "sandwichColor": "hsl(26, 70%, 50%)",
    "kebab": 163,
    "kebabColor": "hsl(109, 70%, 50%)",
    "fries": 117,
    "friesColor": "hsl(325, 70%, 50%)",
    "donut": 179,
    "donutColor": "hsl(201, 70%, 50%)"
  },
  {
    "country": "AF",
    "hot dog": 24,
    "hot dogColor": "hsl(285, 70%, 50%)",
    "burger": 148,
    "burgerColor": "hsl(210, 70%, 50%)",
    "sandwich": 141,
    "sandwichColor": "hsl(147, 70%, 50%)",
    "kebab": 44,
    "kebabColor": "hsl(326, 70%, 50%)",
    "fries": 46,
    "friesColor": "hsl(308, 70%, 50%)",
    "donut": 81,
    "donutColor": "hsl(242, 70%, 50%)"
  },
  {
    "country": "AG",
    "hot dog": 113,
    "hot dogColor": "hsl(73, 70%, 50%)",
    "burger": 199,
    "burgerColor": "hsl(32, 70%, 50%)",
    "sandwich": 181,
    "sandwichColor": "hsl(12, 70%, 50%)",
    "kebab": 143,
    "kebabColor": "hsl(136, 70%, 50%)",
    "fries": 130,
    "friesColor": "hsl(118, 70%, 50%)",
    "donut": 97,
    "donutColor": "hsl(139, 70%, 50%)"
  },
  {
    "country": "AI",
    "hot dog": 191,
    "hot dogColor": "hsl(251, 70%, 50%)",
    "burger": 33,
    "burgerColor": "hsl(54, 70%, 50%)",
    "sandwich": 42,
    "sandwichColor": "hsl(248, 70%, 50%)",
    "kebab": 182,
    "kebabColor": "hsl(70, 70%, 50%)",
    "fries": 101,
    "friesColor": "hsl(308, 70%, 50%)",
    "donut": 155,
    "donutColor": "hsl(29, 70%, 50%)"
  },
  {
    "country": "AL",
    "hot dog": 49,
    "hot dogColor": "hsl(146, 70%, 50%)",
    "burger": 48,
    "burgerColor": "hsl(131, 70%, 50%)",
    "sandwich": 88,
    "sandwichColor": "hsl(355, 70%, 50%)",
    "kebab": 43,
    "kebabColor": "hsl(235, 70%, 50%)",
    "fries": 135,
    "friesColor": "hsl(332, 70%, 50%)",
    "donut": 118,
    "donutColor": "hsl(314, 70%, 50%)"
  },
  {
    "country": "AM",
    "hot dog": 77,
    "hot dogColor": "hsl(209, 70%, 50%)",
    "burger": 125,
    "burgerColor": "hsl(101, 70%, 50%)",
    "sandwich": 36,
    "sandwichColor": "hsl(77, 70%, 50%)",
    "kebab": 24,
    "kebabColor": "hsl(179, 70%, 50%)",
    "fries": 32,
    "friesColor": "hsl(31, 70%, 50%)",
    "donut": 137,
    "donutColor": "hsl(146, 70%, 50%)"
  }
]

function Page({ params }) {
  const today = new Date().toISOString().split('T')[0];
  const [metricsData, setMetricsData] = useState([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

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
    <div className="min-h-screen p-6">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Metrics Dashboard</h1>
        <p className="text-gray-600">Monitor your application's key metrics at a glance.</p>
      </header>

      {/* Top Controls */}
      <div className="flex justify-end items-center mb-6 gap-3">
        <div className="dropdown z-[99]">
          <label tabIndex="0" role="button" className="btn">Time Range</label>
          <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Today</a></li>
            <li><a>Last 3 Days</a></li>
            <li><a>Last Week</a></li>
            <li><a>Last Month</a></li>
            <li><a>Custom Date</a></li>
          </ul>
        </div>

        <div className="join border">
          <button className="btn join-item btn-primary">Bridges</button>
          <button className="btn join-item">API Keys</button>
          <button className="btn join-item">Models</button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Line Chart</h2>
          <div className="h-96">
            <ResponsiveLine
              data={lineChartData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: true,
                reverse: false
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'transportation',
                legendOffset: 36,
                legendPosition: 'middle',
                truncateTickAt: 0
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'count',
                legendOffset: -40,
                legendPosition: 'middle',
                truncateTickAt: 0
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabel="data.yFormatted"
              pointLabelYOffset={-12}
              enableTouchCrosshair={true}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Bar Chart</h2>
          <div className="h-96">
            <ResponsiveBar
              data={data}
              keys={[
                'hot dog',
                'burger',
                'sandwich',
                'kebab',
                'fries',
                'donut'
              ]}
              indexBy="country"
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'nivo' }}
              defs={[
                {
                  id: 'dots',
                  type: 'patternDots',
                  background: 'inherit',
                  color: '#38bcb2',
                  size: 4,
                  padding: 1,
                  stagger: true
                },
                {
                  id: 'lines',
                  type: 'patternLines',
                  background: 'inherit',
                  color: '#eed312',
                  rotation: -45,
                  lineWidth: 6,
                  spacing: 10
                }
              ]}
              fill={[
                {
                  match: {
                    id: 'fries'
                  },
                  id: 'dots'
                },
                {
                  match: {
                    id: 'sandwich'
                  },
                  id: 'lines'
                }
              ]}
              borderColor={{
                from: 'color',
                modifiers: [
                  [
                    'darker',
                    1.6
                  ]
                ]
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'country',
                legendPosition: 'middle',
                legendOffset: 32,
                truncateTickAt: 0
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'food',
                legendPosition: 'middle',
                legendOffset: -40,
                truncateTickAt: 0
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: 'color',
                modifiers: [
                  [
                    'darker',
                    1.6
                  ]
                ]
              }}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              role="application"
              ariaLabel="Nivo bar chart demo"
              barAriaLabel={e => e.id + ": " + e.formattedValue + " in country: " + e.indexValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Protected(Page);





