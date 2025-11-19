import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, memo } from 'react';
import { useParams, usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import { CircleDownIcon } from '@/components/Icons';
import ThreadItem from './threadItem';
import { scrollToBottom, scrollToTop } from './assistFile';
import { getThread, updateContentHistory } from '@/store/action/historyAction';
import { useCustomSelector } from '@/customHooks/customSelector';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import AddTestCaseModal from '../modals/AddTestCaseModal';
import HistoryPagePromptUpdateModal from '../modals/historyPagePromptUpdateModal';
import { ChatLoadingSkeleton } from './ChatLayoutLoader';
import { clearThreadData } from '@/store/reducer/historyReducer';
import EditMessageModal from '../modals/EditMessageModal';
import { improvePrompt } from '@/config';

// Constants
const PAGE_SIZE = 40;
const SCROLL_BOTTOM_THRESHOLD = 16;

/**
 * Optimized ThreadContainer Component
 * - Reduced re-renders with better memoization
 * - Fixed pagination issues
 * - Improved scroll performance
 * - Better state management
 */
const OptimizedThreadContainer = memo(({ 
  thread, 
  filterOption, 
  isFetchingMore, 
  setIsFetchingMore, 
  searchMessageId, 
  setSearchMessageId,
  pathName: pathNameProp, 
  search, 
  historyData, 
  threadHandler, 
  setLoading, 
  threadPage, 
  setThreadPage,
  hasMoreThreadData, 
  setHasMoreThreadData, 
  selectedVersion, 
  previousPrompt, 
  isErrorTrue
}) => {
  const routeParams = useParams();
  const orgId = routeParams?.org_id;
  const bridgeId = routeParams?.id;
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const threadIdFromURL = searchParamsHook.get('thread_id');
  const subThreadIdFromURL = searchParamsHook.get('subThread_id');
  const versionFromURL = searchParamsHook.get('version');
  const errorFromURL = searchParamsHook.get('error');

  const dispatch = useDispatch();
  
  // Memoized selector to prevent unnecessary re-renders
  const integrationData = useCustomSelector(
    (state) => state?.bridgeReducer?.org?.[orgId]?.integrationData,
    [orgId]
  ) || {};

  // Refs
  const historyRef = useRef(null);
  const contentRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const threadRefs = useRef({});
  const isMountedRef = useRef(false);

  // State
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [flexDirection, setFlexDirection] = useState('column');
  const [threadMessageState, setThreadMessageState] = useState();
  const [testCaseConversation, setTestCaseConversation] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [promotToUpdate, setPromptToUpdate] = useState(null);
  const [modalInput, setModalInput] = useState(null);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState({});

  // Memoized thread data to prevent unnecessary re-renders
  const memoizedThread = useMemo(() => thread || [], [thread]);
  const memoizedHistoryData = useMemo(() => historyData || [], [historyData]);

  // Memoized date formatter
  const formatDateAndTime = useCallback((created_at) => {
    const date = new Date(created_at);
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', options);
  }, []);

  // Memoized test case handler
  const handleAddTestCase = useCallback((item, index, variables = false) => {
    const conversation = [];
    let AiConfigForVariable = {};

    for (let i = index; i >= 0; i--) {
      if (memoizedThread[i].role === 'user') {
        const aiConfigConversation = memoizedThread[i]?.AiConfig?.input || memoizedThread[i]?.AiConfig?.messages || [];
        conversation.push(...aiConfigConversation);
        AiConfigForVariable = memoizedThread[i]?.AiConfig ? memoizedThread[i]?.AiConfig : {};
        if (memoizedThread[i + 1]?.role === 'tools_call') {
          conversation.push(memoizedThread[i + 1])
        }
        if (memoizedThread[i]?.AiConfig && (memoizedThread[i]?.AiConfig?.input || memoizedThread[i]?.AiConfig?.messages)) {
          break;
        }
      }
    }

    conversation.push(item || {});
    setTestCaseConversation(conversation);
    if (variables) return AiConfigForVariable;
    openModal(MODAL_TYPE.ADD_TEST_CASE_MODAL);
  }, [memoizedThread]);

  // Optimized save handler
  const handleSave = useCallback(() => {
    if (!modalInput?.content?.trim()) {
      alert('Message cannot be empty.');
      return;
    }
    const result = dispatch(
      updateContentHistory({
        id: modalInput?.Id,
        bridge_id: bridgeId ?? orgId,
        message: modalInput.content,
        index: modalInput.index,
      })
    );
    setModalInput('');
    closeModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  }, [modalInput, dispatch, bridgeId, orgId]);

  // Optimized prompt improvement
  const handleImprovePrompt = useCallback(async () => {
    setIsImprovingPrompt(true);
    try {
      let prevConv;
      const variables = {};
      memoizedThread.forEach((item) => {
        if (item.Id === modalInput?.Id) {
          const conversation = prevConv?.AiConfig?.input || prevConv.AiConfig?.messages
          const filteredConversation = conversation.filter((value) => {
            if (value.role === 'developer') {
              variables['prompt'] = value.content;
            }
            return value.role !== 'developer';
          })
          filteredConversation.push({
            role: 'assistant',
            content: modalInput.originalContent
          })
          variables["conversation_history"] = filteredConversation;
        }
        item.role === 'user' ? prevConv = item : null
      })
      variables["updated_response"] = modalInput.content;
      let data;
      try {
        data = await improvePrompt(variables)
      } catch (error) {
        console.error(error)
      }
      if (data) {
        setPromptToUpdate(data?.updated_prompt)
        setGeneratedPrompts(prev => ({
          ...prev,
          [modalInput?.Id]: data?.updated_prompt
        }));
        openModal(MODAL_TYPE?.HISTORY_PAGE_PROMPT_UPDATE_MODAL)
      }
    } finally {
      setIsImprovingPrompt(false);
    }
  }, [modalInput, memoizedThread]);

  const handleClose = useCallback(() => {
    setModalInput('');
    closeModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  }, []);

  const handleShowGeneratedPrompt = useCallback(() => {
    if (modalInput?.Id && generatedPrompts[modalInput.Id]) {
      setPromptToUpdate(generatedPrompts[modalInput.Id]);
      closeModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
      openModal(MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL);
    }
  }, [modalInput, generatedPrompts]);

  const handleRegenerateFromModal = useCallback(async () => {
    if (!modalInput?.Id) return;
    setTimeout(() => {
      handleImprovePrompt();
    }, 100);
  }, [modalInput, handleImprovePrompt]);

  const handlePromptSaved = useCallback(() => {
    if (modalInput?.Id) {
      setGeneratedPrompts(prev => {
        const updated = { ...prev };
        delete updated[modalInput.Id];
        return updated;
      });
    }
  }, [modalInput]);

  // Optimized flex direction calculation
  const calcFlexDirection = useCallback(() => {
    if (historyRef.current && contentRef.current) {
      const newDirection = contentRef.current.clientHeight < historyRef.current.clientHeight
        ? 'column'
        : 'column-reverse';
      
      if (newDirection !== flexDirection) {
        setFlexDirection(newDirection);
      }
    }
  }, [flexDirection]);

  // Optimized scroll handler
  const handleScroll = useCallback(() => {
    const container = historyRef.current;
    if (!container) return;
    
    const { scrollTop, clientHeight, scrollHeight } = container;
    let nearBottom;
    
    if (flexDirection === 'column-reverse') {
      nearBottom = scrollTop <= SCROLL_BOTTOM_THRESHOLD && scrollTop >= -50;
    } else {
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      nearBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;
    }
    
    setShowScrollToBottom(!nearBottom);
  }, [flexDirection]);

  // Mount effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Flex direction effect
  useEffect(() => {
    calcFlexDirection();
  }, [memoizedThread, calcFlexDirection]);

  // Initial scroll effect
  useEffect(() => {
    if (historyRef.current && threadPage === 1) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [threadPage]);

  // Auto-scroll effect
  useEffect(() => {
    if (!showScrollToBottom) scrollToBottom(historyRef);
  }, [memoizedThread, showScrollToBottom]);

  // Memoized fetch function
  const fetchThread = useCallback(
    async ({
      threadId,
      subThreadId,
      version,
      error,
      page = 1,
    }) => {
      const result = await dispatch(
        getThread({
          threadId,
          bridgeId: bridgeId ?? orgId,
          nextPage: page,
          user_feedback: filterOption,
          subThreadId,
          versionId: selectedVersion === 'all' ? '' : selectedVersion,
          error: error || isErrorTrue,
        })
      );
      return result;
    },
    [dispatch, bridgeId, orgId, filterOption, selectedVersion, isErrorTrue]
  );

  // Initial load effect with debouncing
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      dispatch(clearThreadData());
      setLoadingData(true);

      const thread_id = threadIdFromURL;
      const subThreadId = subThreadIdFromURL || thread_id;
      const error = errorFromURL || isErrorTrue;
      const version = versionFromURL || '';

      // Navigate to first thread if none selected
      if (!thread_id && Array.isArray(memoizedHistoryData) && memoizedHistoryData.length > 0) {
        const firstThreadId = memoizedHistoryData[0]?.thread_id;
        if (firstThreadId) {
          const params = new URLSearchParams(searchParamsHook.toString());
          params.set('thread_id', firstThreadId);
          params.set('subThread_id', firstThreadId);
          if (version) params.set('version', version);
          if (error) params.set('error', String(error));
          params.set('navigated', 'true');
          router.push(`${pathNameProp || pathname}?${params.toString()}`, { scroll: false });
          setLoadingData(false);
          return;
        }
      }

      if (!thread_id || !memoizedHistoryData?.some((h) => h?.thread_id === thread_id)) {
        setLoadingData(false);
        return;
      }

      // Debounce to prevent rapid calls
      await new Promise((r) => setTimeout(r, 100));
      const res = await fetchThread({
        threadId: thread_id,
        subThreadId,
        version,
        error,
        page: 1,
      });

      if (cancelled || !isMountedRef.current) return;

      if (res) {
        setThreadMessageState({
          totalPages: res?.totalPages,
          totalEntries: res?.totalEnteries,
        });
        setHasMoreThreadData((res?.data?.length || 0) >= PAGE_SIZE);
      }

      setIsFetchingMore(false);
      setLoading(false);
      setLoadingData(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [threadIdFromURL, filterOption, memoizedHistoryData, errorFromURL, subThreadIdFromURL, fetchThread, dispatch, setLoadingData, setHasMoreThreadData, setIsFetchingMore, setLoading, pathNameProp, pathname, router, searchParamsHook, versionFromURL]);

  // Optimized fetch more function
  const fetchMoreThreadData = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    previousScrollHeightRef.current = historyRef.current?.scrollHeight || 0;

    const nextPage = (threadPage || 1) + 1;
    const res = await fetchThread({
      threadId: threadIdFromURL,
      subThreadId: subThreadIdFromURL || threadIdFromURL,
      version: versionFromURL || '',
      error: errorFromURL || isErrorTrue,
      page: nextPage,
    });

    setThreadPage(nextPage);
    const length = res?.data?.length || 0;
    setHasMoreThreadData(length >= PAGE_SIZE);
    if (!res || length < PAGE_SIZE) setSearchMessageId(null);
    setIsFetchingMore(false);
  }, [
    isFetchingMore,
    threadPage,
    fetchThread,
    threadIdFromURL,
    subThreadIdFromURL,
    versionFromURL,
    errorFromURL,
    isErrorTrue,
    setThreadPage,
    setHasMoreThreadData,
    setSearchMessageId,
    setIsFetchingMore,
  ]);

  // Maintain scroll position effect
  useLayoutEffect(() => {
    if (isFetchingMore && historyRef.current && hasMoreThreadData) {
      const diff = (historyRef.current.scrollHeight || 0) - previousScrollHeightRef.current;
      historyRef.current.scrollTop += diff;
    }
  }, [memoizedThread, isFetchingMore, hasMoreThreadData]);

  // Window message listener
  useEffect(() => {
    const handleEvent = (event) => {
      if (event?.data?.type !== 'FRONT_END_ACTION') return;
      const data = event?.data?.data;
      if (data) {
        setPromptToUpdate(data?.prompt || data);
        openModal(MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL);
      }
    };
    window.addEventListener('message', handleEvent);
    return () => window.removeEventListener('message', handleEvent);
  }, []);

  // Optimized scroll to searched message
  const scrollToSearchedMessage = useCallback(async (messageId) => {
    if (!messageId || !historyRef.current) return;

    const MAX_ATTEMPTS = threadMessageState?.totalPages || 1;
    const DELAY_MS = 100;

    const findMessageAndScroll = async (attempt = 1) => {
      const messageElement = threadRefs.current?.[messageId];
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (attempt < MAX_ATTEMPTS) {
        scrollToTop(historyRef, messageId);
        await new Promise((r) => setTimeout(r, DELAY_MS));
        await findMessageAndScroll(attempt + 1);
      }
    };

    findMessageAndScroll();
  }, [threadMessageState?.totalPages]);

  useEffect(() => {
    if (searchMessageId) scrollToSearchedMessage(searchMessageId);
  }, [searchMessageId, scrollToSearchedMessage]);

  // Memoized scroll handler
  const onScroll = useMemo(() => handleScroll, [handleScroll]);

  return (
    <div className="drawer-content flex flex-col items-center overflow-hidden justify-center">
      <div className="w-full min-h-screen">
        <div
          id="scrollableDiv"
          ref={historyRef}
          onScroll={onScroll}
          className="w-full text-start flex flex-col h-screen overflow-y-auto relative"
          style={{
            height: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection,
          }}
        >
          {/* Loading overlay */}
          {loadingData && (
            <div className="absolute inset-0 z-10 bg-base-100/80 backdrop-blur-sm">
              <ChatLoadingSkeleton />
            </div>
          )}

          {!loadingData && (!memoizedThread || memoizedThread.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">No history present</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={memoizedThread?.length || 0}
              next={fetchMoreThreadData}
              hasMore={!!hasMoreThreadData}
              loader={<p />}
              scrollThreshold="250px"
              inverse={flexDirection === 'column-reverse'}
              scrollableTarget="scrollableDiv"
            >
              <div ref={contentRef} className="pb-16 px-3 pt-4" style={{ width: '100%' }}>
                {memoizedThread.map((item, index) => (
                  <ThreadItem
                    key={`${item.Id || index}-${item.role || 'unknown'}`}
                    params={{ org_id: orgId, id: bridgeId }}
                    index={index}
                    item={item}
                    thread={memoizedThread}
                    threadHandler={threadHandler}
                    formatDateAndTime={formatDateAndTime}
                    integrationData={integrationData}
                    threadRefs={threadRefs}
                    searchMessageId={searchMessageId}
                    setSearchMessageId={setSearchMessageId}
                    handleAddTestCase={handleAddTestCase}
                    setModalInput={setModalInput}
                    modalInput={modalInput}
                  />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            onClick={() => scrollToBottom(historyRef)}
            className="fixed bottom-16 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg z-[5]"
            aria-label="Scroll to bottom"
          >
            <CircleDownIcon size={24} />
          </button>
        )}
      </div>

      {/* Modals */}
      <AddTestCaseModal
        testCaseConversation={testCaseConversation}
        setTestCaseConversation={setTestCaseConversation}
      />

      <HistoryPagePromptUpdateModal
        searchParams={Object.fromEntries(searchParamsHook.entries())}
        promotToUpdate={promotToUpdate}
        previousPrompt={previousPrompt}
        handleRegenerate={modalInput?.Id && generatedPrompts[modalInput?.Id] ? handleRegenerateFromModal : null}
        isRegenerating={isImprovingPrompt}
        onPromptSaved={handlePromptSaved}
      />

      <EditMessageModal
        setModalInput={setModalInput}
        handleClose={handleClose}
        handleSave={handleSave}
        modalInput={modalInput}
        handleImprovePrompt={handleImprovePrompt}
        isImprovingPrompt={isImprovingPrompt}
        hasGeneratedPrompt={modalInput?.Id && generatedPrompts[modalInput?.Id]}
        handleShowGeneratedPrompt={handleShowGeneratedPrompt}
      />
    </div>
  );
});

OptimizedThreadContainer.displayName = 'OptimizedThreadContainer';

export default OptimizedThreadContainer;
