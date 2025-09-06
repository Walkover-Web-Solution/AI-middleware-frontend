'use client'
import AgentToAgentConnection from '@/components/agentToAgentConnection'
import { createNodesFromAgentDoc } from '@/components/flowDataManager'
import { useCustomSelector } from '@/customHooks/customSelector'
import React, { use } from 'react'

export const runtime = 'edge'

const page = ({ params }) => {
  const resolvedParams = use(params);
  const orchestralFlowData = useCustomSelector((state) =>
    state.orchestralFlowReducer.orchetralFlowData[resolvedParams.org_id] || []
  );
  const orchestralData = orchestralFlowData.find((item) => item._id === resolvedParams?.orchestralId)
  const updatedData = createNodesFromAgentDoc(orchestralData?.data ? orchestralData?.data : orchestralData)
  const discardedData = createNodesFromAgentDoc(orchestralData)
  return (
    <div style={{ height: '100vh' }}>
      <AgentToAgentConnection params={resolvedParams} orchestralData={updatedData} name={orchestralData.flow_name} description={orchestralData.flow_description} createdFlow={true} isDrafted={orchestralData.status === 'draft'} discardedData={discardedData}/>
    </div>
  )
}

export default page