import { BuildingIcon, CheckCircleIcon } from "@/components/Icons";
import AnthropicIcon from "@/icons/AnthropicIcon";
import CsvIcon from "@/icons/CsvIcon";
import GeminiIcon from "@/icons/GeminiIcon";
import GoogleDocIcon from "@/icons/GoogleDocIcon";
import GroqIcon from "@/icons/GroqIcon";
import OpenAiIcon from "@/icons/OpenAiIcon";
import OpenRouter from "@/icons/OpenRouter";
import { PdfIcon } from "@/icons/pdfIcon";
import { WebSearchIcon } from "@/icons/webSearchIcon";
import { cloneDeep } from "lodash";

export const updatedData = (obj1, obj2 = {}, type) => {
    // Deep clone obj1 to avoid mutating the original object

    const updatedObj1 = JSON.parse(JSON.stringify(obj1));

    // Iterate over the keys of obj2.configuration
    for (const key in obj2?.configuration) {
        if (obj2.configuration.hasOwnProperty(key)) {
            // Delete the key from updatedObj1.configuration
            delete updatedObj1.configuration[key];
        }

    }
    if (type === 'chat') {
        const inputconfig = updateContent(obj2.inputConfig, updatedObj1.configuration)
        obj1.inputConfig = inputconfig;
    }
    if (type === 'completion') {

        obj1.inputConfig = {
            prompt: {
                "prompt": updatedObj1.configuration.prompt || "",
                "contentKey": "prompt",
                "type": "text",
            }
        }
    }
    if (type === 'embedding') {
        obj1.inputConfig = {
            input: {
                "input": updatedObj1.configuration.input || "",
                "contentKey": "input",
                "type": "text"
            }
        }

    }

    const newObj1 = removeDuplicateFields(obj1.configuration, updatedObj1.configuration);
    obj1.configuration = newObj1;

    return obj1;
};



const updateContent = (obj2, updatedObj1) => {
    try {
        // Deep clone obj2
        const obj3 = cloneDeep(obj2);

        // If prompt is not defined in updatedObj1, return obj2
        if (updatedObj1.prompt === undefined) return obj2;

        // Iterate through each item in updatedObj1.prompt
        updatedObj1.prompt.forEach(item => {
            const { role, content } = item;

            // Check if obj3[role].default exists and update its content
            if (obj3[role]?.default) {
                obj3[role].default.content += `${content}`;
            }
        });

        return obj3;
    } catch (error) {
        console.error(error);
        return obj2; // Return original object in case of error
    }
};




function removeDuplicateFields(obj1, updatedObj1) {
    const updatedObj1Keys = Object.keys(updatedObj1);

    updatedObj1Keys.forEach(key => {
        if (obj1.hasOwnProperty(key)) {
            delete obj1[key];
        }
    });

    return obj1;
}



export const handleResponseFormat = (obj1) => {
    let responseObj = {}
    if (obj1.configuration.RTLayer === true) {
        responseObj = {
            RTLayer: obj1.configuration.RTLayer
        }
        return responseObj;
    }
    if (obj1.configuration.webhook || obj1.configuration.headers) {
        responseObj = {
            webhook: obj1.configuration.webhook,
            headers: obj1.configuration.headers
        }
        return responseObj;
    }
    return responseObj;

}


export const isValidJson = (jsonString) => {
    try {
        JSON.parse(jsonString);
        return true; // Return true if JSON parses without error
    } catch (e) {
        return false; // Return false if an error is thrown
    }
};

export const toggleSidebar = (sidebarId, direction = "left") => {
    const sidebar = document.getElementById(sidebarId);
    const handleClickOutside = (event) => {
        const sidebar = document.getElementById(sidebarId);
        const button = event.target.closest('button');

        if (sidebar && !sidebar.contains(event.target) && !button) {
            if (direction === "left") {
                sidebar.classList.add('-translate-x-full');
            } else {
                sidebar.classList.add('translate-x-full');
            }
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscPress);
        }
    };

    const handleEscPress = (event) => {
        if (event.key === 'Escape') {
            if (direction === "left") {
                sidebar.classList.add('-translate-x-full');
            } else {
                sidebar.classList.add('translate-x-full');
            }
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscPress);
        }
    };

    if (sidebar) {
        if (direction === "left") {
            sidebar.classList.toggle('-translate-x-full');
        } else {
            sidebar.classList.toggle('translate-x-full');
        }

        if (!sidebar.classList.contains(direction === "left" ? '-translate-x-full' : 'translate-x-full')) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscPress);
        } else {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscPress);
        }
    }
};


