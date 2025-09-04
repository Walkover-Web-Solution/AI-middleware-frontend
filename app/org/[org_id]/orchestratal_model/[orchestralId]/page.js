'use client'
import AgentToAgentConnection from '@/components/agentToAgentConnection'
import { createNodesFromAgentDoc } from '@/components/flowDataManager'
import { useCustomSelector } from '@/customHooks/customSelector'
import React from 'react'

export const runtime = 'edge'

const page = ({ params }) => {
  const orchestralFlowData = useCustomSelector((state) =>
    state.orchestralFlowReducer.orchetralFlowData[params.org_id] || []
  );
  const orchestralData = orchestralFlowData.find((item) => item._id === params?.orchestralId)
  const updatedData = createNodesFromAgentDoc(orchestralData?.data ? orchestralData?.data : orchestralData)
  return (
    <div style={{ height: '100vh' }}>
      <AgentToAgentConnection params={params} orchestralData={updatedData} name={orchestralData.flow_name} description={orchestralData.flow_description} createdFlow={true} isDrafted={orchestralData.status === 'draft'}/>
    </div>
  )
}

export default page