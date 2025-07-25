"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { updateUserDetialsForEmbedUser } from '@/store/reducer/userDetailsReducer';
import { useDispatch } from 'react-redux';
import { getServiceAction } from '@/store/action/serviceAction';
import { createBridgeAction } from '@/store/action/bridgeAction'; 
import { sendDataToParent, toBoolean } from '@/utils/utility';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const interfaceDetailsParam = searchParams.get('interfaceDetails');
  const decodedParam = interfaceDetailsParam ? decodeURIComponent(interfaceDetailsParam) : null;
  const urlParamsObj = decodedParam ? JSON.parse(decodedParam) : {};

  useEffect(() => {
    window.parent.postMessage({ type: 'gtwyLoaded', data: 'gtwyLoaded' }, '*');
  }, []);

  useEffect(() => {
    dispatch(getServiceAction())
  }, [])

  useEffect(() => {
    if ((urlParamsObj.org_id && urlParamsObj.token && urlParamsObj.folder_id) || urlParamsObj?.hideHomeButton) {
      setIsLoading(true);

      if (urlParamsObj.token) {
        dispatch(updateUserDetialsForEmbedUser({ isEmbedUser: true, hideHomeButton: urlParamsObj?.hideHomeButton}));
        sessionStorage.setItem('proxy_token', urlParamsObj.token);
        sessionStorage.setItem('gtwy_org_id', urlParamsObj?.org_id);
        sessionStorage.setItem('gtwy_folder_id', urlParamsObj?.folder_id);
      }
      if(urlParamsObj.config)
      {
        Object.entries(urlParamsObj.config).forEach(([key, value]) => {
          if (value !== undefined) {
            dispatch(updateUserDetialsForEmbedUser({
              [key]: toBoolean(value)
            }));
          }
        });
      }

      router.push(`org/${urlParamsObj.org_id}/agents?isEmbedUser=true`);
    }
  }, [urlParamsObj, router, dispatch]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { data } = event?.data;
      if (data?.type !== "gtwyInterfaceData") return;

      const messageData = data?.data;
      const orgId = sessionStorage.getItem('gtwy_org_id');

      // Handle agent creation/configuration
      if (messageData?.agent_name) {
        const dataToSend = {
          service: "openai",
          model: "gpt-4o", 
          name: messageData.agent_name,
          slugName: messageData.agent_name,
          bridgeType: "api",
          type: "chat"
        };
        dispatch(createBridgeAction({ dataToSend, orgid: orgId }, (response) => {
        sendDataToParent("drafted", {name: response?.data?.bridge?.name, agent_id: response?.data?.bridge?._id}, "Agent created Successfully")
        router.push(`/org/${orgId}/agents/configure/${response.data.bridge._id}`);
        })).catch(() => setIsLoading(false));

      } else if (messageData?.agent_id) {
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