export const getIconOfService = (service, height, width) => {
    switch (service) {
        case 'openai':
            return <OpenAiIcon height={height} width={width} />;
        case 'anthropic':
            return <AnthropicIcon height={height} width={width} />;
        case 'groq':
            return <GroqIcon height={height} width={width} />;
        case 'google':
            return <GeminiIcon height={height} width={width} />;
        case 'open_router':
            return <OpenRouter height={height} width={width} />;
        default:
            return <OpenAiIcon height={height} width={width} />;
    }
}

export function getStatusClass(status) {
    switch (status?.toString().trim().toLowerCase()) {
        case 'drafted':
            return 'bg-yellow-100';
        case 'paused':
            return 'bg-red-100';
        case 'active':
        case 'published':
            return 'bg-green-100';
        case 'rejected':
            return 'bg-gray-100';
        // Add more cases as needed
        default:
            return 'bg-gray-100';
    }
};

export const validateUrl = (url) => {
    const pattern = new RegExp('^https?:\\/\\/' + // Protocol is mandatory
        '(localhost|' + // Allows "localhost" as a valid domain
        '((\\d{1,3}\\.){3}\\d{1,3})|' + // Allows IPv4 addresses
        '(([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+' + // Subdomains
        '[a-zA-Z]{2,})' + // TLD is mandatory except for localhost or IP
        '(\\:\\d{1,5})?' + // Optional port (restricting port number between 1 and 65535)
        '(\\/[\\w\\d%_.~+\\-]*)*' + // Optional path corrected to allow a more accurate set of characters
        '(\\?[;&a-zA-Z\\d%_.~+=\\-]*)?' + // Optional query (more accurate character set)
        '(\\#[\\w\\d\\-]*)?$', 'i'); // Optional fragment
    return pattern.test(url);
};

export function flattenParameters(parameters, prefix = '') {
    let flat = [];
    Object.entries(parameters || {}).forEach(([key, value]) => {
        const currentKey = prefix ? `${prefix}.${key}` : key;
        flat.push({
            key: currentKey,
            type: value?.type,
            description: value?.description,
            enum: value.enum,
            required_params: value?.required_params,
            parameter: value?.parameter,
            items: value?.items
        });
        if (Object?.keys(value?.parameter || value?.items || {})?.length > 0) {
            flat = flat?.concat(flattenParameters(value?.parameter || value?.items?.properties || {}, currentKey));
        }
    });
    return flat;
}


export function filterBridges(bridgesList, bridgeSearchQuery) {
    return bridgesList.filter(
        (item) =>
            item?.name?.toLowerCase()?.includes(bridgeSearchQuery.toLowerCase()) ||
            item?.slugName?.toLowerCase()?.includes(bridgeSearchQuery.toLowerCase()) ||
            item?.service?.toLowerCase()?.includes(bridgeSearchQuery.toLowerCase()) ||
            item?._id?.toLowerCase()?.includes(bridgeSearchQuery.toLowerCase())
    );
}

export function filterOrganizations(orgList, orgSearchQuery) {
    return Object.values(orgList).filter(
        (item) =>
            item?.name?.toLowerCase()?.includes(orgSearchQuery?.toLowerCase()) ||
            item?.id?.toString()?.toLowerCase()?.includes(orgSearchQuery?.toLowerCase())
    );
}


export function openModal(modalName) {
    const modalElement = document.getElementById(modalName);
    if (modalElement) {
        modalElement.showModal();
    } else {
        console.error(`Modal with name ${modalName} not found`);
    }
}

export function closeModal(modalName) {
    const modalElement = document.getElementById(modalName);
    if (modalElement) {
        modalElement.close();
    } else {
        console.error(`Modal with name ${modalName} not found`);
    }
}

export const allowedAttributes = {
    important: [
        ['variables', 'Variables'],
        ['system Prompt', 'System Prompt'],
        ['AiConfig', 'AI Configuration'],
        ['latency', 'Latency'],
    ],
    optional: [
        ['message_id', 'Message ID'],
        ['input_tokens', 'Input Tokens'],
        ['output_tokens', 'Output Tokens'],
        ['expected_cost', 'Expected Cost'],
        ['createdAt', 'Created At'],
        ['service', 'Service'],
        ['model', 'Model'],
        ['version_id', 'Version ID'],
    ]
};

export const GetFileTypeIcon = (fileType, height, width) => {
    switch (fileType) {
        case 'pdf':
            return <PdfIcon height={height} width={width} />;
        case 'csv':
            return <CsvIcon height={height} width={width} />;
        default:
            return <GoogleDocIcon height={height} width={width} />;
    }
}
export const GetPreBuiltToolTypeIcon = (preBuiltTools, height, width) => {
    switch (preBuiltTools) {
        case 'web_search':
            return <WebSearchIcon height={height} width={width} />;
        default:
            return null;
    }
}

