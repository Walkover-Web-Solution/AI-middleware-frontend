import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import authDataReducer from "./reducer/authkeyReducer";
import bridgeReducer from "./reducer/bridgeReducer";
import ChatBot from "./reducer/ChatBotReducer";
import dryRunReducer from "./reducer/dryRunReducer";
import historyReducer from "./reducer/historyReducer";
import knowledgeBaseReducer from "./reducer/knowledgeBaseReducer";
import modelReducer from "./reducer/modelReducer";
import orgReducer from "./reducer/orgReducer";
import responseTypeReducer from "./reducer/responseTypeReducer";
import userDetailsReducer from "./reducer/userDetailsReducer";
import webhookAlertReducer from "./reducer/webhookAlertReducer";
import testCasesReducer from "./reducer/testCasesReducer";
import serviceReducer from "./reducer/serviceReducer";
import flowDataReducer from "./reducer/flowDataReducer";
import integrationReducer from "./reducer/integrationReducer";
import authReducer from "./reducer/authReducer";
import gtwyAgentReducer from "./reducer/gwtyAgentReducer";
import orchestralFlowReducer from "./reducer/orchestralFlowReducer";
import prebuiltPromptReducer from "./reducer/prebuiltPromptReducer";
import apiKeysReducer from "./reducer/apiKeysReducer";
import variableReducer from "./reducer/variableReducer";
import chatReducer from "./reducer/chatReducer";
import appInfoReducer from "./reducer/appInfoReducer";
const createNoopStorage = () => {
    return {
        getItem(_key) {
            return Promise.resolve(null);
        },
        setItem(_key, value) {
            return Promise.resolve(value);
        },
        removeItem(_key) {
            return Promise.resolve();
        },
    };
};

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

// Persist ONLY API Keys slice. Do not persist bridge or any other slices.
// Note: whitelist keys refer to the keys used in combineReducers below.
const persistConfig = {
    key: 'root',
    storage,
    // Add the reducer keys you actually want to persist here.
    // IMPORTANT: These must match the keys defined in combineReducers below.
    whitelist: [
        'authDataReducer',
        'bridgeReducer',
        'orgReducer',
        'userDetailsReducer',
        'serviceReducer',
        'modelReducer',
        'flowDataReducer',
        'apiKeysReducer',
        'variableReducer',
        'orchestralFlowReducer',
        'appInfoReducer',
        // Add/remove more slice keys as needed
    ],
};

const rootReducer = combineReducers({
    bridgeReducer,
    modelReducer,
    historyReducer,
    dryRunReducer,
    userDetailsReducer,
    authDataReducer,
    orgReducer,
    responseTypeReducer,
    ChatBot,
    webhookAlertReducer,
    knowledgeBaseReducer,
    testCasesReducer,
    serviceReducer,
    gtwyAgentReducer,
    flowDataReducer,
    integrationReducer,
    authReducer,
    orchestralFlowReducer,
    prebuiltPromptReducer,
    apiKeysReducer,
    variableReducer,
    chatReducer,
    appInfoReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
                ignoredPaths: ['register'], // Adjust the paths as necessary
            },
        }),
});

export const persistor = persistStore(store);
