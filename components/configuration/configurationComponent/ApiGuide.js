import CopyButton from '@/components/copyButton/copyButton';
import Link from 'next/link';
import React from 'react';

const ComplitionApi = (bridgeId) => {
  return `curl --location 'https://routes.msg91.com/api/proxy/1258584/29gjrmh24/api/v1/config/updatebridges/6618fbe6e29745d7c050841c' \\
--header 'pauthkey: YOUR_GENERATED_PAUTHKEY' \\
--header 'Content-Type: application/json' \\
--data '{ 
  "user": YOUR_USER_QUESTION,
  "bridge_id": "${bridgeId}",
  "variables": {
    ...VARIABLES_USED_IN_BRIDGE
  }
}'`
}

const ApiGuide = ({ params }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">API Guide</h1>

        <h2 className="text-xl font-bold mb-2">Step 1: Create `pauthkey`</h2>
        <p className="mb-4">
          Follow the on-screen instructions to create a new API key. Ignore if already created
          <br /> <Link href={`/org/${params.org_id}/apikey`} target='_blank' className="link link-primary">Create pauthkey</Link>
        </p>

        <h2 className="text-xl font-bold mb-2">Step 2: Use the API</h2>
        <div className="mockup-code relative">
          <CopyButton data={ComplitionApi(params.id)} />
          <pre className="break-words whitespace-pre-wrap">
            <code>
              {ComplitionApi(params.id)}
            </code>
          </pre>
        </div>

      </div>
    </div>
  );
};

export default ApiGuide;
