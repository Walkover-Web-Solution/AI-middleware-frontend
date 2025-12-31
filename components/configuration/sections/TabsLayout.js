"use client";

import React from "react";

const TabsLayout = ({ tabs, activeTab, onTabChange, hideTabs = false }) => {
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="flex flex-col w-full">
      {!hideTabs && (
        <div className="border-b border-base-200 bg-base-100 sticky top-0 z-10 -ml-8 -mx-4">
          <div
            className="w-full items-center flex h-10 bg-transparent gap-1 border-0 px-4 overflow-x-auto scrollbar-hide"
            role="tablist"
            aria-orientation="horizontal"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={`inline-flex items-center justify-center border border-transparent whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-lg px-2 py-1  text-xs transition-all duration-200 flex-shrink-0 min-w-fit ${
                    isActive
                      ? " text-blue-600 border-base-300/30"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={12}
                      className="w-3 h-3 mr-2"
                      aria-hidden="true"
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div role="tabpanel" className="pb-6">
        {activeContent}
      </div>
    </div>
  );
};

export default TabsLayout;
