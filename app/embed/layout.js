"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { updateUserDetialsForEmbedUser } from '@/store/reducer/userDetailsReducer';
import { useDispatch } from 'react-redux';
import { getServiceAction } from '@/store/action/serviceAction';
import { createBridgeAction, getAllBridgesAction} from '@/store/action/bridgeAction';
import { sendDataToParent, toBoolean } from '@/utils/utility';
import { useCustomSelector } from '@/customHooks/customSelector';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgentName, setCurrentAgentName] = useState(null);
  const [processedAgentName, setProcessedAgentName] = useState(null);
  const [bridgesLoaded, setBridgesLoaded] = useState(false);

  const interfaceDetailsParam = searchParams.get('interfaceDetails');
  const decodedParam = interfaceDetailsParam ? decodeURIComponent(interfaceDetailsParam) : null;
  const urlParamsObj = decodedParam ? JSON.parse(decodedParam) : {};

  const { allbridges } = useCustomSelector((state) => ({
    allbridges: state?.bridgeReducer?.org?.[urlParamsObj.org_id]?.orgs || []
  }));

  useEffect(() => {
    window.parent.postMessage({ type: 'gtwyLoaded', data: 'gtwyLoaded' }, '*');
  }, []);

  useEffect(() => {
    dispatch(getServiceAction())
  }, [])

  const createNewAgent = useCallback((agent_name, orgId) => {
    const dataToSend = {
      service: 'openai',
      model: 'gpt-4o',
      name: agent_name,
      slugName: agent_name,
      bridgeType: 'api',
      type: 'chat',
    };

    dispatch(
      createBridgeAction({ dataToSend, orgid: orgId }, response => {
        sendDataToParent(
          'drafted',
          {
            name: response?.data?.bridge?.name,
            agent_id: response?.data?.bridge?._id,
          },
          'Agent created Successfully'
        );
        router.push(`/org/${orgId}/agents/configure/${response.data.bridge._id}`);
        setIsLoading(false);
        setProcessedAgentName(agent_name);
      })
    ).catch(() => {
      setIsLoading(false);
      setProcessedAgentName(agent_name);
    });
  }, [dispatch, router]);

  const navigateToExistingAgent = useCallback((agent, orgId) => {
    const version = agent?.published_version_id || agent?.versions?.[0];
    router.push(
      `/org/${orgId}/agents/configure/${agent._id}?version=${version}`
    );
    setIsLoading(false);
    setProcessedAgentName(agent.name);
  }, [router]);

  const handleAgentNavigation = useCallback(async (agentName, orgId) => {
    if (!agentName || !orgId || processedAgentName === agentName) {
      return;
    }

    setIsLoading(true);

    // Check if bridges are already loaded
    if (allbridges?.length > 0 || bridgesLoaded) {
      const existingAgent = allbridges.find(agent => agent?.name === agentName);
      
      if (existingAgent) {
        navigateToExistingAgent(existingAgent, orgId);
      } else {
        createNewAgent(agentName, orgId);
      }
    } else {
      // Fetch bridges first
      try {
        let response;
        await dispatch(getAllBridgesAction((data)=>{
          if(data){
            response = data;
          }
        }));
        if (response?.length > 0) {
          const existingAgent = response.find(bridge => bridge.name === agentName);
          
          if (existingAgent) {
            navigateToExistingAgent(existingAgent, orgId);
          } else {
            createNewAgent(agentName, orgId);
          }
        } else {
          createNewAgent(agentName, orgId);
        }
      } catch (error) {
        console.error('Error fetching bridges:', error);
        createNewAgent(agentName, orgId);
      }
    }
  }, [allbridges, bridgesLoaded, processedAgentName, dispatch, navigateToExistingAgent, createNewAgent]);

  // Handle agent name changes
  useEffect(() => {
    if (currentAgentName && currentAgentName !== processedAgentName) {
      const orgId = urlParamsObj.org_id || sessionStorage.getItem('gtwy_org_id');
      if (orgId) {
        handleAgentNavigation(currentAgentName, orgId);
      }
    }
  }, [currentAgentName, processedAgentName, urlParamsObj.org_id, handleAgentNavigation]);

  // Handle bridge loading state
  useEffect(() => {
    if (allbridges?.length > 0) {
      setBridgesLoaded(true);
    }
  }, [allbridges]);

  useEffect(() => {
    const initialize = async () => {
      if ((urlParamsObj.org_id && urlParamsObj.token && urlParamsObj.folder_id) || urlParamsObj?.hideHomeButton) {
        setIsLoading(true);

        if (urlParamsObj.token) {
          dispatch(updateUserDetialsForEmbedUser({ isEmbedUser: true, hideHomeButton: urlParamsObj?.hideHomeButton }));
          sessionStorage.setItem('proxy_token', urlParamsObj.token);
          sessionStorage.setItem('gtwy_org_id', urlParamsObj?.org_id);
          sessionStorage.setItem('gtwy_folder_id', urlParamsObj?.folder_id);
        }

        if (urlParamsObj.config) {
          Object.entries(urlParamsObj.config).forEach(([key, value]) => {
            if (value !== undefined) {
              dispatch(updateUserDetialsForEmbedUser({ [key]: toBoolean(value) }));
            }
          });
        }

        if (urlParamsObj?.agent_name) {
          setCurrentAgentName(urlParamsObj.agent_name);
        } else if (urlParamsObj?.agent_id) {
          router.push(`/org/${urlParamsObj.org_id}/agents/configure/${urlParamsObj.agent_id}?isEmbedUser=true`);
        } else {
          router.push(`/org/${urlParamsObj.org_id}/agents?isEmbedUser=true`);
        }
      }
    };

    initialize();
  }, [urlParamsObj, router, dispatch]);

  useEffect(() => {
    const handleMessage = async (event) => {
      const { data } = event?.data;
      if (data?.type !== "gtwyInterfaceData") return;

      const messageData = data?.data;
      const orgId = sessionStorage.getItem('gtwy_org_id');

      // Handle agent creation/configuration
      if (messageData?.agent_name) {
        setCurrentAgentName(messageData.agent_name);
      }
      else if (messageData?.agent_id) {
        try {
          setIsLoading(true);
          router.push(`/org/${orgId}/agents/configure/${messageData.agent_id}`);
        } catch (error) {
          setIsLoading(false);
        }
      }

      // Handle UI configuration updates
      const uiUpdates = {};
      if (messageData?.hideHomeButton !== undefined) uiUpdates.hideHomeButton = messageData.hideHomeButton;
      if (messageData?.showGuide !== undefined) uiUpdates.showGuide = messageData.showGuide;
      if (messageData?.showConfigType !== undefined) uiUpdates.showConfigType = messageData.showConfigType;

      Object.entries(uiUpdates).forEach(([key, value]) => {
        if (value !== undefined) {
          dispatch(updateUserDetialsForEmbedUser({
            [key]: toBoolean(value)
          }));
        }
      });
    };

    window.addEventListener('message', handleMessage);

    return () => {
      // window.removeEventListener('message', handleMessage);
    };
  }, []);
 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800 mb-4">
            GTWY
          </div>
          <div className="flex items-center justify-center space-x-1 text-xl text-gray-600">
            <span>is loading</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

export default Layout