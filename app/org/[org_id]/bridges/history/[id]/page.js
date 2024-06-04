"use client"
import Protected from '@/components/protected'
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customSelector/customSelector';
import { getHistoryAction, getThread } from '@/store/action/historyAction';
import { clearThreadData } from '@/store/reducer/historyReducer';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getSingleMessage } from '@/config';
import { CircleX } from 'lucide-react';

export const runtime = 'edge';

function Page({ params }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const dispatch = useDispatch();

  const { historyData, thread } = useCustomSelector(state => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
  }));

  const [selectedThread, setSelectedThread] = useState('');
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1); // Track the current page of data
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    const closeSliderOnEsc = (event) => {
      if (event.key === 'Escape') {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener('keydown', closeSliderOnEsc);

    return () => {
      document.removeEventListener('keydown', closeSliderOnEsc);
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const data = await dispatch(getHistoryAction(params.id, 1)); // Fetch the first page initially
      if (data && data.length < 10) {
        setHasMore(false); // No more data to load
      }
      setLoading(false);
    };
    fetchInitialData();
  }, [params.id]);

  const fetchMoreData = async () => {
    // debugger
    const nextPage = page + 1;
    setPage(nextPage);
    const result = await dispatch(getHistoryAction(params.id, nextPage));
    if (result.length < 10) {
      setHasMore(false); // No more data to load
    }
  };

  useEffect(() => {
    const thread_id = search.get('thread_id');
    if (thread_id) {
      setSelectedThread(thread_id);
      dispatch(getThread(thread_id, params.id));
    } else if (Array.isArray(historyData) && historyData.length > 0) {
      const firstThreadId = historyData[0].thread_id;
      setSelectedThread(firstThreadId);
      dispatch(getThread(firstThreadId, params.id));
      router.push(`${pathName}?thread_id=${firstThreadId}`, undefined, { shallow: true });
    }
  }, [search.get('thread_id'), params.id, historyData]);

  useEffect(() => {
    dispatch(clearThreadData());
  }, [params.id]);

  const threadHandler = async (thread_id, item) => {
    if (item?.role === 'user' && !thread_id) {
      try {
        const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.id });
        setSelectedItem({ 'System Prompt': systemPromptResponse, ...item });
        setIsSliderOpen(true);
      } catch (error) {
        console.error('Failed to fetch single message:', error);
      }
    } else if (item?.role !== 'assistant') {
      setSelectedThread(thread_id);
      router.push(`${pathName}?thread_id=${thread_id}`, undefined, { shallow: true });
    }
  };

  const dateAndTimeHandler = (created_at) => {
    const date = new Date(created_at);
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className='flex'>
      <div className='drawer lg:drawer-open'>
        <input id='my-drawer-2' type='checkbox' className='drawer-toggle' />
        <div className='drawer-content flex flex-col items-center justify-center'>
          <div className='w-full min-h-screen bg-base-200'>
            <div className='w-full text-start'>
              <div className='w-full'>
                {thread && thread.map((item, index) => (
                  <div key={item.id}>
                    <div className={`chat ${item.role === 'user' ? 'chat-start' : 'chat-end'}`}>
                      <div className='chat-header flex gap-2'>
                        {item.role.replaceAll('_', ' ')}
                        <time className='text-xs opacity-50'>{dateAndTimeHandler(item.createdAt)}</time>
                      </div>
                      <div
                        className={`${item.role === 'user' && 'cursor-pointer'} chat-bubble`}
                        onClick={() => threadHandler(item.thread_id, item)}
                      >
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='drawer-side border-r-4' id='sidebar'>
          <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
          {loading ? (
            <div className='flex justify-center items-center h-full'>
              {/* <p>Loading...</p> */}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={Array.isArray(historyData) ? historyData.length : 0}
              next={fetchMoreData}
              hasMore={true}
              loader={<h4></h4>}
              endMessage={
                <p style={{ textAlign: 'center' }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
              scrollableTarget='sidebar'
            >
              <ul className='menu p-4 w-80 min-h-full bg-base-200 text-base-content'>
                {Array.isArray(historyData) && historyData.map((item, index) => (
                  <li key={item.id} onClick={() => threadHandler(item.thread_id)}>
                    <a className={`${selectedThread === item.thread_id ? 'active' : ''} block overflow-hidden whitespace-nowrap text-ellipsis`}>
                      {item.thread_id}
                    </a>
                  </li>
                ))}
              </ul>
            </InfiniteScroll>
          )}
        </div>
      </div>
      <div
        className={`fixed inset-y-0 right-0 border-l-2 ${isSliderOpen ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto bg-base-200 transition-all duration-300 z-50`}
      >
        {selectedItem && (
          <aside className='flex w-full flex-col h-screen overflow-y-auto'>
            <div className=''>
              <ul>
                {selectedItem && (
                  <aside className='flex w-full flex-col h-screen overflow-y-auto bg-gray-50'>
                    <div className='p-4'>
                      <div className='flex justify-between items-center'>
                        <h2 className='text-xl font-semibold text-gray-800'>Chat Details</h2>
                        <button onClick={() => setIsSliderOpen(false)} className='btn'>
                          <CircleX size={16} />
                        </button>
                      </div>
                      <ul className='mt-4'>
                        {Object.entries(selectedItem).map(([key, value]) => {
                          if (!value || key === 'id' || key === 'org_id' || key === 'createdAt' || key === 'created_at' || key === 'chat_id') return null;

                          let displayValue;
                          if (typeof value === 'object' && value !== null) {
                            displayValue = <pre className='bg-gray-200 p-2 rounded text-sm overflow-x-auto'>{JSON.stringify(value, null, 2)}</pre>;
                          } else {
                            displayValue = value.toString();
                          }

                          return (
                            <li key={key} className='mb-2'>
                              <strong className='font-medium text-gray-700 capitalize'>{key}:</strong>
                              <span className='ml-2 text-gray-600'>{displayValue}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </aside>
                )}
              </ul>
              <button onClick={() => setIsSliderOpen(false)}>Close</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default Protected(Page);




