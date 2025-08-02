'use client'
import AgentSidebar from '@/components/configuration/Agent/AgentSidebar';
import { useRouter } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import React, { useEffect, useMemo } from 'react';
import { AgentChatBot } from '@/components/configuration/Agent/AgentChatbot';
import { clearAgentsData } from '@/store/reducer/gwtyAgentReducer';
import { getAllAgentAction, publicAgentLoginAction } from '@/store/action/gttwyAgentAction';
import { useDispatch } from 'react-redux';

export const runtime = 'edge';

const Page = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const gtwyAgent = useCustomSelector((state) => state?.gtwyAgentReducer?.gwtyAgent);
  const { publicAgentData, privateAgentData, privateAgent, publicAgent } = gtwyAgent || {};
  
  const selectedAgent = publicAgent?.find((agent) => agent.page_config.url_slugname === params.agentName) || privateAgent?.find((agent) => agent.page_config.url_slugname === params.agentName);
  const isPublicAgent = selectedAgent?.page_config?.availability === 'public';

  const token = useMemo(() => {
    return isPublicAgent ? publicAgentData?.token : privateAgentData?.token;
  }, [isPublicAgent, publicAgentData, privateAgentData]);

  useEffect(() => {
    if (!localStorage.getItem('AgentToken') && !localStorage.getItem('publicAgentUserId')) {
      dispatch(clearAgentsData())
      dispatch(publicAgentLoginAction()).then(() => {
        dispatch(getAllAgentAction()).then(() => {
          router.push(`/publicAgent/${params.agentName}`)
        })
      })
    }
  }, [params.agentName, router, dispatch]);

  const onSelectAgent = (agentId) => {
    router.push(`/publicAgent/${agentId}`);
  };

  useEffect(() => {
    if(localStorage.getItem('AgentToken')) {
      dispatch(getAllAgentAction()).then(() => {
        router.push(`/publicAgent/${params.agentName}`)
      })
    }
  }, []);

  const handleBack = () => {
    router.push('/publicAgent');
  };

  const scriptId = 'chatbot-main-script';
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    if (token) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", token);
      script.setAttribute("hideIcon", "true");
      script.setAttribute('parentId', 'parentChatbot');
      script.setAttribute('hideCloseButton', 'true');
      script.setAttribute('hideFullScreenButton', 'true');
      script.setAttribute('bridgeName', selectedAgent?.page_config?.url_slugname);
      script.setAttribute('threadId', String(isPublicAgent ? publicAgentData?.user_id : privateAgentData?.user_id));
      script.setAttribute('subThreadId', String(isPublicAgent ? publicAgentData?.user_id : privateAgentData?.user_id));
      script.setAttribute('defaultOpen', 'true');
      script.id = scriptId;
      script.src = scriptSrc;
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [token, selectedAgent, isPublicAgent, publicAgentData, privateAgentData]);

  return (
    <>
      <div className='flex flex-row gap-2 min-h-screen'>
        <AgentSidebar
          publicAgents={publicAgent}
          privateAgents={privateAgent}
          selectedAgentId={params.agentName}
          onSelectAgent={onSelectAgent}
        />
        <div className='flex-1'>
          <AgentChatBot agent={selectedAgent} onBack={handleBack} agentData={isPublicAgent ? publicAgentData : privateAgentData} />
        </div>
      </div>
    </>
  );
};

export default Page;
