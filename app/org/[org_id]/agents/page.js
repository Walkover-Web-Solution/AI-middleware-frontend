"use client"
import CreateNewBridge from "@/components/createNewBridge";
import CustomTable from "@/components/customTable/customTable";
import MainLayout from "@/components/layoutComponents/MainLayout";
import LoadingSpinner from "@/components/loadingSpinner";
import OnBoarding from "@/components/OnBoarding";
import PageHeader from "@/components/Pageheader";
import Protected from "@/components/protected";
import TutorialSuggestionToast from "@/components/tutorialSuggestoinToast";
import { useCustomSelector } from "@/customHooks/customSelector";
import OpenAiIcon from "@/icons/OpenAiIcon";
import { archiveBridgeAction, clearBridgeUsageMetricsAction, deleteBridgeAction, fetchBridgeUsageMetricsAction, updateBridgeAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import useTutorialVideos from "@/hooks/useTutorialVideos";
import { getIconOfService, openModal, closeModal, formatRelativeTime, useOutsideClick, formatDate } from "@/utils/utility";

import { ClockIcon, EllipsisIcon } from "@/components/Icons";
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import usePortalDropdown from "@/customHooks/usePortalDropdown";
import SearchItems from "@/components/UI/SearchItems";
import AgentEmptyState from "@/components/AgentEmptyState";
import { Archive, ArchiveRestore, Droplet, Funnel, Pause, Play, Settings2, Trash2, Undo2 } from "lucide-react";
import DeleteModal from "@/components/UI/DeleteModal";
import UsageLimitModal from "@/components/modals/UsageLimitModal";
import useDeleteOperation from "@/customHooks/useDeleteOperation";

export const runtime = 'edge';
const BRIDGE_STATUS = {
  ACTIVE: 1,
  PAUSED: 0
};

const ModelBadge = ({ model }) => {
  if (!model) return null;

  return (
    <span
      className="mt-1 inline-flex w-fit max-w-xs items-center gap-1 rounded-full border border-base-300/70 bg-base-200/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-base-content/60"
      title={model}
    >
      <span className="truncate text-base-content/70 normal-case max-w-[140px]">
        {model}
      </span>
    </span>
  );
};

const formatUsageNumber = (value, maximumFractionDigits = 2) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(numericValue);
};

const getUsageStatsForRow = (row) => {
  const limitValue = Number(row?.agent_limit ?? 0);
  const usageValue = Number(row?.agent_usage ?? 0);
  const totalTokens = Number(row?.totalTokens ?? 0);
  const hasLimit = Number.isFinite(limitValue) && limitValue > 0;
  const usagePercent = hasLimit ? Math.min(100, Math.max(0, (usageValue / limitValue) * 100)) : 0;
  const remaining = hasLimit ? Math.max(limitValue - usageValue, 0) : null;
  return { limitValue, usageValue, totalTokens, hasLimit, usagePercent, remaining };
};

const UsageProgressDonut = ({ percent, label }) => (
  <div className="relative h-16 w-16">
    <div
      className="h-full w-full rounded-full border border-base-300 bg-base-200"
      style={{
        background: `conic-gradient(#3b82f6 ${percent}%, rgba(59,130,246,0.15) ${percent}% 100%)`
      }}
    />
    <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-base-100 text-xs font-semibold text-base-content/70">
      {label}
    </div>
  </div>
);

