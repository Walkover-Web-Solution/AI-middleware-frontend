import { addorRemoveBridgeInChatBot, createChatBot, getAllChatBot, getChatBotDetails } from "@/api";
import { isError } from "lodash";
import { addorRemoveBridgeInChatBotReducer, createNewBotReducer, getAllChatBotReducer, getChatBotDetailsReducer } from "../reducer/ChatBotReducer";
import { updateBridgeReducer } from "../reducer/bridgeReducer";


export const getAllChatBotAction = (orgId) => async (dispatch, getState) => {
    try {
        const response = await getAllChatBot(orgId);
        console.log(response)
        dispatch(getAllChatBotReducer({ chatbots: response.data.chatbots, orgId }));
    } catch (error) {
        console.error(error);
    }
};



export const createNewChatbot = (dataToSend) => async (dispatch, getState) => {
    try {
        const response = await createChatBot(dataToSend);
        dispatch(createNewBotReducer({ chatbot: response.data.chatBot, orgId: dataToSend.orgId }));
    } catch (error) {
        console.error(error);
    }
};


export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch, getState) => {
    try {
        const data = await createBridge(dataToSend.dataToSend);
        onSuccess(data);
        dispatch(createBridgeReducer({ data, orgId: dataToSend.orgid }));
    } catch (error) {
        console.error(error);
    }
};

export const getChatBotDetailsAction = (botId) => async (dispatch, getState) => {
    try {
        const response = await getChatBotDetails(botId);
        dispatch(getChatBotDetailsReducer({ botId, data: response.data }))
        console.log(response)
        // dispatch(getAllChatBotReducer({ bridges: response, orgId }));
    } catch (error) {
        console.error(error);
    }
}

export const addorRemoveBridgeInChatBotAction = (orgId, botId, bridgeId, type) => async (dispatch, getState) => {
    try {
        const response = await addorRemoveBridgeInChatBot(orgId, botId, bridgeId, type);
        dispatch(updateBridgeReducer(response.data.result))
        // dispatch(addorRemoveBridgeInChatBotReducer({ orgId, botId, bridgeId, type }));
    } catch (error) {
        console.error(error);
    }
}

