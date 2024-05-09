"use client"
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getHistoryAction, getThread } from '@/store/action/historyAction'
import { clearThreadData } from '@/store/reducer/historyReducer'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

/**
 * History Page
 * 
 * This page shows the conversations of a particular chatbot
 * This page is protected and can only be accessed with a valid session
 * 
 * @author Thanh Tuan <thanhtuan@sc.edu>
 */
function page({ params }) {
  /**
   * state:
   * - historyData: the array of thread_id of the chatbot
   * - thread: the messages of the selected thread
   * - selectedThread: the id of the selected thread
   */
  const { historyData, thread, } = useCustomSelector(
    (state) => ({
      historyData: state?.historyReducer?.history || [],
      thread: state?.historyReducer?.thread,
    })
  )

  /**
   * state:
   * - selectedThread: the id of the selected thread
   */
  const [selectedThread, setSelectedThread] = useState("")

  /**
   * Effect:
   * - get the history of the chatbot when the component mounts
   */
  useEffect(() => {
    dispatch(getHistoryAction(params.id))
  }, [historyData])

  /**
   * Effect:
   * - clear the selected thread when the chatbot changes
   */
  useEffect(() => {
    dispatch(clearThreadData())
  }, [params.id])

  /**
   * Handler:
   * - handle the click event to select a thread
   * @param {string} thread_id the id of the thread to select
   */
  const threadHandler = (thread_id) => {
    setSelectedThread(thread_id)
    dispatch(getThread(thread_id, params.id))
  }

  /**
   * Handler:
   * - format the date to a human readable format
   * @param {string} created_at the date to format
   * @returns {string} the formatted date
   */
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

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-US", options);
  }

  /**
   * Dispatch:
   * - get the history of the chatbot
   * - clear the selected thread
   * - get the selected thread
   */
  const dispatch = useDispatch()

  return (
    /**
     * Render:
     * - the sidebar
     * - the content of the selected thread
     */

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