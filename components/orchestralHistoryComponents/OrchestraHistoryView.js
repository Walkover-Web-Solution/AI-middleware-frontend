import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import OrchestraThreadItem from './OrchestraThreadItem';
import OrchestraFlowVisualization from './OrchestraFlowVisualization';
import OrchestraSidebar from './OrchestraSidebar';
import ChatDetails from '@/components/historyPageComponents/ChatDetails';
import { useCustomSelector } from '@/customHooks/customSelector';
import { getOrchestralHistoryAction, getOrchestralHistoryThreadAction } from '@/store/action/orchestralHistoryAction';

const OrchestraHistoryView = ({ params, searchParams, bridgeName }) => {
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedFlowData, setSelectedFlowData] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [_selectedSubThreadId, setSelectedSubThreadId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const threadRefs = useRef({});
  const dispatch = useDispatch();

  const { historyData, threadData, loading, error } = useCustomSelector((state) => ({
    historyData: state?.orchestralHistoryReducer?.historyData || [],
    threadData: state?.orchestralHistoryReducer?.threadData || [],
    loading: state?.orchestralHistoryReducer?.loading,
    error: state?.orchestralHistoryReducer?.error
  }));
  useEffect(() => {
    if (params?.id) {
      setPage(1);
      setHasMore(true);
      dispatch(getOrchestralHistoryAction(params.id, 1, 30));
    }
  }, [dispatch, params?.id]);

  useEffect(() => {
    const firstThread = historyData[0];
    if (!firstThread) return;

    setSelectedThreadId((prev) => {
      if (prev && historyData.some((t) => t.thread_id === prev)) return prev;
      return firstThread.thread_id;
    });
    setSelectedSubThreadId(firstThread.thread_id);
  }, [historyData]);

  useEffect(() => {
    if (!selectedThreadId || !params?.id) return;
    dispatch(getOrchestralHistoryThreadAction({
      agentId: params.id,
      threadId: selectedThreadId,
      subThreadId: _selectedSubThreadId||selectedThreadId
    }));
  }, [dispatch, params?.id, selectedThreadId,_selectedSubThreadId]);

  const fetchMoreData = async () => {
    if (isFetchingMore || !hasMore || !params?.id) return;
    
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const limit = 30;
      const newData = await dispatch(getOrchestralHistoryAction(params.id, nextPage, limit));
      
      // If no data returned or less than limit, we've reached the end
      if (!newData || newData.length === 0 || newData.length < limit) {
        setHasMore(false);
      }
      
      if (newData && newData.length > 0) {
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching more data:', error);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleVisualize = (flowData) => {
    setSelectedFlowData(flowData);
    setShowVisualization(true);
  };

  const handleCloseVisualization = () => {
    setShowVisualization(false);
    setSelectedFlowData(null);
  };

  const handleThreadSelect = (threadId, subThreadId) => {
    setSelectedThreadId(threadId);
    setSelectedSubThreadId(subThreadId || threadId || null);
  };

  const threadHandler = (threadId, item, value) => {
    if (value === 'visualize') {
      handleVisualize(item?.agent_flow);
      return;
    }

    // Open ChatDetails slider for AI Config, Variables, System Prompt, More
    setSelectedItem({ variables: item.variables, ...item, value });
    setIsSliderOpen(true);
  };

  const currentThread = historyData.find((thread) => thread.thread_id === selectedThreadId);
  const currentMessages = threadData || [];

  const formatDateAndTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (showVisualization) {
    return (
      <div className="h-full bg-base-100">
        <OrchestraFlowVisualization
          flowData={selectedFlowData}
          onBack={handleCloseVisualization}
          onClose={handleCloseVisualization}
          showControls={true}
          params={params}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-base-100 flex">
      <OrchestraSidebar
        historyData={historyData}
        threadHandler={(threadId, item, action) => {
          if (action === 'select-subthread') {
            handleThreadSelect(threadId, item?.sub_thread_id);
          } else {
            handleThreadSelect(threadId, threadId);
          }
        }}
        fetchMoreData={fetchMoreData}
        hasMore={hasMore}
        loading={isFetchingMore}
        params={params}
        searchParams={searchParams}
        setSearchMessageId={() => {}}
        setPage={() => {}}
        setHasMore={() => {}}
        filterOption="all"
        setFilterOption={() => {}}
        searchRef={null}
        setIsFetchingMore={() => {}}
        setThreadPage={() => {}}
        threadPage={1}
        hasMoreThreadData={false}
        setHasMoreThreadData={() => {}}
        selectedVersion="latest"
        setIsErrorTrue={() => {}}
        isErrorTrue={false}
      />

      <div className="flex-1 flex flex-col">
        

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-base-300 rounded w-1/4"></div>
                      <div className="h-20 bg-base-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mb-4 text-sm text-error">
              {error}
            </div>
          ) : currentMessages.length > 0 ? (
            <div className="space-y-4">
              {currentMessages.map((item, index) => (
                <OrchestraThreadItem
                  key={`thread-item-${item?.id || index}`}
                  params={params}
                  index={index}
                  item={item}
                  thread={currentMessages}
                  threadHandler={threadHandler}
                  formatDateAndTime={formatDateAndTime}
                  integrationData={{}}
                  threadRefs={threadRefs}
                  searchMessageId={null}
                  setSearchMessageId={() => {}}
                  onVisualize={handleVisualize}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-base-content/40 mb-4">
                <MessageSquare size={48} />
              </div>
              <h3 className="text-lg font-medium text-base-content/60 mb-2">
                {currentThread ? 'No messages yet' : 'Select a conversation'}
              </h3>
              <p className="text-sm text-base-content/40">
                {currentThread
                  ? 'This conversation thread is empty.'
                  : 'Choose a thread from the sidebar to view orchestral agent interactions.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <ChatDetails 
        selectedItem={selectedItem} 
        setIsSliderOpen={setIsSliderOpen} 
        isSliderOpen={isSliderOpen} 
      />
    </div>
  );
};

export default OrchestraHistoryView;
