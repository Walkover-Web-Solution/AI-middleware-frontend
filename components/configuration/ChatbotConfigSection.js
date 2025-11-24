import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import ActionList from "./configurationComponent/actionList";
import { useConfigurationContext } from './ConfigurationContext';

const ChatbotConfigSection = ( {isPublished} ) => {
    const [isChatbotAccordionOpen, setIsChatbotAccordionOpen] = useState(false);
    const { params, searchParams, bridgeType } = useConfigurationContext();

    const toggleChatbotAccordion = () => {
        setIsChatbotAccordionOpen(!isChatbotAccordionOpen);
    };

    // Only show for chatbot bridge type
    if (bridgeType !== 'chatbot') {
        return null;
    }

    return (
        <div className="z-very-low mt-2 text-base-content w-full cursor-pointer" tabIndex={0}>
            <div className={`info p-1 ${isChatbotAccordionOpen ? 'border border-base-content/20 rounded-x-lg rounded-t-lg' : 'border border-base-content/20 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`} onClick={toggleChatbotAccordion}>
                <InfoTooltip tooltipContent="Configure chatbot-specific settings including user references, starter questions, and action lists." className="cursor-pointer mr-2">
                    <div className="cursor-pointer label-text inline-block ml-1">
                        Chatbot Configuration
                    </div>
                </InfoTooltip>
                <span className="cursor-pointer">
                    {isChatbotAccordionOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
                </span>
            </div>
            
            <div className={`w-full gap-2 cursor-default flex flex-col px-3 ${isChatbotAccordionOpen ? 'border border-base-content/20-x border-b border-base-content/20 rounded-x-lg rounded-b-lg' : 'border border-base-content/20 rounded-lg'} transition-all duration-300 ease-in-out overflow-hidden ${isChatbotAccordionOpen ? 'opacity-100' : 'max-h-0 opacity-0 p-0'}`}>
                <UserRefernceForRichText params={params} searchParams={searchParams} isPublished={isPublished} />
                <StarterQuestionToggle params={params} searchParams={searchParams} isPublished={isPublished} />
                <ActionList params={params} searchParams={searchParams} isPublished={isPublished} />
            </div>
        </div>
    );
};

export default React.memo(ChatbotConfigSection);
