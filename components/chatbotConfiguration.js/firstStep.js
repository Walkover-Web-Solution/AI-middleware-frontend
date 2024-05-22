import { createOrgToken } from "@/api";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function InputWithCopyButton({ label, placeholder, value, disabled }) {
    const copyToClipboard = () => { navigator.clipboard.writeText(value) };

    return (
        <div className="join form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">{label}</span>
            </div>
            <div className="flex items-center justify-start">
                <input className="input input-bordered join-item input-sm w-[25rem]" placeholder={placeholder} value={value} disabled={disabled} />
                <button className="btn join-item btn-sm" onClick={copyToClipboard}><Copy size={16} /></button>
            </div>
        </div>
    );
}


export default function PrivateFormSection({ params }) {
    const [showInput, setShowInput] = useState(false); // State to control the visibility
    const router = useRouter();
    const [accessKey, setAccessKey] = useState("");
    const handleGetAccessKey = async () => {
        const response = await createOrgToken(params?.org_id);
        setAccessKey(response?.data?.orgAcessToken);
        setShowInput(true)
    }
    return (
        <div className="flex items-start justify-start flex-col gap-4 bg-white rounded-lg shadow p-4">
            <div>
                <h3 className="text-lg font-semibold">Step One</h3>
                <caption className="text-xs text-gray-600">AccessType</caption>
            </div>
            <div className="flex flex-col gap-2 ">
                {showInput ? <InputWithCopyButton label="access key" placeholder="access key" value={accessKey} /> : <button className="btn btn-primary w-fit btn-sm" onClick={handleGetAccessKey}>Get Access Key</button>}
                <InputWithCopyButton label="org_id" placeholder="org_id" value={params?.org_id} disabled />
                {/* <InputWithCopyButton label="project_id" placeholder="project_id" /> */}
                <InputWithCopyButton label="chatbot_id" placeholder="chatbot_id" value={params?.chatbot_id} disabled />
            </div>
            <p className="text-sm">Generate a JWT token using project_id, org_id, interface_id, and user_id, then sign it with the access key.</p>
            <a className="link link-hover text-sm" target="_blank" href="https://viasocket.com/faq/create-jwt-token">Learn, How to create JWT token?</a>
        </div >
    );
}