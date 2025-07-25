import React, { useState } from 'react';
import CopyButton from "../copyButton/copyButton";
import GenericTable from '../table/table';

const DataObject = {
    script: `<script\n      id="chatbot-main-script"\n      embedToken=" <embed token here> "\n      src="https://chatbot-embed.viasocket.com/chatbot-prod.js"\n     ></script>`,
    event: `window.addEventListener('message', (event) => {
        const receivedData = event.data;
     });`,
    sendData: `window.Chatbot.sendData({ \n      bridgeName: '<slugName_of_bridge>',\n      threadId: <id>,\n      parentId: '<parent_container_id>',\n      fullScreen: 'true/false',\n      hideCloseButton: 'true/false',\n      hideIcon: 'true/false',\n      variables: {}\n    });`,
    openChatbot: `window.Chatbot.open();`,
    closeChatbot: `window.Chatbot.close();`,
    showIcon: `window.Chatbot.show();`,
    hideIcon: `window.Chatbot.hide();`,
    reloadChats: `window.Chatbot.reloadChats();`,
    askAi: `window.Chatbot.askAi(data);`
};
const headers = ['Parameter', 'Type', 'Description', 'Required'];
const data = [
    ['bridgeName', 'string', 'The slug name of the agent.', 'true'],
    ['threadId', 'string', 'The ID corresponding to the chat store.', 'true'],
    ['parentId', 'string', 'The parent container ID in which you want to open chatbot.', 'false'],
    ['fullScreen', 'boolean', 'Whether to open the chatbot in full screen.', 'false'],
    ['hideCloseButton', 'boolean', 'Whether to hide the close button.', 'false'],
    ['hideIcon', 'boolean', 'Whether to hide the icon.', 'false'],
    ['variables', 'object', 'Additional variables for the chatbot.', 'false'],
];

const CodeBlock = ({ label, code }) => (
    <div className="mockup-code">
        <CopyButton data={code} />
        <pre data-prefix=">" className=""><code>{code}</code></pre>
    </div>
);

const Section = ({ title, caption, children }) => (
    <div className="flex items-start flex-col justify-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 block">{caption}</p>
        {children}
    </div>
);

const SecondStep = () => {
    const methods = [
        { label: '1. Use This method to send data when needed', code: DataObject.sendData },
        { label: '2. Use this method to open chatbot explicitly', code: DataObject.openChatbot },
        { label: '3. Use this method to close chatbot explicitly', code: DataObject.closeChatbot },
        { label: '4. Use this method to show chatbot icon explicitly', code: DataObject.showIcon },
        { label: '5. Use this method to hide chatbot icon explicitly', code: DataObject.hideIcon },
        { label: '6. Use this method to reload chatbot explicitly', code: DataObject.reloadChats },
        { label: '7. Use this method to ask ai explicitly', code: DataObject.askAi },
    ];

    return (
        <div className="flex w-full flex-col gap-4 bg-white rounded-lg shadow p-4">
            <Section title="Step 2" caption="Add below code in your product." />
            <div className="mockup-code">
                <CopyButton data={DataObject.script} />
                <pre data-prefix=">" className="text-error" ><code>&lt;script </code></pre>
                <pre data-prefix=">" className="text-error"><code className="text-error"> id= </code><code className="text-warning">"chatbot-main-script"</code></pre>
                <pre data-prefix=">" className="text-error"><code> embedToken=</code><code className="text-warning">"Enter Embed Token here"</code></pre>
                <pre data-prefix=">" className="text-error"><code> src=</code><code className="text-warning">"https://chatbot-embed.viasocket.com/chatbot-prod.js"</code><code className='text-error'>&gt;</code></pre>
                <pre data-prefix=">" className="text-error"><code>&lt;/script&gt;</code></pre>
            </div>

            <Section title="Usage" caption="Use this methods to receive data." />
            <CodeBlock code={DataObject.event} />

            <Section title="Available functions" caption="Use this methods to interact with chatbot" />
            {methods?.map((method, index) => (
                <div key={index}>
                    <small>{method.label}</small>
                    <CodeBlock code={method.code} />
                    {
                        index == 0 && (
                            <div className=' my-5'>
                                <small>Variables, you can pass to the chatbot using SendDataToChatbot method.</small>
                                <GenericTable headers={headers} data={data} />
                            </div>
                        )

                    }
                </div>
            ))}
        </div>
    );
};

export default SecondStep;
