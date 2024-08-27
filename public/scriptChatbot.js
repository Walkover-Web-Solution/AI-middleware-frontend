/* eslint-disable */
const urlToViasocket = `http://localhost:3001/i/123`
const styleUrl = 'https://chatbot-embed.viasocket.com/style-local.css';
const loginurl = 'http://localhost:7072/chatbot/loginuser';

let tempDataToSend = null;
let bodyLoaded = false;
const messageType = 'interfaceData'
let props = {};
const AI_WHITE_ICON = makeImageUrl('b1357e23-2fc6-4dc3-855a-7a213b1fa100')
const AI_BLACK_ICON = makeImageUrl('91ee0bff-cfe3-4e2d-64e5-fadbd9a3a200')
let interfaceScript = document.getElementById('chatbot-main-script');
const chatBotIcon = document.createElement('div')
chatBotIcon.id = 'interfaceEmbed'

const imgElement = document.createElement('img');
imgElement.id = 'popup-interfaceEmbed';
imgElement.className = 'chatbot-icon-interfaceEmbed'
imgElement.alt = 'Ask Ai';
imgElement.src = AI_BLACK_ICON
imgElement.style.visibility = 'hidden';
chatBotIcon.appendChild(imgElement);
document.body.appendChild(chatBotIcon);

var link = document.createElement('link');
link.id = 'chatbotEmbed-style'
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = styleUrl;
document.head.appendChild(link);

const closebutton = ` <button id='close-button-interfaceEmbed' onclick="closeChatbot()">
          <svg width="35px" height="35px" viewBox="-3.2 -3.2 38.40 38.40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(4.640000000000001,4.640000000000001), scale(0.71)">
              <rect x="-3.2" y="-3.2" width="38.40" height="38.40" rx="0" fill="#ffffff" strokewidth="0"></rect>
            </g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title>cross-square</title>
              <desc>Created with Sketch Beta.</desc>
              <defs></defs>
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
                <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-206.000000, -1037.000000)" fill="#000000">
                  <path d="M226.95,1056.54 C227.34,1056.93 227.34,1057.56 226.95,1057.95 C226.559,1058.34 225.926,1058.34 225.536,1057.95 L222,1054.41 L218.464,1057.95 C218.074,1058.34 217.441,1058.34 217.05,1057.95 C216.66,1057.56 216.66,1056.93 217.05,1056.54 L220.586,1053 L217.05,1049.46 C216.66,1049.07 216.66,1048.44 217.05,1048.05 C217.441,1047.66 218.074,1047.66 218.464,1048.05 L222,1051.59 L225.536,1048.05 C225.926,1047.66 226.559,1047.66 226.95,1048.05 C227.34,1048.44 227.34,1049.07 226.95,1049.46 L223.414,1053 L226.95,1056.54 L226.95,1056.54 Z M234,1037 L210,1037 C207.791,1037 206,1038.79 206,1041 L206,1065 C206,1067.21 207.791,1069 210,1069 L234,1069 C236.209,1069 238,1067.21 238,1065 L238,1041 C238,1038.79 236.209,1037 234,1037 L234,1037 Z" id="cross-square" sketch:type="MSShapeGroup"></path>
                </g>
              </g>
            </g>
          </svg>
        </button>`;

const updateProps = (newprops = {}) => {
    props = { ...props, ...newprops }
    // console.log(props, 12312312312)
    setPropValues(newprops)
}
const setPropValues = (newprops) => {
    if (newprops.iconColor) {
        document.getElementById("popup-interfaceEmbed").src = newprops.iconColor === 'dark' ? AI_WHITE_ICON : AI_BLACK_ICON
    } if (newprops.fullScreen === true || newprops.fullScreen === 'true') {
        document.getElementById('iframe-parent-container')?.classList.add('full-screen-interfaceEmbed')
    } if (newprops.fullScreen === false || newprops.fullScreen === 'false') {
        document.getElementById('iframe-parent-container')?.classList.remove('full-screen-interfaceEmbed')
    } if ('hideIcon' in newprops && document.getElementById('interfaceEmbed')) {
        document.getElementById('interfaceEmbed').style.display = (newprops.hideIcon === true || newprops.hideIcon === 'true') ? 'none' : 'unset';
    } if ('hideCloseButton' in newprops && document.getElementById('close-button-interfaceEmbed')) {
        document.getElementById('close-button-interfaceEmbed').style.display = (newprops.hideCloseButton === true || newprops.hideCloseButton === 'true') ? 'none' : 'unset';
    }
}
function createProps() {
    if (interfaceScript) {
        // Create an object to store the extracted attributes
        const attributes = ['interfaceId', 'embedToken', 'threadId', 'bridgeName', 'variables', 'onOpen', 'onClose', 'iconColor', 'className', 'style', 'environment', 'fullScreen', 'hideCloseButton', 'hideIcon', 'parentId'];
        attributes.forEach(attr => {
            if (interfaceScript.hasAttribute(attr)) {
                props[attr] = interfaceScript.getAttribute(attr);
            }
        });
        console.log('loop pura chal gya hai')
        // updateProps(props);
    } else {
        console.log("Script tag not found");
    }
}
createProps();

