import { BuildingIcon, BotIcon, UserIcon, KeyIcon } from '@/components/Icons';

export const metadata = {
  title: "Integrate Chatbot | GTWY AI",
  description: "Learn how to create JWT tokens for integrating GTWY AI chatbots into your applications - step-by-step guide for secure authentication",
  category: 'technology',
  generator: 'GTWY AI',
  keywords: "gtwy ai, ai middleware, ai integration platform, ai chatbot service, openai integration, anthropic api, groq ai, o1 ai, ai automation tools, ai api gateway, large language model integration, llm api, ai software solutions, ai-powered chatbot, ai model deployment, machine learning api, enterprise ai solutions, ai infrastructure, artificial intelligence services, custom ai development, ai orchestration, ai cloud services, multi-ai platform, ai business solutions, ai developer tools, ai framework, gpt integration, ai tools for business, llm deployment, ai model hosting, ai tech stack, ai-powered applications, smart ai assistant, best ai middleware, chatbot development platform, ai-powered automation",
};

const CreateJwtToken = async () => {
  return (
    <div className="w-full p-8 bg-base-100 rounded-xl shadow-lg">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Create JWT Token For ChatBot</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            This document will guide you through the process of generating a JWT token for integrating gtwy.ai ChatBot. The token will be created using your organization's ID (<code>org_id</code>), the ChatBot ID (<code>chatbot_id</code>), and the User ID (<code>user_id</code>). The token will be signed with an access key provided by gtwy.ai.
          </p>
        </div>


        {/* Step 1 Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center mr-3 shadow-md">1</span>
            Gather Required Information
          </h2>
          <p className="text-gray-600 mb-4">To create the JWT token, you will need the following information:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <BuildingIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <strong className="text-blue-600">org_id</strong>: Your organization's unique identifier.
              </div>
            </li>
            <li className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <BotIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <strong className="text-blue-600">chatbot_id</strong>: The ID of the ChatBot you are integrating.
              </div>
            </li>
            <li className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <strong className="text-blue-600">user_id</strong>: The User ID that will be associated with the token.
              </div>
            </li>
            <li className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <KeyIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <strong className="text-blue-600">access key</strong>: A secret key provided by gtwy.ai, used to sign the JWT token.
              </div>
            </li>
          </ul>
        </div>

        {/* Step 2 Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center mr-3 shadow-md">2</span>
            Create the JWT Token
          </h2>
          <p className="text-gray-600 mb-4">The JWT token will be signed using the <strong className="text-blue-600">HS256</strong> algorithm. Below is an example of how to structure the JSON payload for the JWT token:</p>

          <div className="bg-gray-800 p-6 rounded-lg mb-4">
            <pre className="text-sm text-gray-200 overflow-x-auto">
              <code>
                {"{"}
                <br />
                &nbsp;&nbsp;"org_id": "1277",
                <br />
                &nbsp;&nbsp;"chatbot_id": "6650628ad48e20e61cf701a0",
                <br />
                &nbsp;&nbsp;"user_id": "your_user_id_here",
                <br />
                &nbsp;&nbsp;"variables": {"{"} "key": "value" {"}"}
                <br />
                {"}"}
              </code>
            </pre>
          </div>

          <p className="text-gray-600 mb-4">
            After generating the JWT token, include it as a parameter within the script tag with the ID <code className="bg-gray-100 px-2 py-1 rounded-md">'chatbot-main-script'</code>, specifically in the <code className="bg-gray-100 px-2 py-1 rounded-md">embedToken</code> parameter. This will facilitate seamless integration.
          </p>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800">
              <strong>Note:</strong> Flows of an embed project will be different for all users, so make sure you pass a unique <code className="bg-yellow-100 px-2 py-1 rounded-md">user_id</code> to ensure every user has their own flows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateJwtToken;
