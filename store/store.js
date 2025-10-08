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

const persistConfig = { key: 'root', storage, version: 1 };

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
    prebuiltPromptReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
                ignoredPaths: ['register'], // Adjust the paths as necessary
            },
        }),
});

export const persistor = persistStore(store);
