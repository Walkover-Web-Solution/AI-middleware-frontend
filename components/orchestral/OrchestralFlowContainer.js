import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useOrchestralDataContext } from './OrchestralDataProvider';

// Dynamic import for AgentToAgentConnection with loading state
const AgentToAgentConnection = dynamic(
  () => import('@/components/agentToAgentConnection'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70">Loading orchestral flow...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

/**
 * Loading component for orchestral flow
 */
const OrchestralFlowLoading = () => (
  <div className="flex items-center justify-center h-full bg-base-100">
    <div className="flex flex-col items-center gap-4">
      <div className="loading loading-spinner loading-lg text-primary"></div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-base-content">Loading Orchestral Flow</h3>
        <p className="text-sm text-base-content/70 mt-1">Preparing your agent connections...</p>
      </div>
    </div>
  </div>
);

/**
 * Error component for orchestral flow
 */
const OrchestralFlowError = ({ orchestralId }) => (
  <div className="flex items-center justify-center h-full bg-base-100">
    <div className="text-center max-w-md">
      <div className="text-error text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-base-content mb-2">
        Orchestral Flow Not Found
      </h3>
      <p className="text-base-content/70 mb-4">
        The orchestral flow with ID "{orchestralId}" could not be found.
      </p>
      <button 
        className="btn btn-primary"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Container component for orchestral flow
 * Handles loading states, error states, and renders the main flow component
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @returns {JSX.Element} Container component
 */
export const OrchestralFlowContainer = ({ params }) => {
  const {
    orchestralData,
    updatedData,
    discardedData,
    orchestralMetadata,
    isLoading,
    hasError
  } = useOrchestralDataContext();

  // Show loading state
  if (isLoading) {
    return <OrchestralFlowLoading />;
  }

  // Show error state
  if (hasError) {
    return <OrchestralFlowError orchestralId={params.orchestralId} />;
  }
  
  // Show main flow component
  return (
    <Suspense fallback={<OrchestralFlowLoading />}>
      <AgentToAgentConnection
        params={params}
        orchestralData={updatedData || orchestralData} // Fallback to raw data if processing fails
        name={orchestralMetadata.name || 'Orchestral Flow'}
        description={orchestralMetadata.description || ''}
        createdFlow={true}
        setIsLoading={() => {}} // Add missing setIsLoading prop
        isDrafted={orchestralMetadata.isDrafted || false}
        discardedData={discardedData || orchestralData}
        isEmbedUser={false} // Add missing isEmbedUser prop
      />
    </Suspense>
  );
};

export default OrchestralFlowContainer;
