import { CircleChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ThreadItem from './threadItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { scrollToBottom, scrollToTop } from './assistFile';
import { useDispatch } from 'react-redux';
import { getThread } from '@/store/action/historyAction';
import { useCustomSelector } from '@/customHooks/customSelector';
import { useRouter } from "next/navigation";

const ThreadContainer = ({ thread, filterOption, selectedThread, isFetchingMore, setIsFetchingMore, searchMessageId, setSearchMessageId, params, pathName, search, historyData, setSelectedThread, threadHandler, setLoading, threadPage, setThreadPage, hasMoreThreadData, setHasMoreThreadData, selectedSubThreadId}) => {

  const integrationData  = useCustomSelector(state => state?.bridgeReducer?.org?.[params?.org_id]?.integrationData) || {};
  const historyRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const contentRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const threadRefs = useRef({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [flexDirection, setFlexDirection] = useState("column");
  const [threadMessageState, setThreadMessageState] = useState();
  
  useEffect(() => {
    const fetchData = async () => {
      const thread_id = search?.get("thread_id");
      const startDate = search?.get("start");
      const endDate = search?.get("end");
      let result;
      let url;
      setThreadPage(1);

      const fetchThread = async (threadId) => {
        setSelectedThread(threadId);
        result = await dispatch(getThread({ threadId, bridgeId: params?.id, nextPage: 1, user_feedback: filterOption }));
        return result;
      };

      if (thread_id && historyData?.some(history => history?.thread_id === thread_id)) {
        await fetchThread(thread_id);
      } else if (historyData?.length > 0) {
        const firstThreadId = historyData?.[0]?.thread_id;
        await fetchThread(firstThreadId);
        url = `${pathName}?version=${params?.version}&thread_id=${firstThreadId}`;
        if (startDate && endDate) {
          url += `&start=${startDate}&end=${endDate}`;
        }
        router.push(url, undefined, { shallow: true });
      }

      setThreadMessageState({ totalPages: result?.totalPages, totalEntries: result?.totalEnteries });
      setHasMoreThreadData(result?.data?.length >= 40);
      setIsFetchingMore(false);
      setLoading(false);
    };

    fetchData();
  }, [filterOption, search]);

  const fetchMoreThreadData = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    previousScrollHeightRef.current = historyRef?.current?.scrollHeight;
    const nextPage = threadPage + 1;
    const result = await dispatch(getThread({ threadId: selectedThread, bridgeId: params?.id,subThreadId:selectedSubThreadId, nextPage, user_feedback: filterOption }));
    setThreadPage(nextPage);
    setHasMoreThreadData(result?.data?.length >= 40);
    if (!result || result?.data?.length < 40) {
      setSearchMessageId(null);
    }
    setIsFetchingMore(false);
  }, [filterOption, hasMoreThreadData, isFetchingMore, threadPage, selectedThread, selectedSubThreadId]);

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
                  />
                ))}
            </div>
          </InfiniteScroll>
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
    </div>
  );
};

export default ThreadContainer;