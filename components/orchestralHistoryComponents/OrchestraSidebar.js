import React, { useState, useRef, useEffect } from 'react';
import { Search, GitBranch, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getOrchestralSubThreads } from '@/config/orchestralHistoryApi';
import { formatRelativeTime } from '@/utils/utility';

const OrchestraSidebar = ({
  historyData,
  threadHandler,
  fetchMoreData,
  hasMore,
  loading,
  params,
  searchParams,
  setSearchMessageId,
  setPage,
  setHasMore,
  filterOption,
  setFilterOption,
  searchRef,
  setIsFetchingMore,
  setThreadPage,
  threadPage,
  hasMoreThreadData,
  setHasMoreThreadData,
  selectedVersion,
  setIsErrorTrue,
  isErrorTrue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedSubThreadId, setSelectedSubThreadId] = useState(null);
  const [subThreadsMap, setSubThreadsMap] = useState({});
  const [loadingSubThreads, setLoadingSubThreads] = useState({});
  const sidebarRef = useRef(null);
  const decodedThreadId = searchParams?.thread_id ? decodeURIComponent(searchParams.thread_id) : selectedThreadId||null;
  const decodedSubThreadId = searchParams?.subThread_id ? decodeURIComponent(searchParams.subThread_id) : selectedSubThreadId||null;

  useEffect(() => {
    if (decodedThreadId) {
      setSelectedThreadId(decodedThreadId);
      setExpandedThreads([decodedThreadId]);
    } else if (historyData?.length > 0 && !selectedThreadId) {
      // Auto-open first thread on initial load
      const firstThread = historyData[0];
      setSelectedThreadId(firstThread.thread_id);
      setExpandedThreads([firstThread.thread_id]);
      handleToggleThread(firstThread.thread_id, params?.id);
    }
  }, [decodedThreadId, historyData, selectedThreadId, params?.id]);

  useEffect(() => {
    if (decodedSubThreadId) {
      setSelectedSubThreadId(decodedSubThreadId);
    }
  }, [decodedSubThreadId]);


  const filteredHistoryData = historyData?.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const threadMatches = item.thread_id?.toLowerCase().includes(searchLower);
    const subThreadMatches = item.sub_thread?.some(sub => 
      sub.display_name?.toLowerCase().includes(searchLower) ||
      sub.messages?.some(msg => msg.message?.toLowerCase().includes(searchLower))
    );
    
    return threadMatches || subThreadMatches;
  }) || [];

  const truncate = (string = '', maxLength = 28) =>
    string?.length > maxLength ? `${string.substring(0, maxLength - 3)}...` : string;

  const handleToggleThread = async (threadId, bridgeId) => {
    const isExpanding = !expandedThreads.includes(threadId);
    
    setExpandedThreads((prev) =>
      prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [threadId]
    );

    // Fetch sub-threads when expanding if not already fetched
    if (isExpanding && !subThreadsMap[threadId]) {
      setLoadingSubThreads(prev => ({ ...prev, [threadId]: true }));
      try {
        const response = await getOrchestralSubThreads({ 
          thread_id: threadId, 
          bridge_id: bridgeId 
        });
        
        if (response.success && response.threads?.length > 0) {
          setSubThreadsMap(prev => ({ ...prev, [threadId]: response.threads }));

          // Auto-select first sub-thread on expand
          const firstSubThread = response.threads[0];
          setSelectedSubThreadId(firstSubThread.sub_thread_id);
          const threadItem = historyData.find(t => t.thread_id === threadId);
          if (threadItem && threadHandler) {
            threadHandler(threadId, firstSubThread, 'select-subthread');
          }
        } else {
          // If empty response, use thread_id as sub_thread_id
          const fallbackSubThread = { 
            sub_thread_id: threadId, 
            thread_id: threadId,
            display_name: threadId,
            created_at: new Date().toISOString()
          };
          setSubThreadsMap(prev => ({ 
            ...prev, 
            [threadId]: [fallbackSubThread] 
          }));
          
          // Auto-select fallback sub-thread
          setSelectedSubThreadId(threadId);
          const threadItem = historyData.find(t => t.thread_id === threadId);
          if (threadItem && threadHandler) {
            threadHandler(threadId, fallbackSubThread, 'select-subthread');
          }
        }
      } catch (error) {
        console.error('Error fetching sub-threads:', error);
        // Fallback to thread_id as sub_thread_id
        const fallbackSubThread = { 
          sub_thread_id: threadId, 
          thread_id: threadId,
          display_name: threadId,
          created_at: new Date().toISOString()
        };
        setSubThreadsMap(prev => ({ 
          ...prev, 
          [threadId]: [fallbackSubThread] 
        }));
        
        // Auto-select fallback sub-thread
        setSelectedSubThreadId(threadId);
        const threadItem = historyData.find(t => t.thread_id === threadId);
        if (threadItem && threadHandler) {
          threadHandler(threadId, fallbackSubThread, 'select-subthread');
        }
      } finally {
        setLoadingSubThreads(prev => ({ ...prev, [threadId]: false }));
      }
    } else if (isExpanding && subThreadsMap[threadId]?.length) {
      const firstSubThread = subThreadsMap[threadId][0];
      setSelectedSubThreadId(firstSubThread?.sub_thread_id);
      const threadItem = historyData.find(t => t.thread_id === threadId);
      if (threadItem && threadHandler) {
        threadHandler(threadId, firstSubThread, 'select-subthread');
      }
    }
  };

  const handleThreadClick = async (threadItem) => {
    const isCurrentlyExpanded = expandedThreads.includes(threadItem.thread_id);
    
    setSelectedThreadId(threadItem.thread_id);
    
    if (!searchTerm) {
      // Toggle accordion - if currently expanded, collapse it; otherwise expand it
      if (isCurrentlyExpanded) {
        setSelectedSubThreadId(null);
      } else {
        // Expand and fetch sub-threads
        await handleToggleThread(threadItem.thread_id, params?.id);
        
        // Auto-select first sub-thread after fetching
        const subThreads = subThreadsMap[threadItem.thread_id];
        if (subThreads && subThreads.length > 0) {
          const firstSubThread = subThreads[0];
          setSelectedSubThreadId(firstSubThread?.sub_thread_id);
          if (threadHandler) {
            threadHandler(threadItem.thread_id, firstSubThread, 'select-subthread');
          }
        }
      }
    }
  };

  const handleSubThreadClick = (threadItem, subThread) => {
    setSelectedThreadId(threadItem.thread_id);
    setSelectedSubThreadId(subThread?.sub_thread_id);
    if (threadHandler) {
      threadHandler(threadItem.thread_id, subThread, 'select-subthread');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMoreData();
    }
  };

  return (
    <div className="min-w-[290px] max-w-[290px] bg-base-100 border-r border-base-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100">
        <h3 className="text-lg font-semibold mb-3">Orchestral History</h3>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search threads..."
            className="input input-sm input-bordered w-full pl-10 pr-9 bg-base-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto" ref={sidebarRef} id="orchestral-sidebar-scroll">
        <InfiniteScroll
          dataLength={filteredHistoryData.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<div></div>}
          endMessage={
            filteredHistoryData.length > 0 && (
              <div className="p-4 text-center text-xs text-base-content/50">
                No more threads
              </div>
            )
          }
          scrollableTarget="orchestral-sidebar-scroll"
        >
        <div className="p-2">
          {filteredHistoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-base-content/40 mb-2">
                <GitBranch size={32} />
              </div>
              <p className="text-sm text-base-content/60">No orchestral flows found</p>
              {searchTerm && (
                <p className="text-xs text-base-content/40 mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistoryData.map((item, index) => {
                const isSelected = selectedThreadId === item.thread_id;
                const isExpanded = expandedThreads.includes(item.thread_id);
                const threadTitle = item?.thread_name || item?.display_name || item?.thread_id;

                return (
                  <div className="space-y-1" key={`history-${item.thread_id}-${index}`}>
                    <div
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-base-200/50 border-base-300/50 hover:bg-base-200'
                      }`}
                      onClick={() => handleThreadClick(item)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <GitBranch size={14} className="text-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-base-content truncate">
                            {truncate(threadTitle, 20)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-base-content/60">
                            {formatRelativeTime(item.updated_at || item.created_at)}
                          </span>
                          {!searchTerm && (
                            <div className="pointer-events-none">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {!searchTerm && isExpanded && (
                      <div className="ml-4 space-y-1">
                        {loadingSubThreads[item.thread_id] ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-2 rounded-lg bg-base-200/50 animate-pulse">
                                <div className="h-4 bg-base-300/50 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-base-300/50 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : !subThreadsMap[item.thread_id]?.length ? (
                          <div className="text-xs text-base-content/60 p-2">No sub threads available</div>
                        ) : (
                          subThreadsMap[item.thread_id].map((subThread, subIndex) => {
                            const isSubSelected = selectedSubThreadId === subThread?.sub_thread_id;
                            return (
                              <div
                                key={`${subThread?.sub_thread_id || subIndex}`}
                                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                                  isSelected && isSubSelected
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-base-100 border-base-300/30 hover:bg-base-200/50 hover:border-base-300'
                                }`}
                                onClick={() => handleSubThreadClick(item, subThread)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <MessageCircle size={12} className="opacity-60 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">
                                      {truncate(subThread?.display_name || subThread?.sub_thread_id, 18)}
                                    </span>
                                  </div>
                                  <span className="text-xs opacity-60 flex-shrink-0">
                                    {formatRelativeTime(subThread?.created_at || subThread?.updated_at)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* End of results */}
          {!hasMore && filteredHistoryData.length > 0 && (
            <div className="p-4 text-center">
              <p className="text-xs text-base-content/40">
                No more orchestral flows to load
              </p>
            </div>
          )}
        </div>
        </InfiniteScroll>
      </div>

    </div>
  );
};

export default OrchestraSidebar;
