// ConfigSkeleton.jsx
import React from 'react';

const ConfigSkeleton = () => {
    return (
        <div className="animate-pulse p-4 space-y-4 w-full mx-auto">
        {/* Container for the three columns */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* First Column: Slim - for smaller dropdowns/inputs */}
            <div className="flex-1 md:flex-initial md:w-1/6 space-y-6">
                <div className="h-10 bg-gray-300 rounded-md"></div>  {/* Dropdown/Input placeholder */}
                <div className="h-10 bg-gray-300 rounded-md"></div>  {/* Dropdown/Input placeholder */}
                <div className="h-10 bg-gray-300 rounded-md"></div>
                <div className="h-10 bg-gray-300 rounded-md"></div>
                <div className="h-10 bg-gray-300 rounded-md"></div>
            </div>
            
            {/* Second Column: Slim - for additional controls or information */}
            <div className="flex-1 md:flex-initial md:w-1/6 space-y-6">
                <div className="h-10 bg-gray-300 rounded-md"></div>  {/* Control placeholder */}
                <div className="h-10 bg-gray-300 rounded-md"></div>  {/* Info placeholder */}
            </div>

            <div className="flex flex-col h-full w-full  mx-auto">
    {/* Chat area skeleton */}
    <div className="flex-1 bg-gray-100 p-4 rounded-t-lg shadow overflow-hidden">
        <div className="flex items-start space-x-4 p-2">
            {/* <div className="h-12 w-12 bg-gray-300 rounded-full"></div>  Avatar placeholder */}
            <div className="flex-1 space-y-2">
                <div className="bg-gray-300 h-6 rounded w-2/4"></div>  {/* Primary message text placeholder */}
                {/* <div className="bg-gray-300 h-6 rounded w-5/6"></div>   */}
            </div>
        </div>
        <div className="h-48 bg-white"></div>  {/* Simulated additional chat content area */}
    </div>
    {/* Message input area skeleton */}
    <div className="bg-gray-200 p-4 rounded-b-lg shadow">
        <div className="bg-gray-300 h-10 rounded-md w-full"></div>  {/* Input field placeholder */}
    </div>
</div>

    
        </div>
    </div>
    
    );
};

export default ConfigSkeleton;
