import CopyButton from '@/components/copyButton/copyButton';
import Link from 'next/link';
import React from 'react';

const ComplitionApi = (bridgeId) => {
  return `curl --location '${process.env.NEXT_PUBLIC_PYTHON_SERVER_URL}/api/v2/model/chat/completion' \\
  --header 'pauthkey: YOUR_GENERATED_PAUTHKEY' \\
  --header 'Content-Type: application/json' \\
  --data '{ 
    "user": YOUR_USER_QUESTION,
    "bridge_id": "${bridgeId}",
    "variables": {
      // ...VARIABLES_USED_IN_BRIDGE
    }
  }'`
}

const Section = ({ title, caption, children }) => (
  <div className="flex items-start flex-col justify-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-gray-600 block">{caption}</p>
    {children}
  </div>
);

const ApiGuide = ({ params }) => {
  return (
    <div className="min-h-screen gap-4 flex flex-col">
      <div className="flex flex-col gap-4 bg-white rounded-lg shadow-md p-4">

        <Section title="Step 1" caption="Create `pauthkey`" />

        <p className=" text-sm">
          Follow the on-screen instructions to create a new API key. Ignore if already created
          <br /> <Link href={`/org/${params.org_id}/apikey`} target='_blank' className="link link-primary">Create pauthkey</Link>
        </p>
      </div>
      <div className="flex flex-col gap-4 bg-white rounded-lg shadow-md p-4">
        <Section title="Step 2" caption="Use the API" />
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
