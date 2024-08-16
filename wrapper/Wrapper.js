"use client";
import { persistor, store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from "redux-persist/integration/react";

export const metadata = {
  title: "Login | Student",
};
/**
 * The Wrapper component is the top level component of our application
 * It provides the Redux store to all the child components
 * It also has a ToastContainer for the react-toastify notifications
 */
const Wrapper = ({ children }) => {
  // Return a Provider component that wraps all the child components
  // with the Redux store
  // It also has a div that wraps all the child components
  // And adds a ToastContainer for the notifications
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="w-screen">
            {/* All the child components */}
            {children}
            {/* Notification toast container */}
            <ToastContainer position="bottom-left" />
          </div>
        </PersistGate>
      </Provider>
    </>
  );
};

export default Wrapper;
