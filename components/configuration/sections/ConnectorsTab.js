"use client";

import React from "react";
import ToolsSection from "../ToolsSection";

const ConnectorsTab = ({isPublished}) => {
  return (
    <div className="w-full">
      <ToolsSection isPublished={isPublished} />
    </div>
  );
};

export default ConnectorsTab;
