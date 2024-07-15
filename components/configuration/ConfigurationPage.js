import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bot, Cog } from "lucide-react";
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import EmbedList from "./configurationComponent/embedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
import ModelDropdown from "./configurationComponent/modelDropdown";
import ResponseFormatSelector from "./configurationComponent/responseFormatSelector";
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import ActionList from "./configurationComponent/actionList";
import { useCustomSelector } from "@/customSelector/customSelector";
import PrivateFormSection from '../chatbotConfiguration/firstStep';
import SecondStep from '../chatbotConfiguration/secondStep';
import ApiGuide from './configurationComponent/ApiGuide';

export default function ConfigurationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams()
    const [currentView, setCurrentView] = useState('setup')
    const { bridgeType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType || 'api',
    }));

    useEffect(() => {
        const view = searchParams.get('view')
        if (view) setCurrentView(view)
    }, [searchParams]);

    const handleNavigation = (target) => {
        setCurrentView(target)
        router.push(`/org/${params.org_id}/bridges/configure/${params.id}?view=${target}`);
    };
    return (
        <div className="flex flex-col gap-3 relative">
            <BridgeTypeToggle params={params} />
            <div className="join absolute right-0 top-0">
                <button
                    onClick={() => handleNavigation('setup')}
                    className={` ${currentView === 'setup' ? "btn-primary" : ""} btn join-item `}
                >
                    { }
                    <Cog size={16} />Setup
                </button>
                <button
                    onClick={() => handleNavigation('guide')}
                    className={` ${currentView === 'guide' ? "btn-primary" : ""} btn join-item `}
                >
                    <Bot size={16} />Guide
                </button>
            </div>
            {
                currentView === 'setup' ?
                    <>
                        <SlugNameInput params={params} />
                        <InputConfigComponent params={params} />
                        <EmbedList params={params} />
                        <ServiceDropdown params={params} />
                        <ModelDropdown params={params} />
                        <ApiKeyInput params={params} />
                        <AdvancedParameters params={params} />
                        <ActionList params={params} />
                        <ResponseFormatSelector params={params} />
                    </>
                    :
                    bridgeType === 'api' ?
                        <div className="flex flex-col w-100 overflow-auto gap-3">
                            <h1 className="text-xl font-semibold">API Configuration</h1>
                            <div className="flex flex-col gap-4">
                                <ApiGuide params={params}/>
                            </div>
                        </div> :
                        <div className="flex  flex-col w-100 overflow-auto gap-3">
                            <h1 className="text-xl font-semibold">Chatbot Configuration</h1>
                            <div className="flex flex-col gap-4">
                                <PrivateFormSection params={params} ChooseChatbot={true}/>
                                <SecondStep />
                            </div>
                        </div>
            }

        </div>
    );
}
