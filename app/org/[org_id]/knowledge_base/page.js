"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layoutComponents/MainLayout";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from "@/customHooks/customSelector";
import DeleteModal from "@/components/UI/DeleteModal";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, openModal, formatRelativeTime, formatDate } from "@/utils/utility";
import SearchItems from "@/components/UI/SearchItems";
import { SquarePenIcon, TrashIcon } from "@/components/Icons";
import CustomTable from "@/components/customTable/CustomTable";
import { useDispatch } from "react-redux";
import {
  getCollectionsAction,
  deleteResourceAction,
  getResourcesForCollectionAction
} from "@/store/action/knowledgeBaseAction";
import KnowledgeBaseCollectionModal from "@/components/modals/KnowledgeBaseCollectionModal";
import KnowledgeBaseResourceModal from "@/components/modals/KnowledgeBaseResourceModal";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { descriptions, linksData, collections, isLoadingCollections, resourcesByCollection } = useCustomSelector((state) => ({
    descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions || {},
    linksData: state.flowDataReducer.flowData.linksData || [],
    collections: state.knowledgeBaseReducer.collections || [],
    isLoadingCollections: state.knowledgeBaseReducer.loadingCollections,
    resourcesByCollection: state.knowledgeBaseReducer.resourcesByCollection || {}
  }));

  const [expandedRows, setExpandedRows] = useState({});
  const [activeCollection, setActiveCollection] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredCollections, setFilteredCollections] = useState(collections);

  // Initial Fetch
  useEffect(() => {
    dispatch(getCollectionsAction());
  }, [dispatch]);

  // Update filtered collections when collections change
  useEffect(() => {
    setFilteredCollections(collections);
  }, [collections]);

  // Handle command palette filters
  useEffect(() => {
    const filter = searchParams.get('filter');
    const type = searchParams.get('type');
    
    if (filter && type) {
      if (type === 'collection') {
        // Expand and highlight specific collection
        const collection = collections.find(c => c.collection_id === filter);
        if (collection) {
          setExpandedRows({ [filter]: true });
          setActiveCollection(collection);
          dispatch(getResourcesForCollectionAction(filter));
        }
      } else if (type === 'resource') {
        // Find collection containing this resource and expand it
        Object.entries(resourcesByCollection).forEach(([collectionId, resources]) => {
          const resource = resources.find(r => r._id === filter);
          if (resource) {
            const collection = collections.find(c => c.collection_id === collectionId);
            if (collection) {
              setExpandedRows({ [collectionId]: true });
              setActiveCollection(collection);
            }
          }
        });
      }
    }
  }, [searchParams, collections, resourcesByCollection, dispatch]);

  const getResourceList = useCallback((collection) => {
    const loadedResources = resourcesByCollection[collection.collection_id] || [];
    return loadedResources;
  }, [resourcesByCollection]);


  const handleOpenResourceModal = (collection, resource = null) => {
    setActiveCollection(collection);
    setSelectedResource(resource);
    openModal(MODAL_TYPE.KNOWLEDGE_BASE_RESOURCE_MODAL);
  };

  const handleOpenDeleteModal = (resource, collectionId) => {
    setResourceToDelete({ ...resource, collectionId });
    openModal(MODAL_TYPE.DELETE_MODAL);
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete?._id) return;
    setIsDeleting(true);
    const result = await dispatch(deleteResourceAction(resourceToDelete._id, resourceToDelete.collectionId));
    if (result?.success) {
      closeModal(MODAL_TYPE.DELETE_MODAL);
      setResourceToDelete(null);
    }
    setIsDeleting(false);
  };

  // --- Table Columns Configuration ---

  const mainColumns = useMemo(() => [
    {
      key: 'name',
      title: 'Name',
      width: 'min-w-[200px]',
      render: (row) => (
        <div className="tooltip" data-tip={row.name}>
          {row.name}
        </div>
      )
    },
    {
      key: 'models',
      title: 'Models',
      width: 'min-w-[250px]',
      render: (row) => (
        <div className="text-xs space-y-1">
          <div><span className="font-medium">Dense:</span> {row.settings?.denseModel || "-"}</div>
          <div><span className="font-medium">Sparse:</span> {row.settings?.sparseModel || "-"}</div>
          <div><span className="font-medium">Reranker:</span> {row.settings?.rerankerModel || "-"}</div>
        </div>
      )
    },
    {
      key: 'chunkSettings',
      title: 'Chunk Settings',
      width: 'min-w-[150px]',
      render: (row) => (
        <div className="text-xs space-y-1">
          <div><span className="font-medium">Size:</span> {row.settings?.chunkSize ?? "-"}</div>
          <div><span className="font-medium">Overlap:</span> {row.settings?.chunkOverlap ?? "-"}</div>
        </div>
      )
    },
    {
      key: 'resources',
      title: 'Resources',
      width: 'min-w-[100px]',
      render: (row) => (
        <div className="text-sm">
          <span className="font-medium">{row.resource_ids?.length || 0}</span>
          <span className="text-gray-500"> resource{row.resource_ids?.length === 1 ? "" : "s"}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      width: 'min-w-[120px]',
      render: (row) => (
        <div className="group cursor-help text-sm">
          <span className="group-hover:hidden">
            {formatRelativeTime(row.created_at)}
          </span>
          <span className="hidden group-hover:inline">
            {formatDate(row.created_at)}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 'w-[120px]',
      render: (row) => (
        <button
          className="btn btn-outline btn-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenResourceModal(row);
          }}
        >
          + Resource
        </button>
      )
    }
  ], []);

  const resourceColumns = useMemo(() => [
    {
      key: 'title',
      title: 'Title',
      render: (row) => <div className="truncate max-w-[200px]">{row.title || "Untitled"}</div>
    },
    {
      key: 'url',
      title: 'URL',
      render: (row) => (
        <div className="truncate text-gray-500 max-w-[200px]">
          {row.url || row.content || "-"}
        </div>
      )
    },
    {
      key: 'chunkSize',
      title: 'Chunk Size',
      render: (row) => (
        <div className="text-xs text-gray-600">
          {row.settings?.chunkSize || "-"}
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (row) => (
        <div className="group cursor-help text-xs text-gray-500">
          <span className="group-hover:hidden">
            {formatRelativeTime(row.created_at)}
          </span>
          <span className="hidden group-hover:inline">
            {formatDate(row.created_at)}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            className="btn btn-ghost btn-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenResourceModal(activeCollection, row);
            }}
          >
            <SquarePenIcon size={14} />
          </button>
          <button
            className="btn btn-ghost btn-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteModal(row, activeCollection?.collection_id);
            }}
          >
            <TrashIcon size={14} strokeWidth={2} />
          </button>
        </div>
      )
    }
  ], [activeCollection]);

  // Handle row expansion
  const toggleRow = (collectionId, isExpanded) => {
    setExpandedRows(prev => ({ ...prev, [collectionId]: isExpanded }));
    if (isExpanded) {
      const collection = collections.find(c => c.collection_id === collectionId);
      setActiveCollection(collection);

      // Dispatch action to fetch resources if not already loaded (or even if loaded to refresh)
      dispatch(getResourcesForCollectionAction(collectionId));
    }
  };

  return (
    <div className="w-full">
      <div className="px-2 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full gap-2">
            <PageHeader
              title="Knowledge Base"
              description={descriptions?.["Knowledge Base"] || "A knowledge Base is a collection of useful info like docs and FAQs. You can add it via files, URLs, or websites. Agents use this data to generate dynamic, context-aware responses without hardcoding."}
              docLink={linksData?.find(link => link.title === "Knowledge Base")?.blog_link}
            />
          </div>
        </MainLayout>
        <div className="flex flex-row gap-4">
          {filteredCollections.length > 5 && (
            <SearchItems 
              data={collections} 
              setFilterItems={setFilteredCollections} 
              item="Collection"
              searchFields={['name', 'collection_id']}
            />
          )}
          <div className="flex-shrink-0">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openModal(MODAL_TYPE.KNOWLEDGE_BASE_COLLECTION_MODAL)}
            >
              + Create Collection
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 pb-6">
        {isLoadingCollections ? (
          <div className="text-center py-10 text-sm text-gray-500">Loading collections...</div>
        ) : (
          <CustomTable
            data={filteredCollections}
            columns={mainColumns}
            expandable={true}
            expandedRowIds={Object.keys(expandedRows).filter(k => expandedRows[k])}
            onRowExpand={toggleRow}
            renderExpandedRow={(collection) => {
              const resources = getResourceList(collection);
              return (
                <div className="p-4 bg-base-100 rounded-md border border-base-200">
                  <div className="mb-2 font-semibold text-sm text-gray-600">Resources</div>
                  {resources.length === 0 ? (
                    <div className="text-sm text-gray-500">No resources found.</div>
                  ) : (
                    <CustomTable
                      data={resources}
                      columns={resourceColumns}
                    />
                  )}
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Collection Modal */}
      <KnowledgeBaseCollectionModal collections={collections} />

      {/* Resource Modal */}
      <KnowledgeBaseResourceModal
        activeCollection={activeCollection}
        selectedResource={selectedResource}
        setSelectedResource={setSelectedResource}
      />

      <DeleteModal
        onConfirm={handleDeleteResource}
        item={resourceToDelete}
        title="Delete Resource"
        description={`Are you sure you want to delete the resource "${resourceToDelete?.title}"? This action cannot be undone.`}
        loading={isDeleting}
        isAsync={true}
      />
    </div>
  );
};

export default Page;