export const updateTitle = (newTitle) => {
    if (typeof document !== 'undefined' && newTitle) {
        document.title = newTitle;
        document.title = newTitle;
    }
  };

 export const simulateStreaming = (text, setStreamed, setIsStreaming, callback) => {
    setIsStreaming(true);
    setStreamed("");
    
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < text?.length) {
        // Process multiple characters at once
        const chunk = text?.slice(currentIndex, currentIndex + 5); // Process 5 chars at a time
        setStreamed(prev => prev + chunk);
        currentIndex += 5;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        // Set final text to ensure we didn't miss any characters
        setStreamed(text);
        callback();
      }
    }, 5); // Reduced interval to 5ms
  };
  

  export const createDiff = (oldText, newText) => {
    const oldLines = oldText?.split('\n');
    const newLines = newText?.split('\n');
    const maxLines = Math.max(oldLines?.length, newLines?.length);
    
    const diffLines = [];
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine === newLine) {
        diffLines?.push({
          type: 'equal',
          oldLine,
          newLine,
          lineNumber: i + 1
        });
      } else if (!oldLine) {
        diffLines?.push({
          type: 'added',
          oldLine: '',
          newLine,
          lineNumber: i + 1
        });
      } else if (!newLine) {
        diffLines?.push({
          type: 'deleted',
          oldLine,
          newLine: '',
          lineNumber: i + 1
        });
      } else {
        diffLines?.push({
          type: 'modified',
          oldLine,
          newLine,
          lineNumber: i + 1
        });
      }
    }
    
    return diffLines;
  };

  export const transformAgentVariableToToolCallFormat = (inputData) => {
    const fields = {};
    const required_params = [];

    function setNestedValue(obj, path, value, isRequired) {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            if (!current[part]) {
                current[part] = {
                    type: "object",
                    description: "",
                    enum: [],
                    required_params: [],
                    parameter: {}
                };
            } else if (!current[part].parameter) {
                current[part].parameter = {};
            }

            current = current[part].parameter;
        }

        const finalKey = parts[parts.length - 1];

        let paramType = "string";
        if (finalKey.toLowerCase().includes('number') || finalKey.toLowerCase().includes('num')) {
            paramType = "number";
        } else if (finalKey.toLowerCase().includes('bool') || finalKey.toLowerCase().includes('flag')) {
            paramType = "boolean";
        }

        current[finalKey] = {
            type: paramType,
            description: "",
            enum: [],
            required_params: []
        };

        if (isRequired) {
            for (let i = 0; i < parts.length - 1; i++) {
                let currentLevel = obj;
                for (let j = 0; j < i; j++) {
                    currentLevel = currentLevel[parts[j]].parameter;
                }

                const parentKey = parts[i];
                const childKey = parts[i + 1];

                if (!currentLevel[parentKey].required_params.includes(childKey)) {
                    currentLevel[parentKey].required_params.push(childKey);
                }
            }

            // Add top-level key to required_params
            if (!required_params.includes(parts[0])) {
                required_params.push(parts[0]);
            }
        }
    }

    for (const [key, value] of Object.entries(inputData)) {
        const isRequired = value === "required";

        if (key.includes('.')) {
            setNestedValue(fields, key, value, isRequired);
        } else {
            let paramType = "string";
            if (key.toLowerCase().includes('number') || key.toLowerCase().includes('num')) {
                paramType = "number";
            } else if (key.toLowerCase().includes('bool') || key.toLowerCase().includes('flag')) {
                paramType = "boolean";
            }

            fields[key] = {
                type: paramType,
                description: "",
                enum: [],
                required_params: []
            };

            if (isRequired && !required_params.includes(key)) {
                required_params.push(key);
            }
        }
    }

    return { fields, required_params };
};

export function toBoolean(str) {
    return str === "true" || str === true;
  }


export const renderedOrganizations = (organizations, formState, handleSelectOrg) => {
    const filteredOrgs = filterOrganizations(organizations, formState.searchQuery);
    
    return filteredOrgs?.map((org, index) => (
        <div
            key={org.id || index}
            onClick={() => handleSelectOrg(org.id, org.name)}
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                formState.selectedOrg?.id === org.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent hover:border-base-300'
            }`}
        >
            <div className="card-body p-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                        formState.selectedOrg?.id === org.id 
                            ? 'bg-primary text-primary-content' 
                            : 'bg-base-200'
                    }`}>
                        <BuildingIcon size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-base-content">{org.name}</h3>
                        <p className="text-sm text-base-content/70">ID: {org.id}</p>
                    </div>
                    {formState.selectedOrg?.id === org.id && (
                        <CheckCircleIcon className="text-primary" size={20} />
                    )}
                </div>
            </div>
        </div>
    ));
};

export  function generateRandomID(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

export const RequiredItem = () => <span className="text-error text-lg">*</span>;


export const sendDataToParent = (status, data, message) => {
  if (window.parent) {
    window.parent.postMessage({
      type: "gtwy",
      status: status,
      data: data,
      message: message
    }, '*');
  }
};

  