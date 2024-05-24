import { addorRemoveBridgeInChatBot, createChatBot, getAllChatBot, getChatBotDetails, updateChatBot, updateChatBotConfig } from "@/config";
import { isError } from "lodash";
import { addorRemoveBridgeInChatBotReducer, createNewBotReducer, getAllChatBotReducer, getChatBotDetailsReducer, updateChatBotConfigReducer, updateChatBotReducer } from "../reducer/ChatBotReducer";
import { updateBridgeReducer } from "../reducer/bridgeReducer";


export const getAllChatBotAction = (orgId) => async (dispatch, getState) => {
    try {
        const response = await getAllChatBot(orgId);
        dispatch(getAllChatBotReducer({ chatbots: response.data.chatbots, orgId }));
    } catch (error) {
        console.error(error);
    }
};



export const createNewChatbot = (dataToSend, onSuccess) => async (dispatch, getState) => {
    try {
        const response = await createChatBot(dataToSend);
        onSuccess(response);
        dispatch(createNewBotReducer({ chatbot: response.data.chatBot, orgId: dataToSend.orgId }));
    } catch (error) {
        console.error(error);
    }
};


// export const createBridgeAction = (dataToSend, onSuccess) => async (dispatch, getState) => {
//     try {
//         const data = await createBridge(dataToSend.dataToSend);
//         onSuccess(data);
//         dispatch(createBridgeReducer({ data, orgId: dataToSend.orgid }));
//     } catch (error) {
//         console.error(error);
//     }
// };

export const getChatBotDetailsAction = (botId) => async (dispatch, getState) => {
    try {
        const response = await getChatBotDetails(botId);
        dispatch(getChatBotDetailsReducer({ botId, data: response.data }))
        // dispatch(getAllChatBotReducer({ bridges: response, orgId }));
    } catch (error) {
        console.error(error);
    }
}

export const addorRemoveBridgeInChatBotAction = (orgId, botId, bridgeId, type) => async (dispatch, getState) => {
    try {
        const response = await addorRemoveBridgeInChatBot(orgId, botId, bridgeId, type);
        dispatch(updateBridgeReducer(response.data.result))
        dispatch(updateChatBotReducer({ botId, data: response.data.chatBot.chatBot }))
        // dispatch(addorRemoveBridgeInChatBotReducer({ orgId, botId, bridgeId, type }));
    } catch (error) {
        console.error(error);
    }
}

export const updateChatBotAction = (botId, dataToSend) => async (dispatch, getState) => {
    try {
        const response = await updateChatBot(botId, dataToSend);
        dispatch(updateChatBotReducer({ botId, data: response.data }))
    } catch (error) {
        console.error(error);
    }
}

export const updateChatBotConfigAction = (botId, dataToSend) => async (dispatch, getState) => {
    try {
        const response = await updateChatBotConfig(botId, { config: dataToSend });
        dispatch(updateChatBotConfigReducer({ botId, data: response.data }))
    } catch (error) {
        console.error(error);
    }
}

// "config": {
//     "type": "popup",
//     "height": "100",
//     "heightUnit": "%",
//     "width": "30",
//     "widthUnit": "vw"
// },
