import React, { useEffect, useState } from "react";
import { CloseIcon } from "@/components/Icons";
import ApiGuide from "../configuration/configurationComponent/ApiGuide";
import BatchApiGuide from "../configuration/configurationComponent/BatchApiGuide";
import SecondStep from "../chatbotConfiguration/SecondStep";
import PrivateFormSection from "../chatbotConfiguration/FirstStep";
import { useCustomSelector } from "@/customHooks/customSelector";
import { toggleSidebar } from "@/utils/utility";
import SlugNameInput from "../configuration/configurationComponent/SlugNameInput";

function GuideSlider({ params, bridgeType, onClose }) {
  // Initialize activeTab state
  const [activeTab, setActiveTab] = useState(bridgeType != "trigger" ? bridgeType : "chatbot");
  
  // Get bridge data from Redux
  const { slugName, prompt, bridgeTypeFromRedux } = useCustomSelector((state) => ({
    slugName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.slugName,
    prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt,
    bridgeTypeFromRedux: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.toLowerCase()
  }));
  
  useEffect(() => {
    // Set initial active tab based on the bridge type from props
    let initialTab = bridgeType != "trigger" ? bridgeType : "chatbot";
    
    // If the bridge type is chatbot from Redux, force chatbot tab
    if (bridgeTypeFromRedux === "chatbot") {
      initialTab = "chatbot";
    } 
    // If bridge type is not chatbot (api or batch), make sure we don't show chatbot tab
    else if (initialTab === "chatbot") {
      initialTab = "api"; // Default to API tab for non-chatbot agents
    }
    
    setActiveTab(initialTab);
  }, [bridgeType, bridgeTypeFromRedux]);

  // Determine which tabs to show based on the bridge type
  const tabs = bridgeTypeFromRedux === "chatbot" ?
    // If it's a chatbot, only show the chatbot tab
    [{ id: "chatbot", label: "Chatbot" }] :
    // If it's API or batch, show both API and Batch API tabs
    [
      { id: "api", label: "API" },
      { id: "batch", label: "Batch API" }
    ];

  const renderTabContent = () => {
    switch(activeTab) {
      case "api":
        return <ApiGuide params={params} prompt={prompt}/>;
      case "chatbot":
        return  <div className="">
        <SlugNameInput params={params}/>
        <PrivateFormSection params={params} ChooseChatbot={true}/>
        <SecondStep slugName={slugName} prompt={prompt}/>
    </div>
      case "batch":
        return <BatchApiGuide params={params}/>
      default:
        return null;
    }
  };

  return (
    <aside
      id="integration-guide-slider"
      className={`sidebar-container fixed z-very-high flex flex-col top-0 right-0 p-4 w-full md:w-1/3 lg:w-1/2 opacity-100 h-screen bg-base-200 transition-all duration-300 overflow-y-auto translate-x-full`}
      aria-label="integration-guide-slider"
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-bold text-lg">Integration Guide</h3>
          <CloseIcon
          onClick={()=>{
            toggleSidebar("integration-guide-slider", "right");
            // Call onClose after a delay to allow animation to complete
            setTimeout(() => onClose && onClose(), 300);
          }}
            className="cursor-pointer hover:text-error transition-colors"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="tabs tabs-boxed bg-base-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab flex-1 transition-colors ${activeTab === tab.id 
                  ? 'tab-active bg-base-200 font-medium shadow-sm' 
                  : 'hover:bg-base-200/50'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto h-full scrollbar-hide rounded-lg bg-base-100 p-4 shadow-sm">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default GuideSlider;