import { cloneDeep } from "lodash";

export const updatedData = (obj1, obj2, type) => {
    // Deep clone obj1 to avoid mutating the original object

    const updatedObj1 = JSON.parse(JSON.stringify(obj1));

    // Iterate over the keys of obj2.configuration
    for (const key in obj2.configuration) {
        if (obj2.configuration.hasOwnProperty(key)) {
            // Delete the key from updatedObj1.configuration
            delete updatedObj1.configuration[key];
        }

    }
    // if (Object.keys(updatedObj1.configuration).length > 0) {
    if (type === 'chat') {
        const inputconfig = updateContent(obj2.inputConfig, updatedObj1.configuration)
        obj1.inputConfig = inputconfig;
    }
    if (type === 'completion') {
        // const inputconfig = updateContent(obj2.inputConfig, updatedObj1.configuration)

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

    // }


    const newObj1 = removeDuplicateFields(obj1.configuration, updatedObj1.configuration);
    obj1.configuration = newObj1;

    return obj1;
};


// function updateContent(obj2, updatedObj1) {
//     try {
//         if (updatedObj1.prompt === undefined) return obj2
//         updatedObj1.prompt.forEach(item => {
//             const role = item.role;
//             const content = item.content;
//             if (obj2[role] && obj2[role].default)
//                 obj2[role].default.content += " " + content;
//         });
//         return obj2
//     } catch (error) {
//         console.error(error)
//     }
// }

// function updateContent(obj2, updatedObj1) {
//     try {
//         if (updatedObj1.prompt === undefined) return obj2;

//         updatedObj1.prompt.forEach(item => {
//             const role = item.role;
//             const content = item.content;

//             // Check if obj2[role].default exists and create a mutable copy
//             if (obj2[role] && obj2[role].default) {
//                 const mutableDefault = { ...obj2[role].default };
//                 mutableDefault.content += " " + content;
//                 obj2[role].default = mutableDefault; // Update obj2[role].default
//             }
//         });

//         return obj2;
//     } catch (error) {
//         console.log(error)
//         console.error(error);
//     }
// }


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
                obj3[role].default.content += ` ${content}`;
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

