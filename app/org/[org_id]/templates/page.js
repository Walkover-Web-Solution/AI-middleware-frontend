'use client';
import MainLayout from "@/components/layoutComponents/MainLayout";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { MODAL_TYPE } from "@/utils/enums";
import { openModal, formatRelativeTime } from "@/utils/utility";
import { SquarePenIcon, TrashIcon, PlayIcon } from "@/components/Icons";
import React, { useEffect, useState, use } from 'react';
import { useDispatch } from "react-redux";
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";
import useDeleteOperation from "@/customHooks/useDeleteOperation";
import TemplateModal from "@/components/modals/TemplateModal";
import TemplatePlayground from "@/components/modals/TemplatePlayground";

export const runtime = 'edge';


const TemplatesPage = ({ params }) => {
  const resolvedParams = use(params);
  const _dispatch = useDispatch();
  
  const { templatesData } = useCustomSelector((state) => ({
    templatesData: state?.richUiTemplateReducer?.templates || [],
  }));
  
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [filterTemplates, setFilterTemplates] = useState(templatesData);
  const [selectedDataToDelete, setSelectedDataToDelete] = useState(null);
  const [playgroundTemplate, setPlaygroundTemplate] = useState(null);
  const { isDeleting, executeDelete } = useDeleteOperation();

  useEffect(() => {
    setFilterTemplates(templatesData);
  }, [templatesData]);


  const handleUpdateTemplate = (item) => {
    const originalItem = templatesData.find(template => template._id === item._id);
    setSelectedTemplate(originalItem);
    openModal(MODAL_TYPE?.TEMPLATE_MODAL);
  };

  const handleDeleteTemplate = async (item) => {
    await executeDelete(async () => {
      // Add delete template action here
      console.log('Delete template:', item?._id);
      return Promise.resolve();
    });
  };

  const handleOpenPlayground = (item) => {
    const originalItem = templatesData.find(template => template._id === item._id);
    setPlaygroundTemplate(originalItem);
    openModal(MODAL_TYPE?.TEMPLATE_PLAYGROUND);
  };


  return (
    <div className="w-full">
      <div className="px-2 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full gap-2">
            <PageHeader
              title="Templates"
              description="Create and manage reusable UI templates for your agents. Templates define structured response formats that can be used across multiple agents."
            />
          </div>
        </MainLayout>
        
        <div className="flex flex-row gap-4">
          {templatesData?.length > 5 && (
            <SearchItems 
              data={templatesData} 
              setFilterItems={setFilterTemplates} 
              item="Template" 
            />
          )}
          <div className={`flex-shrink-0 ${templatesData?.length > 5 ? 'mr-2' : 'ml-2'}`}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                setSelectedTemplate(null);
                openModal(MODAL_TYPE?.TEMPLATE_MODAL);
              }}
            >
              + Create Template
            </button>
          </div>
        </div>
      </div>

      {filterTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {filterTemplates.map((template) => (
            <div
              key={template._id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              {/* Template Preview */}
              <div className="h-32 bg-base-200 border-b border-base-300 relative overflow-hidden">
                {template.html ? (
                  <div className="absolute inset-0 p-2 text-xs overflow-hidden">
                    <div 
                      className="w-full h-full transform scale-75 origin-top-left"
                      dangerouslySetInnerHTML={{ 
                        __html: template.html.replace(/\{\{(\w+)\}\}/g, '<span class="bg-warning px-1 rounded">$1</span>')
                      }} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-base-content/60">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📄</div>
                      <div className="text-xs">No Preview</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="card-body p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="card-title text-base-content truncate flex-1">
                    {template.name || 'Untitled Template'}
                  </h3>
                </div>
                
                <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                  {template.description || 'No description available'}
                </p>

                <div className="text-xs text-base-content/50 mb-3">
                  Created {formatRelativeTime(template.createdAt)}
                </div>

                {/* Action Buttons */}
                <div className="card-actions justify-start">
                  <button
                    onClick={() => handleOpenPlayground(template)}
                    className="btn btn-primary btn-sm"
                  >
                    <PlayIcon size={12} />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-lg mb-2">No templates found</p>
          <p className="text-gray-400 text-sm mb-6">Create your first template to get started</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSelectedTemplate(null);
              openModal(MODAL_TYPE?.TEMPLATE_MODAL);
            }}
          >
            + Create Template
          </button>
        </div>
      )}

      <TemplateModal 
        params={resolvedParams} 
        selectedTemplate={selectedTemplate} 
        setSelectedTemplate={setSelectedTemplate} 
      />
      
      <TemplatePlayground
        template={playgroundTemplate}
        setTemplate={setPlaygroundTemplate}
      />
      
      <DeleteModal 
        onConfirm={handleDeleteTemplate} 
        item={selectedDataToDelete} 
        title="Delete Template" 
        description={`Are you sure you want to delete the template "${selectedDataToDelete?.actual_name}"? This action cannot be undone.`} 
        loading={isDeleting} 
        isAsync={true} 
      />
    </div>
  );
};

export default TemplatesPage;
