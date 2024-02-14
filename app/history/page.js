"use client"
import { getHistoryAction, getThread } from '@/store/action/historyAction'
import React from 'react'
import { useDispatch } from 'react-redux'

export default function page () {
    const dispatch = useDispatch()
  return (
    <div>
      <button onClick={()=> dispatch(getHistoryAction())}>get History</button>
      <button onClick={()=> dispatch(getThread())}>get Thread</button>

    </div>
  )
}

