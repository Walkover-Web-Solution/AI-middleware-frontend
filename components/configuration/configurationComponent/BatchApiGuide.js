import CopyButton from '@/components/copyButton/copyButton';
import Link from 'next/link';
import React from 'react';

const BatchApi = (bridgeId, versionId) => {
    return (
        `curl --location '${process.env.NEXT_PUBLIC_PYTHON_SERVER_WITH_PROXY_URL}/api/v2/model/batch/chat/completion' \\\n` +
        `--header 'pauthkey: YOUR_GENERATED_PAUTHKEY' \\\n` +
        `--header 'Content-Type: application/json' \\\n` +
        `--data '{\n` +
        `    "webhook": {\n` +
        `        "url": "YOUR WEBHOOK URL",\n` +
        `        "header": {}\n` +
        `    },\n` +
        `    "batch": [\n` +
        `        "YOUR QUESTION 1",\n` +
        `        "YOUR QUESTION 2",\n` +
        `        "YOUR QUESTION 3"\n` +
        `    ],\n` +
        `    "agent_id": "${bridgeId || ''}",\n` +
        `    "version_id": "${versionId || ''}"\n` +
        `}'`
    );
}

const BatchResponseFormat = () => {
    return `{
    "success": true,
    "response": "Data will be sent on webhook within 24 Hours"
  }`
}

const Section = ({ title, caption, children }) => (
    <div className="flex items-start flex-col justify-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 block">{caption}</p>
        {children}
    </div>
);

const BatchApiGuide = ({ params }) => {
    return (
        <div className="min-h-screen gap-4 flex flex-col">
            <div className="flex flex-col gap-4 bg-white rounded-lg shadow-md p-4">
                <Section title="Step 1" caption="Create `pauthkey`" />
                <p className=" text-sm">
                    Follow the on-screen instructions to create a new API key. Ignore if already created
                    <br /> <Link href={`/org/${params.org_id}/pauthkey`} target='_blank' className="link link-primary">Create pauthkey</Link>
                </p>
            </div>
            <div className="flex flex-col gap-4 bg-white rounded-lg shadow-md p-4">
                <Section title="Step 2" caption="Use the Batch API" />
                <div className="mockup-code relative">
                    <CopyButton data={BatchApi(params.id, params.version)} />
                    <pre className="break-words whitespace-pre-wrap ml-4">
                        <code>
                            {BatchApi(params.id, params.version)}
                        </code>
                    </pre>
                </div>
                <p className=" text-sm"><strong>Note:</strong> Ensure that the 'webhook_url' is correctly set to receive batch processing updates.
                </p>
            </div>
            <div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg p-4">
                <Section title="Response Format" />
                <div className="mockup-code relative">
                    <CopyButton data={BatchResponseFormat()} />
                    <pre className="break-words whitespace-pre-wrap">
                        <code>
                            {BatchResponseFormat()}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default BatchApiGuide;