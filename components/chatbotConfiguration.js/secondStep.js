import { Copy } from "lucide-react";

export default function SecondStep() {
    const copyToClipboardProduct = () => {
        const scriptText = `<script\n  id="interface-main-script"\n  interface_id="664aeb1b522256514270d836"\n  src="https://interface-embed.viasocket.com/interface-dev.js"\n></script>`;
        navigator.clipboard.writeText(scriptText)
    };
    const copyToClipboardReceiveData = () => {
        // const scriptText = `<script\n  id="interface-main-script"\n  interface_id="664aeb1b522256514270d836"\n  src="https://interface-embed.viasocket.com/interface-dev.js"\n></script>`;
        const scriptText = `
        <!-- Use this event listner to listen for the event, sent by iframe -->
           window.addEventListener('message', (event) => {
           const receivedData = event.data;
           });
     
        <!-- Use This method to send data when needed -->
           window.SendDataToInterface({ bridgeName: 'Hello World', threadId: projectId, variables: {}, ...});
       `
        navigator.clipboard.writeText(scriptText)
    };

    return (
        <div className="flex w-full flex-col gap-4 bg-white rounded-lg shadow p-4">
            <div className="flex items-start flex-col justify-center">
                <h3 className="text-lg font-semibold">Step Two</h3>
                <caption className="text-xs text-gray-600 block">Add below code in your product.</caption>
            </div>


            <div className="mockup-code">
                <Copy className="absolute right-5 top-5 cursor-pointer text-white" size={'20px'} onClick={copyToClipboardProduct} />
                <pre data-prefix=">" className="text-error" ><code>&lt; script </code></pre>
                <pre data-prefix=">" className="text-error"><code className="text-error">id= </code><code className="text-warning">"interface-main-script"</code></pre>
                <pre data-prefix=">" className="text-error"><code>interface_id=</code><code className="text-warning">"664aeb1b522256514270d836"</code></pre>
                <pre data-prefix=">" className="text-error"><code>src=</code><code className="text-warning">"https://interface-embed.viasocket.com/interface-dev.js"</code></pre>
                <pre data-prefix=">" className="text-error"><code>&lt;/script&gt;</code></pre>
            </div>

            <div className="flex items-start flex-col justify-center">
                <h3 className="text-lg font-semibold">Usage</h3>
                <caption className="text-xs text-gray-600 block">Use this methods to send and receive data.</caption>
            </div>
            <div className="mockup-code">
                <Copy className="absolute right-5 top-5 cursor-pointer text-white" size="20px" onClick={copyToClipboardReceiveData} />
                <pre data-prefix=">" >
                    <code>&lt;!-- Use this event listener to listen for the event, sent by iframe --&gt;</code>
                </pre>
                <pre data-prefix=">" >
                    <code>window.addEventListener('message', (event) =&gt; {'{'}</code>
                </pre>
                <pre data-prefix=">" >
                    <code>  const receivedData = event.data;</code>
                </pre>
                <pre data-prefix=">" >
                    <code>{'}'});</code>
                </pre>
                <pre data-prefix=">" >
                    <code>&lt;!-- Use This method to send data when needed --&gt;</code>
                </pre>
                <pre data-prefix=">" >
                    <code>window.SendDataToInterface({'{'}</code>
                </pre>
                <pre data-prefix=">" >
                    <code>  bridgeName: 'Hello World',</code>
                </pre>
                <pre data-prefix=">" >
                    <code>  threadId: projectId,</code>
                </pre>
                <pre data-prefix=">" >
                    <code>  variables: {'{}'}</code>
                </pre>
                <pre data-prefix=">" >
                    <code>{'}'});</code>
                </pre>
            </div>

        </div>
    );
}