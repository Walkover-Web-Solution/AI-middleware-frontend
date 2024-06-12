import { useState } from "react";
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import ChatBotList from "./configurationComponent/chatBotList";
import EmbedList from "./configurationComponent/embedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
import ModelDropdown from "./configurationComponent/modelDropdown";
import ResponseFormatSelector from "./configurationComponent/responseFormatSelector";
import ResponseTypesSelector from "./configurationComponent/responseTypeSelector";
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import ActionList from "./configurationComponent/actionList";

export default function ConfigurationPage({ params, dataToSend }) {
    const [selectedService, setSelectedService] = useState('');

    const handleServiceChange = (service) => {
        setSelectedService(service);
    };

    return (
        <div>
            <BridgeTypeToggle params={params} />
            <SlugNameInput params={params} />
            <InputConfigComponent params={params} />
            <EmbedList params={params} />
            <ServiceDropdown params={params} onServiceChange={handleServiceChange} />
            <ModelDropdown params={params} />
            <ApiKeyInput params={params} />
            <AdvancedParameters params={params} />
            <ChatBotList params={params} />
            <ActionList params={params} />
            <ResponseTypesSelector params={params} />
            <ResponseFormatSelector params={params} />
        </div>
    );
}





