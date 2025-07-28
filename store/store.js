import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { bridgeApi } from './services/bridgeApi';
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
import { modelApi } from "./services/modelApi";

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
    // Add the RTK Query API reducer
    [bridgeApi.reducerPath]: bridgeApi.reducer,
    [modelApi.reducerPath]: modelApi.reducer,
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
    authReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Add RTK Query actions to ignored actions
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    `${bridgeApi.reducerPath}/executeQuery/fulfilled`,
                    `${bridgeApi.reducerPath}/executeMutation/fulfilled`,
                    `${modelApi.reducerPath}/executeQuery/fulfilled`,
                    `${modelApi.reducerPath}/executeMutation/fulfilled`,
                    // Other RTK Query action types you want to ignore
                  ],
                ignoredPaths: ['register'], // Adjust the paths as necessary
            },
        }).concat(bridgeApi.middleware).concat(modelApi.middleware),
});

export const persistor = persistStore(store);

// Setup listeners for RTK Query - enables refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