function handleScriptRemoval(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.id === 'chatbot-main-script') {
                    console.log('Script tag added');
                    interfaceScript = document.getElementById('chatbot-main-script');
                    createProps();
                }
            }
            for (const removedNode of mutation.removedNodes) {
                if (removedNode.id === 'chatbot-main-script') {
                    // Perform your cleanup here
                    console.log('Script tag removed, performing cleanup...');
                    const elementToRemove = document.getElementById('iframe-parent-container');
                    const interfaceEmbed = document.getElementById('interfaceEmbed');
                    const styleEmbed = document.getElementById('chatbotEmbed-style');
                    if (interfaceEmbed) {
                        console.log('removing iframe');
                        interfaceEmbed.remove();
                    }
                    if (elementToRemove) {
                        console.log('removing button');
                        elementToRemove.remove();
                    }
                    if (styleEmbed) {
                        console.log('removing style tag');
                        styleEmbed.remove();
                    }
                    // Stop observing after the script tag is removed
                    observer.disconnect();
                }
            }
        }
    }
}

const observer = new MutationObserver(handleScriptRemoval);
observer.observe(document.head, { childList: true });

// if (interfaceScript) {
//     // Create an object to store the extracted attributes
//     const attributes = ['interfaceId', 'embedToken', 'threadId', 'bridgeName', 'variables', 'onOpen', 'onClose', 'iconColor', 'className', 'style', 'environment', 'fullScreen'];
//     attributes.forEach(attr => {
//         if (interfaceScript.hasAttribute(attr)) {
//             props[attr] = interfaceScript.getAttribute(attr);
//         }
//     });
//     // console.log(props)
// } else {
//     console.log("Script tag not found");
// }

function makeImageUrl(imageId) {
    return `https://imagedelivery.net/Vv7GgOGQbSyClWJqhyP0VQ/${imageId}/public`
}

closeChatbot = function () {
    if (document.getElementById('iframe-parent-container')?.style?.display === 'block') {
        document.getElementById('iframe-parent-container').style.display = 'none'
        document.body.style.overflow = 'auto'
        if (document.getElementById('interfaceEmbed')) { document.getElementById('interfaceEmbed').style.display = props?.hideIcon ? 'none' : 'unset'; }
        window.parent?.postMessage({ type: 'close', data: {} }, '*');
        iframeComponent.contentWindow?.postMessage({ type: 'close', data: {} }, '*');
        return
    }
}

// Set a timeout to automatically remove the event listener after 60 seconds
const timeoutId = setTimeout(() => {
    window.removeEventListener('message', SendTempDataToChatbot);
    console.log("Event listener removed after 60 seconds");
}, 60000);

function SendTempDataToChatbot(event) {
    const { type } = event.data;
    if (type === 'interfaceLoaded') {
        if (tempDataToSend) {
            console.log('data sent')
            document.getElementById('iframe-component-interfaceEmbed').contentWindow.postMessage({ type: messageType, data: tempDataToSend }, '*')
            tempDataToSend = null;
        }
        window.removeEventListener('message', SendTempDataToChatbot);
        clearTimeout(timeoutId);
        console.log("interfaceLoaded and event listener removed");
    }
}

let parentContainer = null;

let config = {
    "type": "popup",
    "height": "100",
    "heightUnit": "%",
    "width": "100",
    "widthUnit": "%",
    "buttonName": ""
}
let title = 'Via socket'
let buttonName = 'Chatbot'
let className = 'popup'

loadChatbotEmbed = async function () {
    function handleChatbotConfigMessage(event) {
        const { type, data } = event.data;
        if (type === 'chatbotConfig') {
            config = data;
            updateConfig(config);
        }
    }
    window.addEventListener('message', handleChatbotConfigMessage, false);
    document.getElementById('iframe-component-interfaceEmbed').src = urlToViasocket
}

updateConfig = function (config={}) {
    const interfaceEmbedElement = document.getElementById('interfaceEmbed');
    if (config) {
        if (config.title) {
            title = config.title
        }
        if (config.buttonName) {
            buttonName = config.buttonName;
            interfaceEmbedElement.innerText = buttonName;

            // Add a class to show the background color when the button text is shown
            interfaceEmbedElement.classList.add('show-bg-color');
            // interfaceEmbedElement.style.backgroundColor = config.themeColor || '#000000'; // Default to original color if themeColor is not set
        } else {
            imgElement.style.visibility = 'visible';
            interfaceEmbedElement?.classList.remove('show-bg-color');
            // Reset the background color
            // interfaceEmbedElement.style.backgroundColor = 'transparent'; // or any default background color you want when icon is visible
        }

        if (config.type) {
            document.getElementById('iframe-parent-container')?.classList.remove(`${className}-parent-container`)
            interfaceEmbedElement?.classList.remove(`${className}-interfaceEmbed`)
            className = config.type
        }
    }
    document.getElementById('iframe-parent-container')?.classList.add(`${className}-parent-container`)
    interfaceEmbedElement?.classList.add(`${className}-interfaceEmbed`)

    if (className === 'all_available_space') {
        document.getElementById('iframe-parent-container').style.height = '100%'
        document.getElementById('iframe-parent-container').style.width = '100%'
    } else {
        document.getElementById('iframe-parent-container').style.height = `${config?.height}${config?.heightUnit || ''}` || '70vh'
        document.getElementById('iframe-parent-container').style.width = `${config?.width}${config?.widthUnit || ''}` || '40vw'
    }
}

