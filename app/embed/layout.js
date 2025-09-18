"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { updateUserDetialsForEmbedUser } from '@/store/reducer/userDetailsReducer';
import { useDispatch } from 'react-redux';
import { getServiceAction } from '@/store/action/serviceAction';
import { createBridgeAction, getAllBridgesAction, updateBridgeAction} from '@/store/action/bridgeAction';
import { generateRandomID, getFromCookies, sendDataToParent, setInCookies, toBoolean } from '@/utils/utility';
import { useCustomSelector } from '@/customHooks/customSelector';
import { isPending } from '@/store/reducer/bridgeReducer';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgentName, setCurrentAgentName] = useState(null);
  const [processedAgentName, setProcessedAgentName] = useState(null);

  const interfaceDetailsParam = searchParams.get('interfaceDetails');
  const decodedParam = interfaceDetailsParam ? decodeURIComponent(interfaceDetailsParam) : null;
  const urlParamsObj = decodedParam ? JSON.parse(decodedParam) : {};

  const allBridges = useCustomSelector(
    (state) => state.bridgeReducer?.orgs?.[urlParamsObj.org_id]?.orgs || []
  );

  useEffect(() => {
    window.parent.postMessage({ type: 'gtwyLoaded', data: 'gtwyLoaded' }, '*');
    dispatch(getServiceAction());
  }, [dispatch]);

  const createNewAgent = useCallback((agent_name, orgId, agent_purpose) => {
    const dataToSend = agent_purpose ? {purpose: agent_purpose.trim()} : {
      service: 'openai',
      model: 'gpt-4o',
      name: agent_name.trim(),
      slugName: generateRandomID(),
      bridgeType: 'api',
      type: 'chat',
    };
    dispatch(isPending())
    dispatch(
      createBridgeAction({ dataToSend, orgid: orgId }, response => {
        if (response?.data?.bridge) {
          sendDataToParent(
            'drafted',
            {
              name: response.data.bridge.name,
              agent_id: response.data.bridge._id,
            },
            'Agent created Successfully'
          );
          router.push(`/org/${orgId}/agents/configure/${response.data.bridge._id}?version=${response.data.bridge.versions[0]}`);
        }
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
    if(agent?._id && orgId && version){
      router.push(
        `/org/${orgId}/agents/configure/${agent._id}?version=${version}`
      );
    }
    setIsLoading(false);
    setProcessedAgentName(agent.name);
  }, [router]);

  const handleAgentNavigation = useCallback(async (agentName, orgId) => {
    if (!agentName || !orgId || processedAgentName === agentName) {
      if (processedAgentName === agentName) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const trimmedAgentName = agentName.trim();

    if (allBridges && allBridges.length > 0) {
      const agentInStore = allBridges.find(
        (agent) => agent?.name?.trim() === trimmedAgentName
      );
      if (agentInStore) {
        navigateToExistingAgent(agentInStore, orgId);
        return;
      }
    }

    try {
       let bridges = allBridges;
       allBridges.length === 0 && await dispatch(getAllBridgesAction((data)=>{
        bridges = data
       }));

      const existingAgent = bridges?.find(
        (agent) => agent?.name?.trim() === trimmedAgentName
      );

      if (existingAgent) {
        navigateToExistingAgent(existingAgent, orgId);
      } else {
        createNewAgent(agentName, orgId);
      }
    } catch (error) {
      console.error('Error fetching bridges, falling back to create a new agent:', error);
      createNewAgent(agentName, orgId);
    }
  }, [processedAgentName, dispatch, createNewAgent, navigateToExistingAgent, allBridges]);

  useEffect(() => {
    const initialize = () => {
      if ((urlParamsObj.org_id && urlParamsObj.token && (urlParamsObj.folder_id||urlParamsObj.gtwy_user)) || urlParamsObj?.hideHomeButton) {
        setIsLoading(true);

        if (urlParamsObj.token) {
          dispatch(updateUserDetialsForEmbedUser({ isEmbedUser: true, hideHomeButton: urlParamsObj?.hideHomeButton }));
          sessionStorage.setItem('proxy_token', urlParamsObj.token);
          sessionStorage.setItem('gtwy_org_id', urlParamsObj?.org_id);
          sessionStorage.setItem('gtwy_folder_id', urlParamsObj?.folder_id);
          urlParamsObj?.folder_id && sessionStorage.setItem('embedUser', true);
          urlParamsObj?.gtwy_user && sessionStorage.setItem('orchestralUser', true);
        }

        if (urlParamsObj.config) {
          Object.entries(urlParamsObj.config).forEach(([key, value]) => {
            if (value !== undefined) {
             key === "apikey_object_id" ? dispatch(updateUserDetialsForEmbedUser({ [key]: value })) : dispatch(updateUserDetialsForEmbedUser({ [key]: toBoolean(value)}));
            }
          });
        }
        if(urlParamsObj?.config?.configureGtwyRedirection === 'orchestral_page'){
          setIsLoading(true);
          router.push(`/org/${urlParamsObj.org_id}/orchestratal_model`);
          return;
        }

        if (urlParamsObj?.agent_name) {
          setIsLoading(true)
          setCurrentAgentName(urlParamsObj.agent_name);
        } else if (urlParamsObj?.agent_id) {
          setIsLoading(true)
          router.push(`/org/${urlParamsObj.org_id}/agents/configure/${urlParamsObj.agent_id}?isEmbedUser=true`);
        } else {
          setIsLoading(true)
          router.push(`/org/${urlParamsObj.org_id}/agents?isEmbedUser=true`);
        }
      } else {
        setIsLoading(false);
      }
    };

    initialize();
  }, [decodedParam]);

  useEffect(() => {
    if (currentAgentName) {
      const orgId = urlParamsObj.org_id || sessionStorage.getItem('gtwy_org_id');
      if (orgId) {
        handleAgentNavigation(currentAgentName, orgId);
      }
    }
  }, [currentAgentName, urlParamsObj.org_id]);

  useEffect(() => {
    const handleMessage = async (event) => {

      if (event.data?.data?.type !== "gtwyInterfaceData") return;

      const messageData = event.data.data.data;
      const orgId = sessionStorage.getItem('gtwy_org_id');
      if (messageData?.agent_name) {
        setIsLoading(true)
        handleAgentNavigation(messageData.agent_name, orgId)
      } else if (messageData?.agent_id && orgId) {
        // setIsLoading(true);
        router.push(`/org/${orgId}/agents/configure/${messageData.agent_id}`);
      }
      else if(messageData?.agent_purpose)
      {
        createNewAgent('', orgId, messageData.agent_purpose)
        setIsLoading(true);  
      }
      if(messageData?.meta && messageData?.agent_id && orgId){
        let bridges = allBridges;
       allBridges.length === 0 && await dispatch(getAllBridgesAction((data)=>{
        bridges = data
       }));
       const bridge = bridges.find((bridge) => bridge._id === messageData.agent_id)
       if(!bridge){
          return
        }
        dispatch(updateBridgeAction({
          dataToSend: {meta: messageData.meta},
          bridgeId: messageData.agent_id
        }, response => {
          if(response?.data?.bridge){
            router.push(`/org/${orgId}/agents/configure/${messageData.agent_id}`);
          }
        }))
      }

      const uiUpdates = {};
      if (messageData?.hideHomeButton !== undefined) uiUpdates.hideHomeButton = messageData.hideHomeButton;
      if (messageData?.showGuide !== undefined) uiUpdates.showGuide = messageData.showGuide;
      if (messageData?.showConfigType !== undefined) uiUpdates.showConfigType = messageData.showConfigType;

      if (Object.keys(uiUpdates).length > 0) {
        dispatch(updateUserDetialsForEmbedUser(uiUpdates));
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      // window.removeEventListener('message', handleMessage);
    };
  }, []);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <div className="text-4xl font-bold text-base-content mb-4">
            GTWY
          </div>
          <div className="flex items-center justify-center space-x-1 text-xl text-base-content">
            <span>is loading</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
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

export default Layout;