import CopyButton from '@/components/copyButton/CopyButton';
import Protected from '@/components/Protected';
import GenericTable from '@/components/table/Table';
import Link from 'next/link';
import React from 'react';
import { extractPromptVariables } from '@/utils/utility';

const ComplitionApi = (bridgeId, modelType, isEmbedUser, prompt = '') => {
  const url = `${process.env.NEXT_PUBLIC_PYTHON_SERVER_WITH_PROXY_URL}/api/v2/model/chat/completion`;
  const headers = isEmbedUser
    ? `--header 'Content-Type: application/json'`
    : `--header 'pauthkey: YOUR_GENERATED_PAUTHKEY' \\
  --header 'Content-Type: application/json'`;

  // Extract variables from prompt
  const usedVariables = extractPromptVariables(prompt);
  
  // Generate variables object with example values
  const variablesObject = usedVariables.length > 0 
    ? usedVariables.map(variable => `    "${variable}": "YOUR_${variable.toUpperCase()}_VALUE"`).join(',\n')
    : '    // No variables found in prompt';

  const body = `{
  ${modelType === 'embedding' ? '"text": "YOUR_TEXT_HERE",' : '"user": "YOUR_USER_QUESTION",'}
  "agent_id": "${bridgeId}",
  "thread_id": "YOUR_THREAD_ID",
  "response_type": "text", // optional
  "variables": {
${variablesObject}
  }
}`;

  return `curl --location '${url}' \\\n  ${headers} \\\n  --data '${body}'`;
};
const headers = ['Parameter', 'Type', 'Description', 'Required'];
const data = [
  ['user', 'string', 'The user\'s question ( the query asked by the user)', 'true'],
  ['agent_id', 'string', 'The unique ID of the agent to process the request.', 'true'],
  ['thread_id', 'string', 'The ID to maintain conversation context across messages.', 'false'],
  ['response_type', 'string', 'Specifies the format of the response: "text", "json".', 'false'],
  ['variables', 'object', 'A key-value map of dynamic variables used in the agent\'s prompt.', 'false'],
];

const ResponseFormat = () => {
  return `{
    "success": true,
    "response": {
         "data": {
            "id": "chatcmpl-785654654v4ew54656",
            "content": "Response from the AI",
            "model": "Your selected model",
            "role": "assistant",
            "finish_reason": "stop"
         },
         "usage": {
            "input_tokens": 269,
            "output_tokens": 10,
            "total_tokens": 279
         }
    }
  }`
}
const Section = ({ title, caption, children }) => (
  <div className="flex items-start flex-col justify-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-gray-600 block">{caption}</p>
    {children}
  </div>
);

const ApiGuide = ({ params, searchParams, modelType, isEmbedUser, prompt = '' }) => {
  return (
    <div className="min-h-screen gap-4 flex flex-col">
      {!isEmbedUser && <div className="flex flex-col gap-4 bg-base-100 rounded-lg shadow-md p-4">
        <Section title="Step 1" caption="Create Auth Key" />
        <p className=" text-sm">
          Follow the on-screen instructions to create a new Auth Key. Ignore if already created
          <br /> <Link href={`/org/${params.org_id}/pauthkey`} target='_blank' className="link link-primary">Create Auth Key</Link>
        </p>
      </div>}
      <div className="flex flex-col gap-4 bg-base-100 rounded-lg shadow-md p-4">
        <Section title={`${isEmbedUser ? 'Step 1' : 'Step 2'}`} caption="Use the API" />
        <div className="mockup-code relative">
          <CopyButton data={ComplitionApi(params.id, modelType, isEmbedUser, prompt)} />
          <pre className="break-words whitespace-pre-wrap">
            <code>
              {ComplitionApi(params.id, modelType, isEmbedUser, prompt)}
            </code>
          </pre>
        </div>
        <GenericTable headers={headers} data={data} />
        <p className=" text-sm"><strong>Note:</strong> If the value of response_type is undefined, the output will be in JSON format by default.
        </p>
      </div>
      <div className="flex flex-col gap-4 bg-base-100 rounded-lg shadow-lg p-4">
        <Section title="Response Format" />
        <div className="mockup-code relative">
          <CopyButton data={ResponseFormat()} />
          <pre className="break-words whitespace-pre-wrap">
            <code>
              {ResponseFormat()}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Protected(ApiGuide);