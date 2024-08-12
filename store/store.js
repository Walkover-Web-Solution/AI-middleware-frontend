import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import bridgeReducer from "./reducer/bridgeReducer";
import modelReducer from "./reducer/modelReducer";
import historyReducer from "./reducer/historyReducer";
import dryRunReducer from "./reducer/dryRunReducer";
import userDetailsReducer from "./reducer/userDetailsReducer";
import authDataReducer from "./reducer/authkeyReducer";
import orgReducer from "./reducer/orgReducer";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";
import responseTypeReducer from "./reducer/responseTypeReducer";
import ChatBot from "./reducer/ChatBotReducer";

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

const persistConfig = { key: 'root', storage };

const rootReducer = combineReducers({
    bridgeReducer,
    modelReducer,
    historyReducer,
    dryRunReducer,
    userDetailsReducer,
    authDataReducer,
    orgReducer,
    responseTypeReducer,
    ChatBot
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
