'use client'
import React, { use, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import OrchestralErrorBoundary from '@/components/orchestral/OrchestralErrorBoundary'
import { OrchestralDataProvider } from '@/components/orchestral/OrchestralDataProvider'

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

  return (
    <div className="h-screen bg-base-100 overflow-hidden" style={{ height: '100vh' }}>
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
    </div>
  )
}

export default OrchestralModelPage