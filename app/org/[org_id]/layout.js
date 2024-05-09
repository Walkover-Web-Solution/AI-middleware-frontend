"use client";
import Navbar from "@/components/navbar";

export default function layoutOrgPage({ children, params }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
