"use client"
import Sidebar from '@/components/Sidebar'
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getHistoryAction, getThread } from '@/store/action/historyAction'
import { clearThreadData } from '@/store/reducer/historyReducer'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

function page({ params }) {

  const { historyData, thread } = useCustomSelector(
    (state) => ({
      historyData: state.historyReducer.history,
      thread: state?.historyReducer?.thread
    })
  )
  const [selectedThread, setSelectedThread] = useState("")

  useEffect(() => {
    dispatch(getHistoryAction(params.id))
  },[historyData])
  
  useEffect(() => {
    dispatch(clearThreadData())
  },[params.id])


  const threadHandler = (thread_id) => {
    setSelectedThread(thread_id)
    dispatch(getThread(thread_id, params.id))
  }




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

  const dispatch = useDispatch()
  return (
  
     
     <div className='flex'>
     <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <div className="w-full min-h-screen bg-base-200">
            <div className=" w-full text-start">
              <div className="w-full">
              {thread && thread.map((item, index) => (
                
                 item && (<div>
                    <div className={`chat ${item.role === 'user' ? "chat-start " : "chat-end"}`}>
                      <div className="chat-header flex gap-2">
                        {item.role.replaceAll("_", " ")}
                        <time className="text-xs opacity-50">{dateAndTimeHandler(item.createdAt)}</time>
                      </div>
                      <div className="chat-bubble">{item.content}</div>

                    </div>
                  
                  </div>)
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side border-r-4 ">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-40 min-h-full bg-base-200 text-base-content">
            {historyData.map((item, index) => (
              <li key={item.id} onClick={() => threadHandler(item.thread_id)}><a className={selectedThread === item.thread_id ? "active" : ""} >Thread {index + 1}</a></li>
            ))}
          </ul>
          
        </div>
         
      </div>
     </div>
      
    
   
  )
}

export default  Protected(page)