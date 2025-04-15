"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Clock, User, FileText, ShieldCheck } from "lucide-react";
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
          if (response?.success) {
            setHistoryData(response?.userData?.updates ?? []);
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
      className="sidebar-container fixed z-[999999] flex flex-col top-0 right-0 p-4 w-full md:w-1/3 lg:w-1/4 opacity-100 h-screen bg-base-200 transition-all duration-300 border-l overflow-y-auto translate-x-full"
      aria-label="Config History Slider"
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <p className="text-xl font-semibold">Updates History</p>
          </div>
          <X
            className="cursor-pointer hover:text-error transition-colors"
            onClick={handleCloseConfigHistorySlider}
          />
        </div>
        <div className="mt-2">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : (
            <ul className="space-y-2 text-base-content">
              {historyData?.length > 0 ? (
                historyData.map((item, index) => (
                  <li
                    key={item?.id ?? index}
                    className="p-3 rounded-lg bg-base-100 shadow-sm hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-success" />
                        <span className="text-lg font-medium">
                          {item?.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{item?.user_name || "Unknown User"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(item?.time)}</span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No history available</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

export default ConfigHistorySlider;
