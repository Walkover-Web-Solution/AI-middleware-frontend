"use client";
import { store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "Login | Student",
};
const Wrapper = ({ children }) => {
  return (
    <>
      <Provider store={store}>
        <div className="w-full h-svh relative overflow-hidden">
          {children}
          <ToastContainer position="bottom-left" />

        </div>
      </Provider>
    </>
  );
};

export default Wrapper;
