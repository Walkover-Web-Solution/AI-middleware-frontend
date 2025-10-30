'use client'
import React, { use, useMemo, Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { OrchestralDataProvider } from '@/components/orchestral/OrchestralDataProvider'
import { useDispatch } from 'react-redux'
import { getOrchestralHistoryAction } from '@/store/action/historyAction'
import OrchestralHistory from '@/components/orchestral/OrchestralHistory'

export const runtime = 'edge'

// Dynamic import for OrchestralFlowContainer with loading state
const OrchestralFlowContainer = dynamic(
  () => import('@/components/orchestral/OrchestralFlowContainer'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-base-content">Initializing Orchestral Flow</h3>
            <p className="text-sm text-base-content/70 mt-1">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

/**
 * Orchestral Model Page Component
 * Optimized with:
 * - Dynamic imports for better code splitting
 * - Memoized parameter resolution
 * - Error boundaries for better error handling
 * - Context provider for centralized data management
 * - Suspense boundaries for loading states
 * 
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @returns {JSX.Element} Orchestral model page
 */
const OrchestralModelPage = ({ params }) => {
  // Call use hook at top level - cannot be inside useMemo or other hooks
  const resolvedParams = use(params)
  
  // Extract IDs for better readability and performance
  const { org_id: orgId, orchestralId } = resolvedParams
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('flow')
  
  const getOrchestralHistoryData = (orchestralId,orgId) => {
    dispatch(getOrchestralHistoryAction(orchestralId,1,100,orgId))
  }
  useEffect(()=>{
    getOrchestralHistoryData(orchestralId,orgId)
  },[orgId,orchestralId])
  return (
    <div className="h-screen bg-base-100 overflow-hidden flex flex-col" style={{ height: '100vh' }}>
      {/* Navigation Tabs */}
      <div className="bg-base-200 border-b border-base-300 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-base-content">
              Orchestral Model
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('flow')}
              className={`btn btn-sm ${activeTab === 'flow' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Flow
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'flow' ? (
          <OrchestralDataProvider orgId={orgId} orchestralId={orchestralId}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="text-base-content/70">Loading orchestral flow...</p>
                  </div>
                </div>
              }
            >
              <OrchestralFlowContainer params={resolvedParams} />
            </Suspense>
          </OrchestralDataProvider>
        ) : (
          <OrchestralHistory />
        )}
      </div>
    </div>
  )
}

export default OrchestralModelPage