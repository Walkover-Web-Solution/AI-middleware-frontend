"use client"
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getHistoryAction, getThread } from '@/store/action/historyAction'
import { clearThreadData } from '@/store/reducer/historyReducer'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

function page({ params }) {

  const search = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()
  const dispatch = useDispatch()

  const { historyData, thread } = useCustomSelector(state => ({
    historyData: state?.historyReducer?.history || [],
    thread: state?.historyReducer?.thread,
  }))

  const [selectedThread, setSelectedThread] = useState("")

  // Fetch history data only once or when params.id changes
  useEffect(() => {
    dispatch(getHistoryAction(params.id))
  }, [params.id])

  // Fetch thread data only when thread_id changes
  useEffect(() => {
    const thread_id = search.get('thread_id');
    if (thread_id) {
      setSelectedThread(thread_id);
      dispatch(getThread(thread_id, params.id));
    } else if (historyData.length > 0) {
      const firstThreadId = historyData[0].thread_id;
      setSelectedThread(firstThreadId);
      dispatch(getThread(firstThreadId, params.id));
      router.push(`${pathName}?thread_id=${firstThreadId}`, undefined, { shallow: true });
    }
  }, [search.get('thread_id'), params.id])

  useEffect(() => {
    dispatch(clearThreadData())
  }, [params.id])

  const threadHandler = (thread_id) => {
    setSelectedThread(thread_id);
    router.push(`${pathName}?thread_id=${thread_id}`, undefined, { shallow: true });
  };

  const dateAndTimeHandler = (created_at) => {
    const date = new Date(created_at);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", options);
  }

  return (


    historyData.length > 0 ?
      <div className='flex'>
        <div className="drawer lg:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center justify-center">
            <div className="w-full min-h-screen bg-base-200">
              <div className=" w-full text-start">
                <div className="w-full">
                  {/* render the messages of the selected thread */}
                  {thread && thread.map((item, index) => (
                    <div key={item.id}>
                      <div className={`chat ${item.role === 'user' ? "chat-start " : "chat-end"}`}>
                        <div className="chat-header flex gap-2">
                          {/* render the role of the user */}
                          {item.role.replaceAll("_", " ")}
                          {/* render the timestamp of the message */}
                          <time className="text-xs opacity-50">{dateAndTimeHandler(item.createdAt)}</time>
                        </div>
                        <div className="chat-bubble">{item.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="drawer-side border-r-4 ">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
              {/* render the list of thread_id of the chatbot */}
              {historyData.map((item, index) => (
                <li key={item.id} onClick={() => threadHandler(item.thread_id)}>
                  {/* render the selected thread with class "active" and apply Tailwind CSS for text ellipsis */}
                  <a className={`${selectedThread === item.thread_id ? "active" : ""} block overflow-hidden whitespace-nowrap text-ellipsis`}>
                    {item.thread_id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div> :
      <div className='flex items-center justify-center h-screen'>
        <p className='text-xl'> No History Present </p>
      </div>
  )
}

export default Protected(page)