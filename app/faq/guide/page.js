"use client";
import { DOCUMENT_SECTIONS } from "@/utils/enums";
import React, { useEffect, useRef, useState } from "react";
import Tooltip from "./tooltip";

const ModelDocs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const searchInputRef = useRef(null);
  const sections = DOCUMENT_SECTIONS;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter sections based on search query
  const filteredSections = searchQuery
    ? sections.filter(
      (section) =>
        section?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : sections;

  const handleSectionClick = (id) => {
    setActiveSection(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Search Header */}
      <div className="bg-base-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search documentation..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm bg-base-100 px-2">
              ⌘K / Ctrl+K
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents */}
        <div className="lg:col-span-1 bg-base-100 rounded-xl shadow-sm p-6 sticky top-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            {filteredSections.map((section) => (
              <div key={section.id} className="group">
                <Tooltip text={section?.description}>
                  <a
                    href={`#${section.id}`}
                    className={`flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors ${activeSection === section.id ? 'font-medium text-blue-600' : ''
                      }`}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-600 transition-colors"></span>
                    <span>{section.title}</span>
                  </a>
                </Tooltip>
              </div>
            ))}
          </nav>
        </div>

        {/* Documentation Content */}
        <div className="lg:col-span-3 bg-base-100 rounded-xl shadow-sm p-8">
          {filteredSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={`mb-12 scroll-mt-20 ${activeSection === section.id ? 'bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600' : ''
                }`}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{section.title}</h3>
              <p className="text-gray-600 leading-relaxed">{section.description}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelDocs;