'use client'
import PrivateAgent from '@/components/configuration/Agent/privateAgent';
import PublicAgent from '@/components/configuration/Agent/publicAgent';
import { useCustomSelector } from '@/customHooks/customSelector';
import { getAllAgentAction, privateAgentLoginAction, publicAgentLoginAction } from '@/store/action/gttwyAgentAction';
import { clearAgentsData } from '@/store/reducer/gwtyAgentReducer';
import { Loader2, Sparkles, Zap, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

export const runtime = 'edge';

const Page = () => {
  const dispatch = useDispatch();
  const [proxyToken, setProxyToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const gtwyAgent = useCustomSelector((state) => state?.gtwyAgentReducer?.gwtyAgent);
  const { publicAgentData, privateAgentData, privateAgent, publicAgent } = gtwyAgent || {};

  // Filter agents based on search term
  const filteredPublicAgents = publicAgent?.filter(agent => 
    agent.page_config?.url_slugname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrivateAgents = privateAgent?.filter(agent => 
    agent.page_config?.url_slugname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Effect hooks
  useEffect(() => {
    if (localStorage.getItem('publicAgentProxyToken')) {
      setProxyToken(localStorage.getItem('publicAgentProxyToken'));
    }
  }, [])

  useEffect(() => {
    if(!localStorage.getItem('publicAgentProxyToken') && !localStorage.getItem('AgentToken')){
       dispatch(clearAgentsData())
        dispatch(publicAgentLoginAction()).then(() => {
          dispatch(getAllAgentAction())
        })
    }
  }, []);

  useEffect(() => {
    if(!localStorage.getItem('publicAgentProxyToken') && localStorage.getItem('AgentToken')){
      const fetchAgents = async () => {
        dispatch(getAllAgentAction())
      };
      setTimeout(() => {
        fetchAgents();
      }, 1000);
    }
  }, [publicAgentData, privateAgentData]);

  useEffect(() => {
    const fetchPrivateAgents = async () => {
      if (localStorage.getItem('publicAgentProxyToken') && localStorage.getItem('AgentToken')) {
        dispatch(privateAgentLoginAction()).then(() => {
          dispatch(getAllAgentAction())
        })
      }
    };
    fetchPrivateAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Enhanced Header with Glass Morphism */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GTWY AI
                </h1>
                <p className="text-slate-600 text-sm">
                  Gateway to Intelligent Agents
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                {proxyToken ? 'Welcome back!' : 'Discover AI Agents'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4">
        {publicAgent ? (
          <div className="space-y-4">
            {privateAgent && proxyToken && (
              <PrivateAgent agents={filteredPrivateAgents} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            )}
            <PublicAgent token={publicAgentData?.token} agents={filteredPublicAgents} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-75"></div>
            </div>
            <p className="text-slate-600 mt-6 text-lg font-medium">Loading intelligent agents...</p>
            <p className="text-slate-400 text-sm mt-2">Preparing your AI experience</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Page;