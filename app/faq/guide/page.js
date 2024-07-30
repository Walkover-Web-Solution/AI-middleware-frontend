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
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : sections;

  const handleSectionClick = (id) => {
    setActiveSection(id);
  };

  return (
    <div className="bg-gray-300 min-h-[100vh] overflow-hidden flex gap-0 flex-col">
      <nav className="bg-black w-full p-[20px] flex items-center justify-between px-[4rem]">
        <h1 className="text-white">AI Middleware</h1>
        <input
          type="text"
          ref={searchInputRef}
          placeholder="Search here ..."
          className="w-[50%] p-2 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="absolute right-[80px] top-8 text-gray-400 text-sm z-9999999">Cmd/Ctrl + K</span>
      </nav>
      <div className="bg-white rounded-xl shadow-lg space-y-6 p-[30px]">
        <div className="space-y-2 mb-8">
          <h1 className="text-xl font-extrabold">Table of Contents</h1>
          <ul className="list-disc list-inside">
            {filteredSections.map((section) => (
              <li key={section.id} className="flex gap-[5px] flex-row">
                <Tooltip text={section.description}>
                  <a
                    href={`#${section.id}`}
                    className={`text-blue-500 hover:underline ${activeSection === section.id ? 'font-bold' : ''}`}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <span>&#x2022;</span> {section.title}
                  </a>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>
        {
          (filteredSections || [])?.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className={`mt-[20px] ${activeSection === section.id ? 'bg-blue-100 p-4 rounded-md' : ''}`}
            >
              <h3 className=" text-black font-semibold">{section.title}</h3>
              <p className="text-md text-gray-700">{section.description}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default ModelDocs;