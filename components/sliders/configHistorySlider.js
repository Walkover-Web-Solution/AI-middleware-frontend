"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { toggleSidebar } from "@/utils/utility";
import { getBridgeConfigHistory } from "@/config";

function ConfigHistorySlider({ versionId }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (versionId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await getBridgeConfigHistory(versionId);
          if (response.success) {
            setHistoryData(response.userData.updates);
          }
        } catch (error) {
          console.error("Error fetching bridge history:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [versionId]);

  const formatTime = (time) => {
    const date = new Date(time);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  };

  const handleCloseConfigHistorySlider = useCallback(() => {
    toggleSidebar("default-config-history-slider", "right");
  }, []);

  return (
    <aside
      id="default-config-history-slider"
      className="sidebar-container fixed flex flex-col top-0 right-0 p-4 w-full md:w-1/3 lg:w-1/6 opacity-100 h-screen bg-base-200 transition-all duration-300 border-l overflow-y-auto translate-x-full"
      aria-label="Config History Slider"
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between">
          <p className="text-xl font-semibold">Updates History</p>
          <X
            className="cursor-pointer"
            onClick={handleCloseConfigHistorySlider}
          />
        </div>
        <div className="mt-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="space-y-4 text-base-content">
              {historyData && historyData.length > 0 ? (
                historyData.map((item, index) => (
                  <li
                    key={item.id}
                    className="pb-2 border-b shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{item.type}</p>
                        <p className="text-sm text-gray-500">
                          {formatTime(item.time)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p>No history available</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

export default ConfigHistorySlider;
