import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ChatBotMap: {},
    org: {},
    loading: false,
};

export const ChatBot = createSlice({

    name: "Chatbot",
    initialState,
    reducers: {
        isPending: (state) => {
            state.loading = true;
        },
        isError: (state) => {
            state.loading = false;
        },
        // addorRemoveResponseIdInChatBot: (state, action) => {
        //   const { response } = action.payload;
        //   state.allBridgesMap[response.bridge_id] = { ...state.allBridgesMap[response.bridge_id], ...response }
        // },
        // fetchSingleChatBot: (state, action) => {
        //   const { bridges, integrationData } = action.payload;
        //   const { _id, configuration: { model: { default: modelDefault } }, service, type } = bridges;
        //   const obj2 = modelInfo[service][modelDefault];
        //   const response = updatedData(bridges, obj2, type);
        //   state.allBridgesMap[_id] = { ...state.allBridgesMap[_id], ...response, integrationData, responseFormat: handleResponseFormat(bridges) };
        //   state.loading = false;
        // },

        getAllChatBotReducer: (state, action) => {
            state.org = { ...state.org, [action.payload.orgId]: [...action.payload.chatbots] }
            state.loading = false;
        },
        getChatBotDetailsReducer: (state, action) => {
            state.ChatBotMap = { ...state.ChatBotMap, [action.payload.botId]: action.payload.data.chatbot }
        },
        createNewBotReducer: (state, action) => {
            state.ChatBotMap = { ...state.ChatBotMap, [action.payload.chatbot._id]: action.payload.chatbot }
            state.org[action.payload.orgId].push(action.payload.chatbot)
        },
        addorRemoveBridgeInChatBotReducer: (state, action) => {
            state.ChatBotMap[action.payload.botId].bridges.push(action.payload.bridgeId)
        },

        // createBridgeReducer: (state, action) => {
        //   state.org[action.payload.orgId].push(action.payload.data.data.bridge)
        // },
        // updateBridgeReducer: (state, action) => {
        //   const { bridges } = action.payload;
        //   const { _id, configuration, service, type } = bridges;
        //   const modelDefault = configuration.model.default;
        //   const obj2 = modelInfo[service][modelDefault];
        //   const response = updatedData(bridges, obj2, type);
        //   state.allBridgesMap[_id] = {
        //     ...state.allBridgesMap[_id],
        //     ...response,
        //     responseFormat: handleResponseFormat(bridges)
        //   };
        // },
        // deleteBridgeReducer: (state, action) => {
        //   const { bridgeId, orgId } = action.payload;
        //   delete state.allBridgesMap[bridgeId];
        //   state.org[orgId] = state.org[orgId].filter(bridge => bridge._id !== bridgeId);
        // },
        // integrationReducer: (state, action) => {
        //   const { intregration, id } = action.payload;
        //   const newdata = { ...state.allBridgesMap[id], integrationData: intregration }
        //   state.allBridgesMap[id] = newdata;
        // }
    },
});

export const {
    isPending,
    isError,
    getAllChatBotReducer,
    getChatBotDetailsReducer,
    createNewBotReducer,
    addorRemoveBridgeInChatBotReducer
} = ChatBot.actions;
export default ChatBot.reducer;
