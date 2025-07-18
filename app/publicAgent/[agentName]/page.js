'use client'
import AgentSidebar from '@/components/configuration/Agent/AgentSidebar';
import { useRouter } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import React, { useEffect } from 'react'
import { AgentChatBot } from '@/components/configuration/Agent/AgentChatbot';

const page = ({ params }) => {
  const router = useRouter();
  const gtwyAgent = useCustomSelector((state) => state?.gtwyAgentReducer?.gwtyAgent);
  const { publicAgentData, privateAgentData, privateAgent, publicAgent } = gtwyAgent || {};
  const selectedAgent = publicAgent?.find((agent) => agent.page_config.url_slugname === params.agentName) || privateAgent?.find((agent) => agent.page_config.url_slugname === params.agentName);
  const isPublicAgent = selectedAgent?.page_config?.availability === 'public';

  useEffect(() => {
    if (!localStorage.getItem('AgentToken')) {
      router.push('/publicAgent');
    }
  }, [publicAgent, publicAgentData])

  const onSelectAgent = (agentId) => {
    router.push(`/publicAgent/${agentId}`);
  };

  const handleBack = () => {
    router.push('/publicAgent');
  };

  const scriptId = 'chatbot-main-script'
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
  
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      if (publicAgentData?.token) {
        const script = document.createElement("script");
        script.setAttribute("embedToken", !isPublicAgent ? privateAgentData?.token : publicAgentData?.token);
        script.setAttribute("hideIcon", true);
        script.setAttribute('parentId', 'parentChatbot')
        script.id = scriptId;
        script.src = scriptSrc;
        document.head.appendChild(script);
      }
      return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      }
  }, [publicAgentData, privateAgentData]);


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
  )
}

export default page