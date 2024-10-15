import AnthropicIcon from "@/icons/AnthropicIcon";
import GeminiIcon from "@/icons/GeminiIcon";
import GroqIcon from "@/icons/GroqIcon";
import OpenAiIcon from "@/icons/OpenAiIcon";
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

export const toggleSidebar = (sidebarId) => {
    const sidebar = document.getElementById(sidebarId);
    const handleClickOutside = (event) => {
        const sidebar = document.getElementById(sidebarId);
        const button = event.target.closest('button');

        if (sidebar && !sidebar.contains(event.target) && !button) {
            sidebar.classList.add('-translate-x-full');
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscPress);
        }
    };

    const handleEscPress = (event) => {
        if (event.key === 'Escape') {
            sidebar.classList.add('-translate-x-full');
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscPress);
        }
    };

    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');

        if (!sidebar.classList.contains('-translate-x-full')) {
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
        default:
            return <OpenAiIcon height={height} width={width} />;
    }
}

export function getStatusClass (status) {
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
            items:value?.items
        });
<<<<<<< Updated upstream
        if (Object.keys(value.parameter || {}).length > 0) {
            flat = flat.concat(flattenParameters(value.parameter, currentKey));
=======
        if (Object?.keys(value?.parameter || value?.items || {})?.length > 0) {
            flat = flat?.concat(flattenParameters(value?.parameter || value?.items?.properties || {}, currentKey));
>>>>>>> Stashed changes
        }
    });
    return flat;
}