const loadContent = function (parentId = props.parentId || '', bodyLoadedHai = bodyLoaded) {
    console.log(bodyLoadedHai, '=-=-=-=', parentId, 'new value');
    if (bodyLoadedHai) return;
    window.addEventListener('message', SendTempDataToChatbot);
    if (!parentContainer) {
        parentContainer = document.createElement('div');
        parentContainer.id = 'iframe-parent-container';
        parentContainer.className = 'popup-parent-container';
        parentContainer.style.display = 'none';
        parentContainer.innerHTML = `
       ${closebutton}
       <iframe id="iframe-component-interfaceEmbed" title="iframe" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
      `;
    }

    if (parentId) {
        console.log(1);
        const container = document.getElementById(parentId);
        if (container) {
            container.style.position = 'relative';
            container.appendChild(parentContainer);
        }
    } else if (document.getElementById('interface-chatbot')) {
        console.log(2);
        document.getElementById('interface-chatbot').appendChild(parentContainer);
    } else {
        console.log(3);
        document.body.appendChild(parentContainer);
    }

    bodyLoaded = true;
    updateProps({ ...props });
    // if (document.getElementById('interfaceEmbed')) document.getElementById('interfaceEmbed').style.display = 'unset';
    loadChatbotEmbed();
};

document.addEventListener("DOMContentLoaded", loadContent);
if (document?.body) loadContent()

const iframeComponent = document.getElementById('iframe-component-interfaceEmbed');
if (iframeComponent) {
    iframeComponent.onload = function () {
        console.log('ifram onload and remove event listener', tempDataToSend, 'tempDataToSend');
        iframeComponent.contentWindow?.postMessage({ type: messageType, data: tempDataToSend }, '*')
    }
}

SendDataToChatbot = function (dataToSend) {
    if ('parentId' in dataToSend) {
        console.log(props['parentId'], 'previous value');
        const previousParentId = props['parentId'];
        if (previousParentId !== dataToSend.parentId) {
            if (previousParentId) {
                const existingParent = document.getElementById(previousParentId);
                if (existingParent && parentContainer && existingParent.contains(parentContainer)) {
                    existingParent.removeChild(parentContainer);
                }
            } else if (parentContainer && document.body.contains(parentContainer)) {
                document.body.removeChild(parentContainer);
            }
            updateProps({ parentId: dataToSend.parentId });
            loadContent(dataToSend.parentId, false);
        }
    }
    if ('hideCloseButton' in dataToSend) {
        updateProps({ hideCloseButton: dataToSend.hideCloseButton || false })
    }
    if ('hideIcon' in dataToSend) {
        updateProps({ hideIcon: dataToSend.hideIcon || false })
    }
    if (dataToSend.iconColor) {
        updateProps({ iconColor: dataToSend.iconColor || 'dark' })
    }
    if (dataToSend.fullScreen === true || dataToSend.fullScreen === 'true') {
        updateProps({ fullScreen: dataToSend.fullScreen });
    }
    if (dataToSend.fullScreen === false || dataToSend.fullScreen === 'false') {
        updateProps({ fullScreen: dataToSend.fullScreen });
    }
    if (dataToSend && iframeComponent) {
        tempDataToSend = dataToSend;
        iframeComponent.contentWindow?.postMessage({ type: messageType, data: dataToSend }, '*')
    }
    if (dataToSend.askAi) {
        iframeComponent.contentWindow?.postMessage({ type: "askAi", data: dataToSend || {} }, '*')
    }
}

openChatbot = function () {
    window.parent?.postMessage({ type: 'open', data: {} }, '*')
    iframeComponent.contentWindow?.postMessage({ type: 'open', data: {} }, '*')
    if (document.getElementById('interfaceEmbed') && document.getElementById('iframe-parent-container')) {
        document.getElementById('interfaceEmbed').style.display = 'none'
        document.getElementById('iframe-parent-container').style.display = 'block'
        // document.getElementById('title').innerText = title || 'Viasocket'
        document.body.style.overflow = 'hidden'
    }
}
// loadChatbotEmbed()
reloadChats = function () {
    iframeComponent.contentWindow?.postMessage({ type: 'refresh', reload: true }, '*')
}

askAi = function (data) {
    iframeComponent.contentWindow?.postMessage({ type: 'askAi', data: data || "" }, '*')
}

document.getElementById('interfaceEmbed')?.addEventListener('click', () => {
    window.openChatbot()
})