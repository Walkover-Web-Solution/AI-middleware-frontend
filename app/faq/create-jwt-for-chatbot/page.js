"use client";
import Protected from '@/components/protected.js';

const CreateJwtToken = () => {
  return (
    <div id="someContent" className="m-14">
      <h1 id="someHeading" className="text-4xl font-bold mb-4">Create JWT Token For ChatBot</h1>
      <p className="mb-4">This document will guide you through the process of generating a JWT token for integrating AI middleware's ChatBot. The token will be created using your organization's ID (<code>org_id</code>), the ChatBot ID (<code>chatbot_id</code>), and the User ID (<code>user_id</code>). The token will be signed with an access key provided by AI middleware.</p>
      
      <h2 className="text-2xl font-semibold mb-2">
        <strong>Step 1: Gather Required Information</strong>
      </h2>
      <p className="mb-4">To create the JWT token, you will need the following information:</p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>org_id</strong>: Your organization's unique identifier.</li>
        <li><strong>chatbot_id</strong>: The ID of the ChatBot you are integrating.</li>
        <li><strong>user_id</strong>: The User ID that will be associated with the token.</li>
        <li><strong>access key</strong>: A secret key provided by AI middleware, used to sign the JWT token.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mb-2">
        <strong>Step 2: Create the JWT Token</strong>
      </h2>
      <p className="mb-4">The JWT token will be signed using the <strong>HS256</strong> algorithm. Below is an example of how to structure the JSON payload for the JWT token:</p>
      
      <pre className="bg-gray-800 text-white p-4 rounded mb-4">
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
      
      <p className="mb-4">After generating the JWT token, include it as a parameter within the script tag with the ID <code>'chatbot-main-script'</code>, specifically in the <code>embedToken</code> parameter. This will facilitate seamless integration.</p>
      
      <p className="mb-4"><strong>Note:</strong> Flows of an embed project will be different for all users, so make sure you pass a unique <code>user_id</code> to ensure every user has their own flows.</p>
    </div>
  );
}

export default Protected(CreateJwtToken);
