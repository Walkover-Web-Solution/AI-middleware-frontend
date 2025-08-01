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
import { serviceApi } from "./services/serviceApi";
import { apiKeyApi } from "./services/apiKeyApi";
import { integrationApi } from "./services/IntegrationApi";
import { bridgeLocalApi } from "./services/bridgeLocalApi";
import { orgApi } from "./services/orgApi";
import { userApi } from "./services/userApi";
import { knowledgeBaseApi } from "./services/knowledgeBaseApi";
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
    [serviceApi.reducerPath]: serviceApi.reducer,
    [apiKeyApi.reducerPath]: apiKeyApi.reducer,
    [integrationApi.reducerPath]: integrationApi.reducer,
    [bridgeLocalApi.reducerPath]: bridgeLocalApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [knowledgeBaseApi.reducerPath]: knowledgeBaseApi.reducer,
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
                    `${serviceApi.reducerPath}/executeQuery/fulfilled`,
                    `${serviceApi.reducerPath}/executeMutation/fulfilled`,
                    `${bridgeApi.reducerPath}/executeQuery/fulfilled`,
                    `${bridgeApi.reducerPath}/executeMutation/fulfilled`,
                    `${modelApi.reducerPath}/executeQuery/fulfilled`,
                    `${modelApi.reducerPath}/executeMutation/fulfilled`,
                    `${apiKeyApi.reducerPath}/executeQuery/fulfilled`,
                    `${apiKeyApi.reducerPath}/executeMutation/fulfilled`,
                    `${integrationApi.reducerPath}/executeQuery/fulfilled`,
                    `${integrationApi.reducerPath}/executeMutation/fulfilled`,
                    `${bridgeLocalApi.reducerPath}/executeQuery/fulfilled`,
                    `${bridgeLocalApi.reducerPath}/executeMutation/fulfilled`,
                    `${orgApi.reducerPath}/executeQuery/fulfilled`,
                    `${orgApi.reducerPath}/executeMutation/fulfilled`,
                    `${userApi.reducerPath}/executeQuery/fulfilled`,
                    `${userApi.reducerPath}/executeMutation/fulfilled`,
                    `${knowledgeBaseApi.reducerPath}/executeQuery/fulfilled`,
                    `${knowledgeBaseApi.reducerPath}/executeMutation/fulfilled`,
                    // Other RTK Query action types you want to ignore
                  ],
                ignoredPaths: ['register'], // Adjust the paths as necessary
            },
        }).concat(bridgeApi.middleware).concat(modelApi.middleware).concat(serviceApi.middleware).concat(apiKeyApi.middleware).concat(integrationApi.middleware).concat(bridgeLocalApi.middleware).concat(orgApi.middleware).concat(userApi.middleware).concat(knowledgeBaseApi.middleware),
});

export const persistor = persistStore(store);

// Setup listeners for RTK Query - enables refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
