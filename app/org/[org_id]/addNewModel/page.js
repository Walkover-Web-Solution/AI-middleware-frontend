'use client'
import React from 'react';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import AddNewModelModal from '@/components/modals/AddNewModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import MainLayout from '@/components/layoutComponents/MainLayout';
import CustomTable from '@/components/customTable/customTable';

const Page = () => {
    const { modelInfo} = useCustomSelector((state) => ({
        modelInfo: state?.modelReducer?.serviceModels
    }));


    const findModelsWithOrgId = (data, parentKey = null, rootKey = null, results = []) => {
        if (typeof data !== 'object' || data === null) return results;

        if (data.org_id) {
            results.push({ ...data, key: parentKey, service: rootKey });
            return results;
        }

        for (const key in data) {
            findModelsWithOrgId(
                data[key],
                key,
                rootKey || key,  // Only set rootKey if it's not already set
                results
            );
        }

        return results;
    };

    const getModelsWithOrgId = () => {
        if (!modelInfo) return [];
        return findModelsWithOrgId(modelInfo);
    };

    const modelWithOrgId = getModelsWithOrgId();

    const tableData = modelWithOrgId.map(model => ({
        model: model?.key,
        type: model?.validationConfig?.type,
        input_cost: model?.validationConfig?.specification?.input_cost,
        output_cost: model?.validationConfig?.specification?.output_cost,
        service: model?.service,
    }));

    const columns = [
        { key: 'model', label: 'Model' },
        { key: 'service', label: 'Service' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'knowledge_cutoff', label: 'Knowledge Cutoff' },
        { key: 'input_cost', label: 'Input Cost' },
        { key: 'output_cost', label: 'Output Cost' }
    ];

    return (
        <MainLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Model Management</h1>
                    <button
                        onClick={() => openModal(MODAL_TYPE.ADD_NEW_MODEL_MODAL)}
                        className="btn btn-primary"
                    >
                        Add New Model
                    </button>
                </div>

                <CustomTable
                    data={tableData}
                    columns={columns}
                />
                <AddNewModelModal />
            </div>
        </MainLayout>
    );
};

export default Page;