'use client';
import CustomTable from "@/components/customTable/customTable";
import KnowledgeBaseModal from "@/components/modals/knowledgeBaseModal";
import { useCustomSelector } from '@/customHooks/customSelector';
import { KNOWLEDGE_BASE_COLUMNS } from "@/utils/enums";
import React from 'react';

export const runtime = 'edge';

const Page = ({ params }) => {
  const knowledgeBaseData = useCustomSelector((state) => state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id])

  const formatCellValue = (value) => {
    return value === undefined || null ? '-' : value;
  };

  const processedData = Array.isArray(knowledgeBaseData)
    ? knowledgeBaseData.map(item => ({
      ...item,
      chunking_type: formatCellValue(item?.chunking_type),
      chunk_size: formatCellValue(item?.chunk_size),
      chunk_overlap: formatCellValue(item?.chunk_overlap)
    }))
    : [];

  return (
    <div className="w-full">
      {(knowledgeBaseData?.length > 0) ? (
        <CustomTable
          data={processedData}
          columnsToShow={KNOWLEDGE_BASE_COLUMNS}
          sorting
          sortingColumns={["name"]}
          keysToWrap={["description", "doc_url"]}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No knowledge base entries found</p>
        </div>
      )}
      <KnowledgeBaseModal
        params={params}
      />
    </div>
  );
};

export default Page;
