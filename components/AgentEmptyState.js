import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import { MessageCircleIcon, MessageSquareIcon, PlugIcon, SettingsIcon } from "./Icons";
import { PlusIcon, Zap } from "lucide-react";
import PageHeader from "./Pageheader";
import CreateNewBridge from "./createNewBridge";
import { useCustomSelector } from "@/customHooks/customSelector";

const AgentEmptyState =   ({orgid,isEmbedUser}) => {
  const {tutorialData}=useCustomSelector((state)=>({
      tutorialData:state.flowDataReducer?.flowData?.tutorialData || []
    }))
    const agentCreationTutorial = tutorialData?.find(item => item.title === 'Agent Creation');
    const agentCreationvideoUrl = agentCreationTutorial?.videoUrl || '';
  return (
    <div className=" mt-8 px-4">
      <div className=" mx-2 ">
        {/* Header Section with Left-Right Layout */}
        <div className="flex w-full justify-between">
          {/* Left Side - Heading and Description */}
          <PageHeader
                        title="Welcome To GTWY AI"
                        description=" Build and manage AI agents for your workflows. Agents help automate tasks, answer queries, and deliver intelligent assistance."
                        docLink="https://gtwy.ai/blogs/features/bridge"
                      />

          {/* Right Side - Create Agent Button */}
          <div className="flex-shrink-0">
            <div className="text-center ">
              <button className="btn btn-primary btn-md" onClick={() =>{ openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)}}>
                                  + Create New Agent
                              </button>
             
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="flex justify-center">
          <div className=" rounded-2xl p-6 border border-base-300/50">
            <div className="text-center mb-3">
             
              <h2 className="text-lg mb-4 font-bold text-base-content">
                Watch How to Create Your First Agent
              </h2>
            </div>
            <div className=" h-[70vh] w-[80vw] rounded-xl flex justify-center items-center overflow-hidden">
              <iframe
                src={agentCreationvideoUrl||"https://app.supademo.com/embed/cm9shc2ek0gt6dtm7tmez2orj?embed_v=2"}
                height={"100%"}    
                width={"70%"}
                style={{ border: 'none'}}
                allowFullScreen
                title="How to Create an Agent"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
      
        <CreateNewBridge orgid={orgid} isEmbedUser={isEmbedUser} />       
      </div>
    </div>
  );
};

export default AgentEmptyState;
