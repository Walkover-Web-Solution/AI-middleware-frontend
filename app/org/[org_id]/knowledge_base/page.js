'use client';
import CustomTable from "@/components/customTable/customTable";
import KnowledgeBaseModal from "@/components/modals/knowledgeBaseModal";
import { useCustomSelector } from '@/customHooks/customSelector';
import { SquarePen, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const runtime = 'edge';

const Page = ({params}) => {
  const dispatch = useDispatch();
  const knowbaseData = useCustomSelector((state)=> state?.knowbaseReducer?.knowbaseData)
  const [selectedTale, setSelectedTale] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateClick = useCallback((item) => {
    setSelectedTale(item);
    setIsEditing(true);
  }, []);

  const deleteTale = useCallback(
    (item) => {
      if (window.confirm("Are you sure you want to delete this entry?")) {
        // dispatch delete action here
      }
    },
    [dispatch]
  );

  // Table columns configuration as array of strings
  const columnsToShow = ['name', 'description', 'doc_url', 'chunking_type', 'chunk_size', 'chunk_overlap'];

  const formatCellValue = (value) => {
    return value === undefined ? '-' : value;
  };

  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center">
        <div
          className="tooltip tooltip-primary"
          data-tip="delete"
          onClick={() => deleteTale(row)}
        >
          <Trash2 strokeWidth={2} size={20} />
        </div>
        <div
          className="tooltip tooltip-primary"
          data-tip="Update"
          onClick={() => handleUpdateClick(row)}
        >
          <SquarePen size={20} />
        </div>
      </div>
    );
  };

  const processedData = knowbaseData?.map(item => ({
    ...item,
    chunk_size: formatCellValue(item?.chunk_size),
    chunk_overlap: formatCellValue(item?.chunk_overlap)
  })) || [];

  return (
    <div className="w-full">
      {(knowbaseData?.length > 0 || dummyData?.length > 0) ? (
        <CustomTable
          data={processedData}
          columnsToShow={columnsToShow}
          sorting
          sortingColumns={["name"]}
          keysToWrap={["description", "doc_url"]}
          endComponent={EndComponent}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No knowledge base entries found</p>
        </div>
      )}
      <KnowledgeBaseModal 
        isEditing={isEditing} 
        selectedTale={selectedTale} 
        setSelectedTale={setSelectedTale} 
        setIsEditing={setIsEditing} 
      />
    </div>
  );
};

export default Page;
