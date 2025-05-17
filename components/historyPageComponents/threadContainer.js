import { CircleChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ThreadItem from './threadItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { scrollToBottom, scrollToTop } from './assistFile';
import { useDispatch } from 'react-redux';
import { getThread } from '@/store/action/historyAction';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useRouter } from "next/navigation";
import { openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import AddTestCaseModal from '../modals/AddTestCaseModal';
import LoadingSpinner from '../loadingSpinner';
import HistoryPagePromptUpdateModal from '../modals/historyPagePromptUpdateModal';


const ThreadContainer = ({ thread, filterOption, isFetchingMore, setIsFetchingMore, searchMessageId, setSearchMessageId, params, pathName, search, historyData, threadHandler, setLoading, threadPage, setThreadPage, hasMoreThreadData, setHasMoreThreadData, selectedVersion, previousPrompt, isErrorTrue}) => {

  const integrationData = useCustomSelector(state => state?.bridgeReducer?.org?.[params?.org_id]?.integrationData) || {};
  const historyRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const contentRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const threadRefs = useRef({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [flexDirection, setFlexDirection] = useState("column");
  const [threadMessageState, setThreadMessageState] = useState();
  const [testCaseConversation, setTestCaseConversation] = useState([]);
  const [loadingData, setLoadingData] = useState(false); // New state for loading
  const [promotToUpdate, setPromptToUpdate] = useState(null);

  const handleAddTestCase = (item, index, variables = false) => {
    const conversation = [];
    let AiConfigForVariable = {};
    for (let i = index; i >= 0; i--) {
      if (thread[i].role === "user") {
        conversation.push(...(thread[i]?.AiConfig?.messages || []));
        AiConfigForVariable = thread[i]?.AiConfig ? thread[i]?.AiConfig : {};
        if (thread[i].id === item.id) {
          break;
        }
      }
    }
    conversation.push(item || {});
    setTestCaseConversation(conversation);
    if (variables) {
      return AiConfigForVariable;
    }
    openModal(MODAL_TYPE.ADD_TEST_CASE_MODAL);
  };
  

  useEffect(() => {
    let timeoutId;

    const fetchData = async () => {
      const thread_id = params?.thread_id;
      const startDate = search.get("start"); 
      const endDate = search.get("end");
      
      setThreadPage(1);
      setLoadingData(true);
      let result;
      let url;

      if(!thread_id && historyData &&  historyData?.length > 0) {
        const firstThreadId = historyData?.[0]?.thread_id;
        if (firstThreadId) {
          router.push(`${pathName}?version=${params?.version}&thread_id=${firstThreadId}&subThread_id=${firstThreadId}&error=${params?.error}`, undefined, { shallow: true });
          return;
        }
      }

      // Debounced thread fetching function
      const fetchThread = async (threadId) => {
        try {
          url = `${pathName}?version=${params?.version}&thread_id=${threadId}&subThread_id=${params?.subThread_id || threadId}&error=${params?.error}`;
          if (startDate && endDate) {
            url += `&start=${startDate}&end=${endDate}`;
          }

          // Add 500ms delay before making the request
          await new Promise(resolve => setTimeout(resolve, 500));

          result = await dispatch(getThread({
            threadId,
            bridgeId: params?.id,
            nextPage: 1,
            user_feedback: filterOption,
            subThreadId: params?.subThread_id || threadId,
            versionId: selectedVersion === "all" ? "" : selectedVersion,
            error: params?.error || isErrorTrue
          }));

          return result;
        } catch (error) {
          console.error("Error fetching thread:", error);
          setLoadingData(false);
          return null;
        }
      };
      // Only fetch if we have valid data
      if (thread_id && historyData?.some(history => history?.thread_id === thread_id)) {
        result = await fetchThread(thread_id);
      } 

      if (result) {
        setThreadMessageState({ 
          totalPages: result?.totalPages, 
          totalEntries: result?.totalEnteries 
        });
        setHasMoreThreadData(result?.data?.length >= 40);
      }

      setIsFetchingMore(false);
      setLoading(false);
      setLoadingData(false);
    };

    // Debounce the fetchData call
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };

  }, [params?.thread_id, filterOption,search, params?.subThread_id,  selectedVersion]);
  
  const fetchMoreThreadData = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    previousScrollHeightRef.current = historyRef?.current?.scrollHeight;
    const nextPage = threadPage + 1;
    const result = await dispatch(getThread({ threadId: params.thread_id, bridgeId: params?.id,subThreadId:params?.subThread_id, nextPage, user_feedback: filterOption, versionId: selectedVersion === "all" ? '' : selectedVersion}));
    setThreadPage(nextPage);
    setHasMoreThreadData(result?.data?.length >= 40);
    if (!result || result?.data?.length < 40) {
      setSearchMessageId(null);
    }
    setIsFetchingMore(false);
  }, [filterOption, hasMoreThreadData, isFetchingMore, threadPage, params.thread_id, params.subThread_id]);

  useLayoutEffect(() => {
    if (isFetchingMore && historyRef?.current && hasMoreThreadData) {
      const scrollDifference = historyRef?.current?.scrollHeight - previousScrollHeightRef?.current;
      historyRef.current.scrollTop += scrollDifference;
    }
  }, [thread]);

  useEffect(() => {
    if (historyRef?.current && threadPage === 1) {
      historyRef.current.scrollTop = historyRef?.current?.scrollHeight;
    }
  }, [threadPage]);

  useEffect(() => {
    if (historyRef?.current && contentRef?.current) {
      setFlexDirection(contentRef?.current?.clientHeight < historyRef?.current?.clientHeight ? "column" : "column-reverse");
    }
  }, [thread]);

  const handleScroll = useCallback(() => {
    if (!historyRef?.current) return;
    const { scrollTop, clientHeight } = historyRef?.current;
    setShowScrollToBottom(scrollTop + clientHeight < clientHeight);
  }, []);


  useEffect(() => {
    const handleEvent = (event) => {
      let data;
      if (event.data.type === "FRONT_END_ACTION")
        data = event?.data?.data
        if(data)
        {
          setPromptToUpdate(data?.prompt || data)
          openModal(MODAL_TYPE?.HISTORY_PAGE_PROMPT_UPDATE_MODAL)
        }
    }
    window.addEventListener('message', handleEvent);
  }, [])

  useEffect(() => {
    if (historyRef?.current) {
      historyRef?.current?.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      historyRef?.current?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToSearchedMessage = async (messageId) => {
    if (!messageId) {
      console.warn("Invalid messageId provided. Aborting scroll.");
      return;
    }

    const container = historyRef?.current;
    if (!container) {
      console.warn("No container available for scrolling.");
      return;
    }
    const MAX_ATTEMPTS = threadMessageState?.totalEntries / threadMessageState?.totalPages;
    const DELAY_MS = 100;

    const findMessageAndScroll = async (attempt = 1) => {
      const messageElement = threadRefs?.current?.[messageId];

      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      } else if (attempt < MAX_ATTEMPTS) {
        scrollToTop(historyRef, messageId);
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        await findMessageAndScroll(attempt + 1);
      } else {
        console.warn(`Message with ID ${messageId} not found after ${MAX_ATTEMPTS} attempts.`);
      }
    };
    findMessageAndScroll();
  };

  useEffect(() => {
    if (searchMessageId) {
      scrollToSearchedMessage(searchMessageId);
    }
  }, [searchMessageId]);

  useEffect(() => {
    if (!showScrollToBottom) {
      scrollToBottom(historyRef);
    }
  }, [thread, showScrollToBottom]);

  const formatDateAndTime = (created_at) => {
    const date = new Date(created_at);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="drawer-content flex flex-col items-center overflow-scroll justify-center">
      <div className="w-full min-h-screen">
        <div
          id="scrollableDiv"
          ref={historyRef}
          className="w-full text-start flex flex-col h-screen overflow-y-auto"
          style={{
            height: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: flexDirection,
          }}
        >
          {loadingData && (
            <div>
              <LoadingSpinner width="auto" height="999px" marginLeft='350px' marginTop='65px' />
            </div>
          )}
          {!loadingData && (!thread || thread.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">No history present</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={thread?.length}
              next={fetchMoreThreadData}
              hasMore={hasMoreThreadData}
              loader={<p></p>}
              scrollThreshold="250px"
              inverse={flexDirection === "column-reverse"}
              scrollableTarget="scrollableDiv"
            >
              <div
                ref={contentRef}
                className="pb-16 px-3 pt-4"
                style={{ width: "100%" }}
              >
                {thread &&
                  thread?.map((item, index) => (
                    <ThreadItem
                      key={index}
                      params={params}
                      index={index}
                      item={item}
                      threadHandler={threadHandler}
                      formatDateAndTime={formatDateAndTime}
                      integrationData={integrationData}
                      threadRefs={threadRefs}
                      searchMessageId={searchMessageId}
                      setSearchMessageId={setSearchMessageId}
                      handleAddTestCase={handleAddTestCase}
                    />
                  ))}
              </div>
            </InfiniteScroll>
          )}
        </div>

        {showScrollToBottom && (
          <button
            onClick={() => scrollToBottom(historyRef)}
            className="fixed bottom-16 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg z-10"
          >
            <CircleChevronDown size={24} />
          </button>
        )}
      </div>
      <AddTestCaseModal testCaseConversation={testCaseConversation} setTestCaseConversation={setTestCaseConversation} />
      <HistoryPagePromptUpdateModal params={params} promotToUpdate={promotToUpdate} previousPrompt={previousPrompt}/>
    </div>
  );
};

export default ThreadContainer;