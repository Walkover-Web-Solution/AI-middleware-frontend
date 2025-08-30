'use client'
import AgentToAgentConnection from '@/components/agentToAgentConnection'
import LoadingSpinner from '@/components/loadingSpinner';
import React, { useState } from 'react'

export const runtime = 'edge';

const page = ({ params }) => {

  const [loading, setIsLoading] = useState(false);
  return loading ? <LoadingSpinner/> : <AgentToAgentConnection params={params} setIsLoading={setIsLoading}/>
}

export default page