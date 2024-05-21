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

export default function ConfigurationPage({ params, dataToSend }) {
    return (
        <div>
            <BridgeTypeToggle dataToSend={dataToSend} params={params} />
            <SlugNameInput dataToSend={dataToSend} params={params} />
            <InputConfigComponent dataToSend={dataToSend} params={params} />
            <EmbedList params={params} />
            <ServiceDropdown params={params} />
            <ModelDropdown dataToSend={dataToSend} params={params} />
            <ApiKeyInput dataToSend={dataToSend} params={params} />
            <AdvancedParameters params={params} dataToSend={dataToSend} />
            <ChatBotList params={params} />
            <ResponseTypesSelector params={params} />
            <ResponseFormatSelector dataToSend={dataToSend} params={params} />
        </div>
    )
}

