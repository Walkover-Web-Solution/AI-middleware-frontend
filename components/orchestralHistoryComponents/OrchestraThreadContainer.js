import React, { useRef } from 'react';
import OrchestraThreadItem from './OrchestraThreadItem';

const OrchestraThreadContainer = ({
  thread,
  filterOption,
  setFilterOption,
  isFetchingMore,
  setIsFetchingMore,
  setLoading,
  searchMessageId,
  setSearchMessageId,
  params,
  pathName,
  search,
  historyData,
  threadHandler,
  threadPage,
  setThreadPage,
  hasMoreThreadData,
  setHasMoreThreadData,
  selectedVersion,
  setIsErrorTrue,
  isErrorTrue,
  previousPrompt,
  onVisualize
}) => {
  const threadRefs = useRef({});

  const formatDateAndTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Messages */}
      <div className="flex-1 overflow-auto px-4 py-2">
        <div className="space-y-4">
          {thread?.map((item, index) => (
            <OrchestraThreadItem
              key={`thread-item-${item?.id || index}`}
              params={params}
              index={index}
              item={item}
              thread={thread}
              threadHandler={threadHandler}
              formatDateAndTime={formatDateAndTime}
              integrationData={{}}
              threadRefs={threadRefs}
              searchMessageId={searchMessageId}
              setSearchMessageId={setSearchMessageId}
              onVisualize={onVisualize}
            />
          ))}
        </div>

        {/* Loading indicator */}
        {isFetchingMore && (
          <div className="flex justify-center py-4">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        )}

        {/* No more data indicator */}
        {!hasMoreThreadData && thread?.length > 0 && (
          <div className="text-center py-4 text-base-content/60">
            <p className="text-sm">No more messages</p>
          </div>
        )}

        {/* Empty state */}
        {(!thread || thread.length === 0) && !isFetchingMore && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-base-content/40 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-base-content/60 mb-2">No orchestral history</h3>
            <p className="text-sm text-base-content/40">Start a conversation to see orchestral agent interactions here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrchestraThreadContainer;
