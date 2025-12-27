"use client";

import React from "react";
import GptMemory from "../configurationComponent/gptmemory";
import { useConfigurationContext } from "../ConfigurationContext";

const MemoryTab = () => {
  const { params, searchParams } = useConfigurationContext();

  return (
    <div className="w-full max-w-2xl">
      <GptMemory params={params} searchParams={searchParams} />
    </div>
  );
};

export default MemoryTab;
