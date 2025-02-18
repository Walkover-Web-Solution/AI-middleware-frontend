import CopyButton from '@/components/copyButton/copyButton';
import { useCloseSliderOnEsc } from '@/components/historyPageComponents/assistFile';
import GenericTable from '@/components/table/table';
import { useCustomSelector } from '@/customHooks/customSelector';
import { genrateSummaryAction } from '@/store/action/bridgeAction';
import { generateAccessKeyAction } from '@/store/action/orgAction';
import { Copy, Check, CircleX } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

function KnowledgeBaseIntegrationSlider({params, openKnowledgeBaseSlider, setOpenKnowledgeBaseSlider }) {
    const dispatch =useDispatch();
    const access_key = useCustomSelector((state) =>
        state?.userDetailsReducer?.organizations?.[params.org_id]?.meta?.auth_token || ""
      );

    const [copied, setCopied] = useState({
        accessKey: false,
    });
    const sidebarRef = useRef();

    useCloseSliderOnEsc(setOpenKnowledgeBaseSlider);

    const handleCopy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(prev => ({...prev, [key]: true}));
            setTimeout(() => {
                setCopied(prev => ({...prev, [key]: false}));
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleGenerateAccessKey = () =>{
        dispatch(generateAccessKeyAction(params?.org_id))
    }

    const renderStepOne = ({orgId, access_key}) => {
        return (
            <div className="p-6">
                <div className="flex flex-col gap-8">
                    {/* Step 1 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Step 1: Connect Knowledge Base</h3>
                        <div className="bg-base-200 p-4 rounded-lg">
                            <div className="mb-6"> 
                                <p className="text-sm font-medium mb-2">Sample API Configuration:</p>
                                <pre className="bg-base-100 p-3 rounded-md text-sm overflow-x-auto">
                                    {`{
    "org_id": ${orgId},
    "user_id": "unique_user_id"
}`}
                                </pre>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Access Key</label>
                                    <div className="p-2 bg-base-100 rounded-md border border-base-300 flex items-center justify-between">
                                        <span className="text-sm"> {access_key}</span>
                                        <div className="tooltip" data-tip={copied.accessKey ? "Copied!" : "Copy"}>
                                            
                                            <button 
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => handleCopy('api_key_1234567890', 'accessKey')}
                                            >
                                                {copied.accessKey ? <Check size={16} className="text-success"/> : <Copy size={16}/>}
                                            </button>

                                        </div>
                                        
                                    </div>
                                    {!access_key &&<button className='btn bg-none outline-none mt-4 text-base-content' onClick={handleGenerateAccessKey}>Genrate Access key</button>}
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium mb-1">Org Id</label>
                                    <div className="p-2 bg-base-100 rounded-md border border-base-300 flex items-center justify-between">
                                        <span className="text-sm"></span>
                                        <div className="tooltip" data-tip={copied.orgIdUrl ? "Copied!" : "Copy"}>
                                            <button 
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => handleCopy('https://api.example.com/v1', 'orgIdUrl')}
                                            >
                                                {copied.orgIdUrl ? <Check size={16} className="text-success"/> : <Copy size={16}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Project Id</label>
                                    <div className="p-2 bg-base-100 rounded-md border border-base-300 flex items-center justify-between">
                                        <span className="text-sm">some data</span>
                                        <div className="tooltip" data-tip={copied.projectId ? "Copied!" : "Copy"}>
                                            <button 
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => handleCopy('secret_key_1234567890', 'projectId')}
                                            >
                                                {copied.projectId ? <Check size={16} className="text-success"/> : <Copy size={16}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const renderStepTwo = () => {
        const DataObject = {
            script: `<script\n      id="chatbot-main-script"\n      embedToken=" <embed token here> "\n      src="https://chatbot-embed.viasocket.com/chatbot-prod.js"\n     ></script>`,
            event: `window.addEventListener('message', (event) => {
                const receivedData = event.data;
             });`,
            sendData: `window.SendDataToChatbot({ \n      bridgeName: '<slugName_of_bridge>',\n      threadId: <id>,\n      parentId: '<parent_container_id>',\n      fullScreen: 'true/false',\n      hideCloseButton: 'true/false',\n      hideIcon: 'true/false',\n      variables: {}\n    });`,
            open: `window.openChatbot()`,
            close: `window.closeChatbot()`,
        };
        const headers = ['Parameter', 'Type', 'Description', 'Required'];
        const data = [
            ['bridgeName', 'string', 'The slug name of the bridge.', 'true'],
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

        const methods = [
            { label: '1. Use This method to send data when needed', code: DataObject.sendData },
            { label: '2. Use this method to open chatbot explicitly', code: DataObject.open },
            { label: '3. Use this method to close chatbot explicitly', code: DataObject.close },
        ];
        return (
            <div className="flex w-full flex-col gap-4 bg-white rounded-lg shadow p-8">
            <Section title="Step 2" caption="Add below code in your product." />
            <div className="mockup-code">
                <CopyButton data={DataObject.script} />
                <pre data-prefix=">" className="text-error" ><code>&lt;script </code></pre>
                <pre data-prefix=">" className="text-error"><code className="text-error"> id= </code><code className="text-warning">"chatbot-main-script"</code></pre>
                <pre data-prefix=">" className="text-error"><code> embedToken=</code><code className="text-warning">"Enter Embed Token here"</code></pre>
                <pre data-prefix=">" className="text-error"><code> src=</code><code className="text-warning">"https://chatbot-embed.viasocket.com/chatbot-prod.js"</code></pre>
                <pre data-prefix=">" className="text-error"><code>&lt;/script&gt;</code></pre>
            </div>

            {/* <Section title="Usage" caption="Use this methods to receive data." />
            <CodeBlock code={DataObject.event} /> */}

            {/* <Section title="Available functions" caption="Use this methods to interact with chatbot" />
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
            ))} */}
        </div>
        );
    }
    return (
        <div
            ref={sidebarRef}
            className={`fixed inset-y-0 right-0 border-l-2 bg-base-100 shadow-2xl rounded-md ${openKnowledgeBaseSlider ? "w-full md:w-1/2 lg:w-1/2 opacity-100" : "w-0"
                } overflow-y-auto bg-gradient-to-br from-base-200 to-base-100 transition-all duration-300 ease-in-out z-[999]`}
        >
            <button 
                onClick={() => setOpenKnowledgeBaseSlider(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-300 transition-colors"
            >
              <CircleX />
            </button>

            {/* Step 1 */}
            {renderStepOne({orgId:params?.org_id,access_key})}

            {/* Step 2 */}
            {renderStepTwo()}
        </div>
    );
}

export default KnowledgeBaseIntegrationSlider;
