'use client'
import PrivateAgent from '@/components/configuration/Agent/privateAgent';
import PublicAgent from '@/components/configuration/Agent/publicAgent';
import { useCustomSelector } from '@/customHooks/customSelector';
import { getAllAgentAction, privateAgentLoginAction, publicAgentLoginAction } from '@/store/action/gttwyAgentAction';
import { Loader2, Sparkles, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

const Page = () => {
  const dispatch = useDispatch();
  const [proxyToken, setProxyToken] = useState(null);
  const gtwyAgent = useCustomSelector((state) => state?.gtwyAgentReducer?.gwtyAgent);
  const { publicAgentData, privateAgentData, privateAgent, publicAgent } = gtwyAgent || {};
  const isPublicAgent = !privateAgentData?.token && publicAgentData?.token;
  useEffect(() => {
    if (localStorage.getItem('publicAgentProxyToken')) {
      setProxyToken(localStorage.getItem('publicAgentProxyToken'));
    }
  }, [])

  useEffect(() => {
    if(!localStorage.getItem('publicAgentProxyToken')){
      dispatch(publicAgentLoginAction())
    }
  }, []);

  useEffect(() => {
    if(!localStorage.getItem('publicAgentProxyToken' && localStorage.getItem('AgentToken'))){
      const fetchAgents = async () => {
        dispatch(getAllAgentAction())
      };
      fetchAgents();
    }
  }, [publicAgentData, privateAgentData]);

  useEffect(() => {
    const fetchPrivateAgents = async () => {
      if (localStorage.getItem('publicAgentProxyToken') && localStorage.getItem('AgentToken')) {
        dispatch(privateAgentLoginAction())
      }
    };
    fetchPrivateAgents();
  }, []);

  
  return (
    <div className="min-h-screen bg-base-200/30">
      {/* Beautiful GTWY AI Header */}
      <header className="bg-base-100 shadow-sm border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-base-content">
                  GTWY AI
                </h1>
                <p className="text-base-content/60 text-sm">
                  Gateway to Intelligent Agents
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="hidden md:flex items-center gap-2 text-base-content/70">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">
                {proxyToken ? 'Welcome back!' : 'Discover AI Agents'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {publicAgent ? (
        <div className="space-y-16">
          {privateAgent && proxyToken && (
            <PrivateAgent agents={privateAgent} />
          )}
          <PublicAgent token={publicAgentData?.token} agents={publicAgent} />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-base-content/60 mt-4">Loading agents...</p>
        </div>
      )}
    </div>
  )
}

export default Page;