"use client";
import Navbar from "@/components/navbar";
import { getAllBridgesAction, getAllResponseTypesAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function layoutOrgPage({ children, params }) {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getAllChatBotAction(params.org_id))
        dispatch(getAllResponseTypesAction(params.org_id));
    }, []);
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
