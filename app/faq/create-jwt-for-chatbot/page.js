"use client";
import Protected from '@/components/protected.js';
const sampleCode = `{
  "org_id": "Tix4zpLRv9vq",
  "chatbot_id": "projQRZP6Nzm",
  "user_id": "idrisbohasdfasdf@gmail.com",
  "variables,"
}`

const CreateJwtToken = () => {
  return (
      <div id="someContent" className="m-14">
        <h1 id="someHeading" className="text-4xl font-bold mb-4">Create JWT Token For chatBot</h1>
        <p className="mb-4">This document will help you to understand how to create the JWT token for integrating the Viasocket.</p>
        
        <h2 className="text-2xl font-semibold mb-2">
          <strong>Creating JWT token</strong>
        </h2>
        <p className="mb-4">To create a JWT token, you need to get `org_id`, `user_id`, `chatbot_id`, and `access key`.</p>
        <p className="mb-4">We will be using the <strong>HS256</strong> algorithm to encrypt the JWT token.</p>
        <p className="mb-4">While setting up the SDK from Viasocket, we will provide you with the `chatbot_id`, `org_id`, and `access key`.</p>
        
        <div className="mb-6">
          <img src="https://phone91.com/static/Viasocket/Kb170204034603253Untitled_design_1.png" alt="JWT token diagram" className="w-full"/>
        </div>

        <p className="mb-4">Create a JSON using the required details as shown below.</p>

        <pre className="bg-gray-800 text-white p-4 rounded mb-4">
          <code>
            {}
            {"{"}
            <br />
            &nbsp;&nbsp;"org_id": "Tix4zpLRv9vq",
            <br />
            &nbsp;&nbsp;"chatbot_id": "projQRZP6Nzm",
            <br />
            &nbsp;&nbsp;"user_id": "idrisbohasdfasdf@gmail.com"
            <br />
            {"}"}
          </code>
        </pre>

        <p className="mb-4">Create the JWT token using the JSON and provided access key.</p>
        <p className="mb-4">After generating the JWT token, include it as a parameter within the script tag with the ID 'viasocket-embed-main-script', specifically in the embedToken parameter. This will facilitate seamless integration.</p>
        <p className="mb-4"><strong>Note:</strong> Flows of an embed project will be different for all users, so make sure you pass a unique `user_id` to ensure every user has their own flows.</p>
      </div>
  );
}

export default Protected(CreateJwtToken);