const UsageSummaryPopover = ({ stats, item, isEmbedUser, onSetLimit, onResetUsage }) => {
  const { hasLimit, usagePercent, usageValue, limitValue, remaining } = stats;
  const [limit, setLimit] = useState(limitValue ?? "");
  const [isLimitDirty, setIsLimitDirty] = useState(false);

  const handleLimitChange = (e) => {
    const value = e.target.value;
    setLimit(value);
    const original = limitValue ?? "";
    setIsLimitDirty(String(value) !== String(original));
  };

  return (
    <div className="w-72 p-4 space-y-4 text-base-content">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Usage &amp; Limits</p>
        </div>
      
      </div>

      <div className="flex items-center gap-4">
        <UsageProgressDonut percent={hasLimit ? usagePercent : 0} label={hasLimit ? `${Math.round(usagePercent)}%` : "--"} />
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex gap-1 items-center justify-between">
            <span className="text-base-content/60">Limit</span>
            <input
              type="number"
              placeholder="Enter limit in $"
              className="input input-bordered max-w-sm w-full input-sm"
              value={limit}
              min="0"
              step="0.0001"
              onChange={handleLimitChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base-content/60">Used</span>
            <span className="font-semibold">{formatUsageNumber(usageValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base-content/60">Remaining</span>
            <span className="font-semibold">{hasLimit ? formatUsageNumber(remaining) : "—"}</span>
          </div>
        </div>
      </div>

      {!isEmbedUser && (
        <div className="flex flex-col gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { onSetLimit(item, limit); }}
            disabled={!isLimitDirty}
          >
            Set / Update Limit
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onResetUsage}
            disabled={!Number(usageValue)}
          >
            Reset Usage
          </button>
        </div>
      )}
    </div>
  );
};

const renderTimestampCell = (timestamp) => {
  if (!timestamp) {
    return "No records found";
  }

  return (
    <div className="group cursor-help">
      <span className="group-hover:hidden">
        {formatRelativeTime(timestamp)}
      </span>
      <span className="hidden group-hover:inline">
        {formatDate(timestamp)}
      </span>
    </div>
  );
};

// Footer Component
const PoweredByFooter = () => {
  return (
    <footer className="w-full py-4 border-t border-base-300">
      <div className="flex justify-center items-center gap-2  font-medium opacity-50 text-sm text-base-content/70">
        <span>Powered by</span>
        <a 
          href="https://gtwy.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:text-primary-focus transition-colors"
        >
          GTWY
        </a>
      </div>
    </footer>
  );
};

function Home({ params, isEmbedUser }) {
  // Use the tutorial videos hook
  const { getBridgeCreationVideo } = useTutorialVideos();
  
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();
  const { allBridges, averageResponseTime, isLoading, isFirstBridgeCreation, descriptions, bridgeStatus, showHistory, usageMetrics } = useCustomSelector((state) => {
    const orgData = state.bridgeReducer.org[resolvedParams.org_id] || {};
    const user = state.userDetailsReducer.userDetails
    return {
      allBridges: (orgData.orgs || []).slice().reverse(),
      averageResponseTime: orgData.average_response_time || [],
      isLoading: state.bridgeReducer.loading,
      isFirstBridgeCreation: user.meta?.onboarding?.bridgeCreation || "",
      descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions || {},
      bridgeStatus: state.bridgeReducer.allBridgesMap,
      showHistory: state.appInfoReducer.embedUserDetails?.showHistory || false,
      usageMetrics: state.bridgeReducer.usageMetrics,
    };
  });
  const [filterBridges, setFilterBridges] = useState(allBridges);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [tutorialState, setTutorialState] = useState({
    showSuggestion: isFirstBridgeCreation,
    showTutorial: false
  });
  const [selectedBridgeForLimit, setSelectedBridgeForLimit] = useState(null);
  const [usageFilterPopover, setUsageFilterPopover] = useState({ open: false, top: 0, left: 0 });
  const [usageFilterDates, setUsageFilterDates] = useState({ start_date: "", end_date: "" });
  const [usageFilterError, setUsageFilterError] = useState("");
  const [isUsageFilterSubmitting, setIsUsageFilterSubmitting] = useState(false);
  const usageFilterPopoverRef = useRef(null);
  
  // Use portal dropdown hook
  const {
    handlePortalOpen,
    handlePortalCloseImmediate,
    PortalDropdown,
    PortalStyles
  } = usePortalDropdown({
    offsetX: -120,  // Better positioning for table dropdowns
    offsetY: 5
  });
  const { isDeleting, executeDelete } = useDeleteOperation();

  const usageMetricsMap = useMemo(() => {
    if (!usageMetrics?.data) return {};
    return usageMetrics.data.reduce((acc, item) => {
      if (item?.bridge_id) {
        // Store full metrics object so we can access both total_tokens and total_cost
        acc[item.bridge_id] = item;
      }
      return acc;
    }, {});
  }, [usageMetrics?.data]);

  const usageFilterIds = useMemo(() => new Set(Object.keys(usageMetricsMap)), [usageMetricsMap]);
  const isUsageFilterActive = useMemo(
    () => Boolean(usageMetrics?.filters?.start_date && usageMetrics?.filters?.end_date),
    [usageMetrics?.filters]
  );

  const usageFilterLabel = useMemo(() => {
    if (!isUsageFilterActive) return "";
    const formatReadableDate = (value) => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };
    return `${formatReadableDate(usageMetrics?.filters?.start_date)} → ${formatReadableDate(usageMetrics?.filters?.end_date)}`;
  }, [isUsageFilterActive, usageMetrics?.filters]);

  const applyUsageFilter = (list) => {
    if (!Array.isArray(list)) return list;
    if (!isUsageFilterActive) return list;
    return list.filter((item) => usageFilterIds.has(item._id));
  };

  const resolveUsageTokens = (bridge) => {
    // Only show usage when a filter is active
    if (!bridge || !isUsageFilterActive) return 0;
    const metrics = usageMetricsMap[bridge._id];
    return Number(metrics?.total_tokens ?? 0);
  };

  const resolveUsageCost = (bridge) => {
    // Only show usage cost when a filter is active
    if (!bridge || !isUsageFilterActive) return 0;
    const metrics = usageMetricsMap[bridge._id];
    return Number(metrics?.total_cost ?? 0);
  };

  const isUsageResetDisabled = useMemo(
    () => !isUsageFilterActive && !usageFilterDates.start_date && !usageFilterDates.end_date,
    [isUsageFilterActive, usageFilterDates.end_date, usageFilterDates.start_date]
  );

  const applyPresetUsageFilter = async (days) => {
    const end = new Date();
    const start = new Date();
    // Last N days including today
    start.setDate(end.getDate() - (days - 1));

    const toYMD = (d) => d.toISOString().slice(0, 10);
    const startDate = toYMD(start);
    const endDate = toYMD(end);

    setUsageFilterError("");
    setUsageFilterDates({ start_date: startDate, end_date: endDate });
    setIsUsageFilterSubmitting(true);
    try {
      await dispatch(fetchBridgeUsageMetricsAction({
        start_date: startDate,
        end_date: endDate,
      }));
    } catch (error) {
      console.error("Failed to apply preset usage filter:", error);
    } finally {
      setIsUsageFilterSubmitting(false);
    }
  };

  useEffect(() => {
    setFilterBridges(allBridges)
  }, [allBridges]);

  // Reset loading state when component unmounts or navigation completes
  useEffect(() => {
    return () => {
      setLoadingAgentId(null);
    };
  }, [allBridges]);

  // Reset loading state when component unmounts or navigation completes
  useEffect(() => {
    return () => {
      setLoadingAgentId(null);
    };
  }, []);

  useEffect(() => {
    if (usageMetrics?.filters) {
      setUsageFilterDates({
        start_date: usageMetrics.filters.start_date,
        end_date: usageMetrics.filters.end_date
      });
    } else {
      setUsageFilterDates({ start_date: "", end_date: "" });
    }
  }, [usageMetrics?.filters]);
  
  // Helper function to calculate days remaining for deletion (30 days from deletedAt)
  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 0;
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from deletion
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredUnArchivedBridges = filterBridges?.filter((item) => (item.status === 1 || item.status === undefined) && !item.deletedAt);
  const filteredDeletedBridges = filterBridges?.filter((item) => item.deletedAt);

  const usageFilteredUnArchived = applyUsageFilter(filteredUnArchivedBridges);
  const usageFilteredDeleted = applyUsageFilter(filteredDeletedBridges);

  const UnArchivedBridges = usageFilteredUnArchived
    ?.filter((item) => item.status === 1 || item.status === undefined)
    .map((item) => {
      const createdAt = item.created_at || item.createdAt;
      const updatedAt = item.updated_at || item.updatedAt;
      const lastUsed = item.last_used;
      const totalTokensValue = resolveUsageTokens(item);
      const totalCostValue = resolveUsageCost(item);
      const promptTotalTokens = item?.prompt_total_tokens;
      const promptEnhancerPercentage = item?.prompt_enhancer_percentage;

      return ({
        _id: item._id,
        model: item.configuration?.model || "",
        name: <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            {loadingAgentId === item._id ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              getIconOfService(item.service, 20, 20)
            )}
          </div>
          <div className="flex-col" title={item.name}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {item.name}
                {item.bridge_status === 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                    <ClockIcon size={12} />
                    <span className="hidden sm:inline">Paused</span>
                  </div>
                )}
              </div>
            </div>
            <ModelBadge model={item.configuration?.model} />
          </div>
        </div>,
        actualName: item?.name || "",
        slugName: item?.slugName || "",
        service: getIconOfService(item.service),
        bridgeType: item.bridgeType,
        status: item.status,
        bridge_status: item.bridge_status,
        versionId: item?.published_version_id || item?.versions?.[0],
        promptDetails: (promptTotalTokens != null || promptEnhancerPercentage != null)
          ? (
            <div className="flex flex-col text-xs">
              {promptTotalTokens != null && (
                <span className="font-semibold text-base-content">
                  {formatUsageNumber(promptTotalTokens)} tokens
                </span>
              )}
              {promptEnhancerPercentage != null && (
                <span className="text-base-content/70">
                  {promptEnhancerPercentage}% enhancer
                </span>
              )}
            </div>
          )
          : "—",
        totalTokens: totalTokensValue,
        usageCost: totalCostValue,
        averageResponseTime: averageResponseTime[item?._id] ? averageResponseTime[item?._id] : "Not used in 24h",
        agent_limit: item?.bridge_limit,
        agent_usage: item?.bridge_usage ? parseFloat(item.bridge_usage).toFixed(4) : 0,
        isLoading: loadingAgentId === item._id,
        last_used: renderTimestampCell(lastUsed),
        last_used_orignal: lastUsed,
        last_used_original: lastUsed,
        created_at: renderTimestampCell(createdAt),
        created_at_original: createdAt,
        updated_at: renderTimestampCell(updatedAt),
        updated_at_original: updatedAt,
      });
    });

  

  // Helper function to calculate days remaining for deletion (30 days from deletedAt)
 
  const DeletedBridges = usageFilteredDeleted
    ?.map((item) => {
      const createdAt = item.created_at || item.createdAt;
      const updatedAt = item.updated_at || item.updatedAt;
      const lastUsed = item.last_used;
      const totalTokensValue = resolveUsageTokens(item);
      const totalCostValue = resolveUsageCost(item);
      const promptTotalTokens = item?.prompt_total_tokens;
      const promptEnhancerPercentage = item?.prompt_enhancer_percentage;

      return ({
        _id: item._id,
        model: item.configuration?.model || "",
        name: <div className="flex gap-3">
          <div className="flex gap-2 items-center">
            {loadingAgentId === item._id ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              getIconOfService(item.service, 20, 20)
            )}
          </div>
          <div className="flex-col">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={loadingAgentId === item._id ? "opacity-50" : ""}>
                  {item.name}
                </span>
                {loadingAgentId === item._id && (
                  <span className="text-xs text-primary opacity-70">Loading...</span>
                )}
              </div>
            </div>
            <ModelBadge model={item.configuration?.model} />
          </div>
        </div>,
        actualName: item?.name || "",
        slugName: item?.slugName || "",
        service: item.service === 'openai' ? <OpenAiIcon /> : item.service,
        bridgeType: item.bridgeType,
        status: item.status,
        deletedAt: item.deletedAt,
        daysRemaining: getDaysRemaining(item.deletedAt),
        versionId: item?.published_version_id || item?.versions?.[0],
        promptDetails: (promptTotalTokens != null || promptEnhancerPercentage != null)
          ? (
            <div className="flex flex-col text-xs">
              {promptTotalTokens != null && (
                <span className="font-semibold text-base-content">
                  {formatUsageNumber(promptTotalTokens)} tokens
                </span>
              )}
              {promptEnhancerPercentage != null && (
                <span className="text-base-content/70">
                  {promptEnhancerPercentage}% To Be Enhanced
                </span>
              )}
            </div>
          )
          : "—",
        totalTokens: totalTokensValue,
        usageCost: totalCostValue,
        agent_limit: item?.bridge_limit,
        averageResponseTime: averageResponseTime[item?._id] === 0 ? <div className="text-xs">Not used in 24h</div> : <div className="text-xs">{averageResponseTime[item?._id]} sec</div>,
        isLoading: loadingAgentId === item._id,
        last_used: renderTimestampCell(lastUsed),
        last_used_original: lastUsed,
        last_used_orignal: lastUsed,
        created_at: renderTimestampCell(createdAt),
        created_at_original: createdAt,
        updated_at: renderTimestampCell(updatedAt),
        updated_at_original: updatedAt,
        agent_usage: item?.bridge_usage ? parseFloat(item.bridge_usage).toFixed(4) : 0,

      });
    });

  // Helper function to calculate days remaining for deletion (30 days from deletedAt)
 
  const onClickConfigure = (id, versionId) => {
    // Prevent multiple clicks while loading
    if (loadingAgentId) return;
    
    setLoadingAgentId(id);
    router.push(`/org/${resolvedParams.org_id}/agents/configure/${id}?version=${versionId}`);
  };
  const handlePauseBridge = async (bridgeId) => {
    const newStatus = bridgeStatus[bridgeId]?.bridge_status === BRIDGE_STATUS.PAUSED
      ? BRIDGE_STATUS.ACTIVE
      : BRIDGE_STATUS.PAUSED;

    try {
      await dispatch(updateBridgeAction({
        bridgeId,
        dataToSend: { bridge_status: newStatus }
      }));
      toast.success(`Agent ${newStatus === BRIDGE_STATUS.ACTIVE ? 'resumed' : 'paused'} successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update agent status');
    }
  };
 
  const handleSetBridgeLimit = (item) => {
    const transformedData = {
      ...item,
      // Map agent_limit (used in table rows) to bridge_limit (used by the modal)
      item_limit: item.agent_limit,
      // Ensure actualName is present for the modal subtitle
      actualName: item.actualName || item.name || "",
    };
    setSelectedBridgeForLimit(transformedData);
    openModal(MODAL_TYPE.API_KEY_LIMIT_MODAL);
  };

  const handleUpdateBridgeLimit = async  (bridge, limit) => {
    const dataToSend = {
      "bridge_limit": limit
    }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Limit Updated Successfully');
  };

  const resetUsage = async (bridge) => {
    const dataToSend = { "bridge_usage": 0 }
    const res = await dispatch(updateBridgeAction({ bridgeId: bridge._id, dataToSend }));
    if (res?.success) toast.success('Agent Usage Reset Successfully');
  }

  const closeUsageFilterPopover = () => {
    setUsageFilterPopover((prev) => ({ ...prev, open: false }));
  };
const handleUsageFilterIconClick = (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (typeof window === "undefined") return;

  const modalWidth = 320;
  const modalHeight = 220;

  const top =
    window.scrollY + Math.max(16, (window.innerHeight - modalHeight) / 2);
  const left =
    window.scrollX + Math.max(16, (window.innerWidth - modalWidth) / 2);

  setUsageFilterError("");
  setUsageFilterPopover({
    open: true,
    top,
    left,
  });
};
  const handleUsageDateChange = (key, value) => {
    setUsageFilterError("");
    setUsageFilterDates((prev) => ({ ...prev, [key]: value }));
  };

  const handleUsageFilterApply = async () => {
    if (!usageFilterDates.start_date || !usageFilterDates.end_date) {
      setUsageFilterError("Please select both start and end dates.");
      return;
    }
    if (usageFilterDates.start_date > usageFilterDates.end_date) {
      setUsageFilterError("Start date cannot be after end date.");
      return;
    }
    setIsUsageFilterSubmitting(true);
    try {
      await dispatch(fetchBridgeUsageMetricsAction({
        start_date: usageFilterDates.start_date,
        end_date: usageFilterDates.end_date
      }));
      closeUsageFilterPopover();
    } catch (error) {
      console.error('Failed to fetch usage metrics:', error);
    } finally {
      setIsUsageFilterSubmitting(false);
    }
  };

  const handleUsageFilterClear = () => {
    dispatch(clearBridgeUsageMetricsAction());
    setUsageFilterDates({ start_date: "", end_date: "" });
    setUsageFilterError("");
    closeUsageFilterPopover();
  };

  useEffect(() => {
    if (!usageFilterPopover.open) return;
    const handleClick = (event) => {
      if (usageFilterPopoverRef.current && !usageFilterPopoverRef.current.contains(event.target)) {
        closeUsageFilterPopover();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [usageFilterPopover.open]);
const handleUsageFilterDropdownClick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const dropdownContent = (
    <ul className="menu bg-base-100 rounded-box w-56 p-2 shadow text-sm">
      <li>
        <button onClick={() => applyPresetUsageFilter(1)}>Last 1 day</button>
      </li>
      <li>
        <button onClick={() => applyPresetUsageFilter(5)}>Last 5 days</button>
      </li>
      <li>
        <button onClick={() => applyPresetUsageFilter(10)}>Last 10 days</button>
      </li>
      <li>
        <button onClick={() => applyPresetUsageFilter(15)}>Last 15 days</button>
      </li>

      <li className="mt-1 border-t border-base-200" />

      <li>
        <button
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            handleUsageFilterClear();
          }}
          disabled={isUsageResetDisabled}
        >
          Reset filter
        </button>
      </li>

      <li>
        <button
          onClick={(ev) => {
            // open existing custom date popover anchored near this button
            ev.preventDefault();
            ev.stopPropagation();
            handlePortalCloseImmediate();
            handleUsageFilterIconClick(ev);
          }}
        >
          Custom date range…
        </button>
      </li>
    </ul>
  );

  // Uses the same portal hook as the ellipsis EndComponent
  handlePortalOpen(e.currentTarget, dropdownContent);
};
  const EndComponent = ({ row }) => {
    const usageStats = getUsageStatsForRow(row);

    const handleUsageSummaryClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const usageContent = (
        <UsageSummaryPopover
          stats={usageStats}
          item={row}
          isEmbedUser={isEmbedUser}
          onSetLimit={(bridge, limit) => {
            handlePortalCloseImmediate();
            handleUpdateBridgeLimit(bridge, limit);
          }}
          onResetUsage={() => {
            handlePortalCloseImmediate();
            resetUsage(row);
          }}
        />
      );

      handlePortalOpen(e.currentTarget, usageContent);
    };

    const handleDropdownClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const dropdownContent = (
        <ul className="menu bg-base-100 rounded-box w-52 p-2 shadow">
          <li>
             <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2"
            onClick={handleUsageSummaryClick}
          >
            <Settings2 size={14} />
            Usage &amp; Limits
          </button>
          </li>
          
            <li> <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePortalCloseImmediate();
                handlePauseBridge(row._id)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2`}
            >
              {bridgeStatus[row._id]?.bridge_status === BRIDGE_STATUS.PAUSED ? (
                <>
                  <Play size={14} className="text-green-600" />
                  Resume Agent
                </>
              ) : (
                <>
                  <Pause size={14} className="text-red-600" />
                  Pause Agent
                </>
              )}
            </button></li>
            <li><button onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePortalCloseImmediate();
              setItemToDelete(row);
              // Small delay to ensure state is set before opening modal
              setTimeout(() => {
                openModal(MODAL_TYPE.DELETE_MODAL);
              }, 10);
            }}>
              <Trash2 size={14} className="text-red-600" />
              Delete Agent
            </button></li> 
        </ul>
      );
      
      handlePortalOpen(e.currentTarget, dropdownContent);
    };

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center mr-4 text-sm">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {(!isEmbedUser || (isEmbedUser && showHistory)) ? (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="btn btn-outline btn-ghost btn-sm" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/org/${resolvedParams.org_id}/agents/history/${row._id}?version=${row?.versionId}`);
            }}>
              History
            </button>
          </div> 
          ) : null}
        </div>
        <div className="bg-transparent">
          <div 
            role="button" 
            className="hover:bg-base-200 rounded-lg p-3 cursor-pointer" 
            onClick={handleDropdownClick}
          >
            <EllipsisIcon className="rotate-90" size={16} />
          </div>
          </div>
        </div>
      </div>
    )
  }

  const DeletedEndComponent = ({ row }) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            className="btn btn-outline btn-ghost btn-sm whitespace-nowrap flex items-center gap-1" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              restoreBridge(row._id)
            }}
          >
            <span className="flex items-center  gap-1">
             <div className="flex text-xs items-center gap-1">
             <Undo2 size={12} />
             </div>
             <div className="text-sm">
             Undo
             </div>
            </span>
          </button>
        </div>
        <div className="text-error font-sm mt-2 text-sm whitespace-nowrap">
          {row.daysRemaining} days left
        </div>
      </div>
    )
  }

  const deleteBridge = async (item, name) => {
    await executeDelete(async () => {
      const bridgeId = item._id;
      const response = await dispatch(deleteBridgeAction({ bridgeId, org_id: resolvedParams.org_id }));
      toast.success(response?.data?.message || response?.message || response || 'Agent deleted successfully');
    });
  }

  const restoreBridge = async (bridgeId) => {
    try {
      const response = await dispatch(deleteBridgeAction({ bridgeId, org_id: resolvedParams.org_id, restore: true }));
      toast.success(response?.data?.message || response?.message || response || 'Agent restored successfully');
    } catch (error) {
      console.error('Failed to restore agent', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to restore agent';
      toast.error(errorMessage);
    }
  }

  return (
    <div className="w-full overflow-x-hidden flex flex-col min-h-screen">
      <div className="w-full max-w-full flex-1">

        {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"bridgeCreation"} TutorialDetails={"Agent Creation"} />}
        {tutorialState?.showTutorial && (
          <OnBoarding
            setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
            video={getBridgeCreationVideo()}
            flagKey={"bridgeCreation"}

          />
        )}
        <CreateNewBridge orgid={resolvedParams.org_id} />
        {!allBridges.length && isLoading && <LoadingSpinner />}
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-4 lg:gap-16 items-start">

            <div className="w-full">
              {allBridges.length === 0 ? (
                <AgentEmptyState orgid={resolvedParams.org_id} isEmbedUser={isEmbedUser} />
              ) : (
                <div className="flex flex-col lg:mx-0">
                  <div className="px-2 pt-4">
                    <MainLayout>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full ">
                        <PageHeader
                          title="Agents"
                          description={descriptions?.Agents || "Agents connect your app to AI models like Openai with zero boilerplate, smart prompt handling, and real-time context awareness.Focus on what your agent should do.Agents handle the rest."}
                          docLink="https://gtwy.ai/blogs/features/bridge"
                          isEmbedUser={isEmbedUser}
                        />

                      </div>
                    </MainLayout>

                   <div className="flex flex-row gap-4">
  {allBridges.length > 5 && (
    <SearchItems data={allBridges} setFilterItems={setFilterBridges} item="Agents" />
  )}
  <div className="flex items-center gap-2 ml-2">
    <button
      type="button"
      className="btn btn-ghost text-sm btn-sm border border-base-300 gap-1"
      onClick={handleUsageFilterDropdownClick}
    >
      <Funnel size={14}/>
      <span>Usage Filter</span>
      <span className="text-xs text-base-content/60">
        {isUsageFilterActive ? usageFilterLabel || '' : 'All time'}
      </span>
    </button>

    <button
      className="btn btn-primary btn-sm"
      onClick={() => openModal(MODAL_TYPE?.CREATE_BRIDGE_MODAL)}
    >
      + Create New Agent
    </button>
  </div>
</div>
                </div>
                
                <div className="w-full overflow-visible">
                  <CustomTable
                    data={UnArchivedBridges}
                    columnsToShow={['name', 'promptDetails', 'totalTokens','last_used','created_at','updated_at']}
                    sorting
                    sortingColumns={['name','totalTokens','last_used','created_at','updated_at']}
                    handleRowClick={(props) => onClickConfigure(props?._id, props?.versionId)} 
                    keysToExtractOnRowClick={['_id', 'versionId']} 
                    keysToWrap={['name', 'model']} 
                    endComponent={EndComponent}
                    onUsageFilterClick={handleUsageFilterIconClick}
                    isUsageFilterActive={isUsageFilterActive}
                    usageFilterLabel={usageFilterLabel}
                    usageFilterIsLoading={isUsageFilterSubmitting}
                  />
                </div>
                
                
                
                {filteredDeletedBridges?.length > 0 && (
                  <div className="">
                    <div className="flex justify-center items-center my-4">
                      <p className="border-t border-base-300 w-full"></p>
                      <p className="bg-error text-white py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
                        Deleted Agents
                      </p>
                      <p className="border-t border-base-300 w-full"></p>
                    </div>
                    <div className="opacity-60 overflow-visible">
                      <CustomTable
                        data={DeletedBridges}
                        columnsToShow={['name', 'promptDetails', 'totalTokens','last_used','created_at','updated_at']}
                        sorting
                        sortingColumns={['name','totalTokens','last_used','created_at','updated_at']}
                        keysToWrap={['name', 'model']} 
                        endComponent={DeletedEndComponent}
                        isUsageFilterActive={isUsageFilterActive}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          
          {/* Powered By Footer */}
          
        </div>

        {usageFilterPopover.open && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed z-[999999999]"
            style={{ top: usageFilterPopover.top, left: usageFilterPopover.left }}
          >
            <div
              ref={usageFilterPopoverRef}
              className="w-72 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-base-content">Filter usage</p>
                  <p className="text-xs text-base-content/60">Show tokens between two dates</p>
                </div>
                {isUsageFilterActive && (
                  <span className="badge badge-primary badge-sm text-xs">Applied</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-base-content/60">Start date</label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={usageFilterDates.start_date}
                  max={usageFilterDates.end_date || undefined}
                  onChange={(e) => handleUsageDateChange("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-base-content/60">End date</label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={usageFilterDates.end_date}
                  min={usageFilterDates.start_date || undefined}
                  onChange={(e) => handleUsageDateChange("end_date", e.target.value)}
                />
              </div>
              {usageFilterError && (
                <p className="text-xs text-error">{usageFilterError}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleUsageFilterClear}
                  disabled={isUsageResetDisabled}
                >
                  Reset
                </button>
                <button
                  className="btn btn-primary btn-sm min-w-[70px]"
                  onClick={handleUsageFilterApply}
                  disabled={isUsageFilterSubmitting}
                >
                  {isUsageFilterSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        
        {/* Single DeleteModal for all delete operations */}
        <DeleteModal onConfirm={deleteBridge} item={itemToDelete} title="Delete Agent" description={`Are you sure you want to delete the Agent "${itemToDelete?.actualName}"? This agent will be moved to deleted items and permanently removed after 30 days.`} loading={isDeleting} isAsync={true} />
      </div>

      {/* Powered By Footer pinned to bottom */}
    {isEmbedUser && <PoweredByFooter />}
      <UsageLimitModal data={selectedBridgeForLimit} onConfirm={handleUpdateBridgeLimit} item="Agent Name" />
      
      {/* Portal components from hook */}
      <PortalStyles />
      <PortalDropdown />
      
    </div>
  );
}
export default Protected(Home);
