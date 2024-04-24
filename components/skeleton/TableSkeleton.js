import React from 'react';

const TableSkeleton = () => {
    return (
       
<div role="status" class="w-full p-4 space-y-4 animate-pulse shadow-md md:p-6">
    <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div class="flex-grow">
            <div class="h-10 bg-gray-300 rounded-full dark:bg-gray-400 mb-2.5 w-full md:w-3/4"></div>
        </div>
        <div class="w-full md:w-1/6 h-10 bg-gray-300 rounded-full dark:bg-gray-500"></div>
        <div class="w-full md:w-1/6 h-10 bg-gray-300 rounded-full dark:bg-gray-500"></div>
    </div>
    {[...Array(10)].map((_, index) => (
        <div key={index} class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div class="flex-grow">
                <div class="h-4 bg-gray-300 rounded-full dark:bg-gray-400 mb-2.5 w-full md:w-3/4"></div>
            </div>
            <div class="w-full md:w-1/6 h-4 bg-gray-300 rounded-full dark:bg-gray-500"></div>
            <div class="w-full md:w-1/6 h-4 bg-gray-300 rounded-full dark:bg-gray-500"></div>
        </div>
    ))}
    <span class="sr-only">Loading...</span>
</div>




    );
};

export default TableSkeleton;

