'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { CircleDownIcon } from '@/components/Icons';
import ThreadItem from './threadItem';
import InfiniteScroll from 'react-infinite-scroll-component';
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

// ------------------------------------
// Constants
// ------------------------------------
const PAGE_SIZE = 40;
const SCROLL_BOTTOM_THRESHOLD = 16; // px

const ThreadContainer = ({ thread, filterOption, isFetchingMore, setIsFetchingMore, searchMessageId, setSearchMessageId,
  pathName: pathNameProp, search, historyData, threadHandler, setLoading, threadPage, setThreadPage,
  hasMoreThreadData, setHasMoreThreadData, selectedVersion, previousPrompt, isErrorTrue,
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
  const integrationData = useCustomSelector(
    (state) => state?.bridgeReducer?.org?.[orgId]?.integrationData
  ) || {};

  const historyRef = useRef(null);
  const contentRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const threadRefs = useRef({});
  const isMountedRef = useRef(false);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [flexDirection, setFlexDirection] = useState('column');
  const [threadMessageState, setThreadMessageState] = useState();
  const [testCaseConversation, setTestCaseConversation] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [promotToUpdate, setPromptToUpdate] = useState(null);
  const [modalInput, setModalInput] = useState(null);
  const [updateMessageAgentVariables, setUpdateMessageAgentVariables] = useState([]);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);

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

  const handleAddTestCase = useCallback((item, index, variables = false) => {
    const conversation = [];
    let AiConfigForVariable = {};

    for (let i = index; i >= 0; i--) {
      if (thread[i].role === 'user') {
        conversation.push(...(thread[i]?.AiConfig?.messages || []));
        AiConfigForVariable = thread[i]?.AiConfig ? thread[i]?.AiConfig : {};
        if (thread[i].id === item.id) break;
      }
    }

    conversation.push(item || {});
    setTestCaseConversation(conversation);
    if (variables) return AiConfigForVariable;
    openModal(MODAL_TYPE.ADD_TEST_CASE_MODAL);
  }, [thread]);

  const handleSave = useCallback(() => {
    if (!modalInput?.content?.trim()) {
      alert('Message cannot be empty.');
      return;
    }
    const result = dispatch(
      updateContentHistory({
        id: modalInput?.Id,
        bridge_id: bridgeId ?? orgId, // prefer explicit bridgeId, fallback to orgId if needed
        message: modalInput.content,
        index: modalInput.index,
      })
    );
    setModalInput('');
    closeModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  }, [modalInput, dispatch, bridgeId, orgId, thread]);

  const handleImprovePrompt = async () => {
    setIsImprovingPrompt(true);
    try {
      let prevConv;
      const variables = {};
      thread.forEach((item) => {
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
        openModal(MODAL_TYPE?.HISTORY_PAGE_PROMPT_UPDATE_MODAL)
      }
    } finally {
      setIsImprovingPrompt(false);
    }
  }

  const handleClose = useCallback(() => {
    setModalInput('');
    closeModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  }, []);

  const calcFlexDirection = useCallback(() => {
    if (historyRef.current && contentRef.current) {
      setFlexDirection(
        contentRef.current.clientHeight < historyRef.current.clientHeight
          ? 'column'
          : 'column-reverse'
      );
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = historyRef.current;
    if (!container) return;
    const { scrollTop, clientHeight, scrollHeight } = container;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_BOTTOM_THRESHOLD;
    setShowScrollToBottom(!nearBottom);
  }, []);

  // ------------------------------------
  // Effects: mount / cleanup
  // ------------------------------------
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    calcFlexDirection();
  }, [thread, calcFlexDirection]);

  // Attach scroll listener via onScroll prop in JSX, but ensure first bottom snap
  useEffect(() => {
    if (historyRef.current && threadPage === 1) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [threadPage]);

  // Keep auto-scroll on new messages when already near bottom
  useEffect(() => {
    if (!showScrollToBottom) scrollToBottom(historyRef);
  }, [thread, showScrollToBottom]);

  // ------------------------------------
  // Fetch logic (debounced + stale guard)
  // ------------------------------------
  const startDate = search?.start;
  const endDate = search?.end;
  const pathName = pathNameProp || pathname;

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

  // Initial load + handle URL thread_id changes
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      dispatch(clearThreadData());
      setLoadingData(true);

      const thread_id = threadIdFromURL;
      const subThreadId = subThreadIdFromURL || thread_id;
      const error = errorFromURL || isErrorTrue;
      const version = versionFromURL || '';

      // If no thread selected, navigate to the first one from historyData
      if (!thread_id && Array.isArray(historyData) && historyData.length > 0) {
        const firstThreadId = historyData[0]?.thread_id;
        if (firstThreadId) {
          const params = new URLSearchParams(searchParamsHook.toString());
          params.set('thread_id', firstThreadId);
          params.set('subThread_id', firstThreadId);
          if (version) params.set('version', version);
          if (error) params.set('error', String(error));
          params.set('navigated', 'true');
          router.push(`${pathName}?${params.toString()}`, { scroll: false });
          setLoadingData(false);
          return;
        }
      }

      if (!thread_id || !historyData?.some((h) => h?.thread_id === thread_id)) {
        setLoadingData(false);
        return;
      }

      // small debounce to absorb rapid filter/URL changes
      await new Promise((r) => setTimeout(r, 150));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadIdFromURL, filterOption, historyData, errorFromURL, subThreadIdFromURL]);

  // Fetch more (pagination)
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

  // Maintain scroll position when more items prepended in column-reverse mode
  useLayoutEffect(() => {
    if (isFetchingMore && historyRef.current && hasMoreThreadData) {
      const diff = (historyRef.current.scrollHeight || 0) - previousScrollHeightRef.current;
      historyRef.current.scrollTop += diff;
    }
    // re-run when thread changes because new messages appended
  }, [thread, isFetchingMore, hasMoreThreadData]);

  // Show/hide "scroll to bottom" button
  const onScroll = handleScroll; // stable

  // Window message listener (with cleanup)
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

  // Scroll to searched message
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
          {/* Loading skeleton overlay */}
          {loadingData && (
            <div className="absolute inset-0 z-10 bg-base-100/80 backdrop-blur-sm">
              <ChatLoadingSkeleton />
            </div>
          )}

          {!loadingData && (!thread || thread.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">No history present</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={thread?.length || 0}
              next={fetchMoreThreadData}
              hasMore={!!hasMoreThreadData}
              loader={<p />}
              scrollThreshold="250px"
              inverse={flexDirection === 'column-reverse'}
              scrollableTarget="scrollableDiv"
            >
              <div ref={contentRef} className="pb-16 px-3 pt-4" style={{ width: '100%' }}>
                {Array.isArray(thread) &&
                  thread.map((item, index) => (
                    <ThreadItem
                      key={index}
                      params={{ org_id: orgId, id: bridgeId }}
                      index={index}
                      item={item}
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

      <AddTestCaseModal
        testCaseConversation={testCaseConversation}
        setTestCaseConversation={setTestCaseConversation}
      />

      <HistoryPagePromptUpdateModal
        searchParams={Object.fromEntries(searchParamsHook.entries())}
        promotToUpdate={promotToUpdate}
        previousPrompt={previousPrompt}
      />

      <EditMessageModal
        setModalInput={setModalInput}
        handleClose={handleClose}
        handleSave={handleSave}
        modalInput={modalInput}
        handleImprovePrompt={handleImprovePrompt}
        isImprovingPrompt={isImprovingPrompt}
      />
    </div>
  );
};

export default ThreadContainer;
