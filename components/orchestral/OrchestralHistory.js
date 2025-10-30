'use client'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

const OrchestralHistory = () => {
  // Get orchestral history from Redux store
  const orchestralHistory = useSelector(state => state.historyReducer.orchestralHistory || [])
  const isLoading = useSelector(state => state.historyReducer.loading || false)
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef(null)
  
  // Auto-scroll to bottom when history loads or updates
  useEffect(() => {
    if (!isLoading && orchestralHistory.length > 0 && scrollContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }, 100)
    }
  }, [orchestralHistory, isLoading])
  
  // Reverse the history array to show newest at bottom
  const reversedHistory = [...orchestralHistory].reverse()

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  // Get agent name from agent ID
  const getAgentName = (agentId) => {
    return `Agent ${agentId.slice(-4)}`
  }

  // Parse function calls from response to show agent flow
  const parseFunctionCall = (response) => {
    if (typeof response !== 'string') return null
    
    const functionCallMatch = response.match(/Function call: (call_\w+)/i)
    if (functionCallMatch) {
      return functionCallMatch[1]
    }
    return null
  }

  // Get first user message from user object
  const getInitialUserMessage = (userObj) => {
    if (!userObj) return 'No message'
    const firstKey = Object.keys(userObj)[0]
    return userObj[firstKey] || 'No message'
  }

  // Get latency display from latency object
  const getLatencyDisplay = (latencyObj) => {
    if (!latencyObj) return null
    
    if (typeof latencyObj === 'number') {
      return `${latencyObj}ms`
    }
    
    if (typeof latencyObj === 'object') {
      // If it's an object, try to get the overall time or first available time
      if (latencyObj.over_all_time) {
        return `${latencyObj.over_all_time}ms`
      }
      if (latencyObj.model_execution_time) {
        return `${latencyObj.model_execution_time}ms`
      }
      // If no specific time found, return null to not display
      return null
    }
    
    return null
  }

  return (
    <div ref={scrollContainerRef} className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Orchestral History</h1>
          <p className="text-base-content/70">
            View conversation history and agent interactions for this orchestral model
          </p>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/70">Loading orchestral history...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orchestralHistory.length === 0 && (
          <div className="bg-base-200 rounded-lg p-8 text-center">
            <div className="text-base-content/50 text-lg mb-2">No History Found</div>
            <p className="text-base-content/40">No orchestral conversations have been recorded yet.</p>
          </div>
        )}

        {/* History Items */}
        {!isLoading && orchestralHistory.length > 0 && (
          <div className="space-y-6">
            {reversedHistory.map((historyItem, index) => (
              <div key={historyItem.id || index} className="bg-base-200 rounded-lg border border-base-300">
                {/* Conversation Header */}
                <div className="p-4 border-b border-base-300 bg-base-300/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-base-content text-lg">
                          Conversation #{historyItem.id}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          {formatDate(historyItem.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-base-content/60 bg-info/20 px-3 py-1 rounded-full">
                      {Object.keys(historyItem.response || {}).length} agents involved
                    </div>
                  </div>
                </div>

                {/* Initial User Message */}
                <div className="p-4 border-b border-base-300/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-content text-sm font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-base-content">User</span>
                        <span className="text-xs text-base-content/50">Initial Message</span>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-3 text-sm">
                        {getInitialUserMessage(historyItem.user)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent Flow */}
                <div className="p-4">
                  <div className="space-y-4">
                    {Object.entries(historyItem.response || {}).map(([agentId, response], agentIndex) => (
                      <div key={agentId} className="relative">
                        {/* Connection Line */}
                        {agentIndex > 0 && (
                          <div className="absolute left-4 -top-4 w-0.5 h-4 bg-base-300"></div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content text-xs font-bold">
                            A{agentIndex + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-base-content">
                                  {getAgentName(agentId)}
                                </span>
                                <span className="text-xs bg-info/20 text-info px-2 py-1 rounded">
                                  {historyItem.model_name?.[agentId] || 'Unknown Model'}
                                </span>
                                {getLatencyDisplay(historyItem.latency?.[agentId]) && (
                                  <span className="text-xs text-base-content/60">
                                    {getLatencyDisplay(historyItem.latency[agentId])}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* User Message to Agent */}
                            {historyItem.user?.[agentId] && (
                              <div className="mb-3">
                                <div className="text-xs text-base-content/60 mb-1">User → Agent:</div>
                                <div className="bg-accent/10 rounded p-2 text-sm border-l-2 border-accent/30">
                                  {historyItem.user[agentId]}
                                </div>
                              </div>
                            )}

                            {/* Agent Response */}
                            <div className="mb-3">
                              <div className="text-xs text-base-content/60 mb-1">Agent Response:</div>
                              <div className="bg-base-100 rounded p-3 text-sm border border-base-300">
                                {typeof response === 'string' ? response : JSON.stringify(response)}
                                
                                {/* Function Call Detection */}
                                {parseFunctionCall(response) && (
                                  <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
                                    <span className="text-warning font-medium">Function Call:</span> {parseFunctionCall(response)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Token Usage */}
                            {historyItem.tokens?.[agentId] && (
                              <div className="mb-3">
                                <div className="text-xs text-base-content/60 mb-1">Token Usage:</div>
                                <div className="bg-info/10 border border-info/20 rounded p-2 text-xs">
                                  {typeof historyItem.tokens[agentId] === 'object' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {historyItem.tokens[agentId].inputTokens && (
                                        <div><span className="font-medium">Input:</span> {historyItem.tokens[agentId].inputTokens}</div>
                                      )}
                                      {historyItem.tokens[agentId].outputTokens && (
                                        <div><span className="font-medium">Output:</span> {historyItem.tokens[agentId].outputTokens}</div>
                                      )}
                                      {historyItem.tokens[agentId].cachedTokens && (
                                        <div><span className="font-medium">Cached:</span> {historyItem.tokens[agentId].cachedTokens}</div>
                                      )}
                                      {historyItem.tokens[agentId].expectedCost && (
                                        <div><span className="font-medium">Cost:</span> ${historyItem.tokens[agentId].expectedCost}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span>{historyItem.tokens[agentId] || 'N/A'}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Error Display - Only show if error status is true */}
                            {historyItem.error?.[agentId]?.status === true && (
                              <div className="mb-3">
                                <div className="text-xs text-error mb-1">Error:</div>
                                <div className="bg-error/10 border border-error/20 rounded p-3 text-sm text-error">
                                  <div className="font-medium mb-1">Agent {getAgentName(agentId)} encountered an error:</div>
                                  {historyItem.error[agentId].message || 'Unknown error occurred'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrchestralHistory
