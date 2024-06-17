import React, { useState } from 'react';
import CopyButton from "../copyButton/copyButton";

const DataObject = {
    script: `<script\n      id="chatbot-main-script"\n      embedToken=" <embed token here> "\n      src="https://chatbot-embed.viasocket.com/chatbot-prod.js"\n     ></script>`,
    event: `window.addEventListener('message', (event) => {
        const receivedData = event.data;
     });`,
    sendData: `window.SendDataToInterface({ \n      bridgeName: 'Hello World',\n      threadId: projectId,\n      parentId: '<parent_container_id>', // When you want to open chatbot in a container, make sure fullScreen=true\n      fullScreen: 'true/false',\n      hideCloseButton: 'true/false',\n      hideIcon: 'true/false',\n      variables: {}\n    });`,
    open: `window.openChatbot()`,
    close: `window.closeChatbot()`,
};

const CodeBlock = ({ label, code }) => (
    <div className="mockup-code">
        <CopyButton data={code} />
        <pre data-prefix=">" className="text-info"><code>{code}</code></pre>
    </div>
);

const Section = ({ title, caption, children }) => (
    <div className="flex items-start flex-col justify-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <caption className="text-xs text-gray-600 block">{caption}</caption>
        {children}
    </div>
);

const SecondStep = () => {
    const methods = [
        { label: '1. Use This method to send data when needed', code: DataObject.sendData },
        { label: '2. Use this method to open chatbot explicitly', code: DataObject.open },
        { label: '3. Use this method to close chatbot explicitly', code: DataObject.close },
    ];

    return (
        <div className="flex w-full flex-col gap-4 bg-white rounded-lg shadow p-4">
            <Section title="Step Two" caption="Add below code in your product." />
            <CodeBlock code={DataObject.script} />

            <Section title="Usage" caption="Use this methods to receive data." />
            <CodeBlock code={DataObject.event} />

            <Section title="Available functions" caption="Use this methods to interact with chatbot" />
            {methods?.map((method, index) => (
                <div key={index}>
                    <small>{method.label}</small>
                    <CodeBlock code={method.code} />
                </div>
            ))}
        </div>
    );
};

export default SecondStep;
