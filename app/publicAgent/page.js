'use client'
import PublicAgent from '@/components/configuration/Agent/publicAgent';
import { getAgentsApi, publicAgentLogin } from '@/config'
import React, { useEffect, useState } from 'react'

const Layout = () => {
  const [token, setToken] = useState(null);
  const [agents, setAgents] = useState(null);
  
  useEffect(() => {
    const fetchToken = async () => {
      const response = await publicAgentLogin();
      setToken(response?.data?.token);
    };
    fetchToken();
  }, []);
  
  useEffect(() => {
    let timer;
    const fetchAgents = async () => {
      const response = await getAgentsApi();
      setAgents(response?.data)
    };
    
    timer = setTimeout(fetchAgents, 2000);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div>
        {agents ? (
            <PublicAgent token={token} agents={agents}/>
        ) : (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )}
    </div>
  )
}

export default Layout