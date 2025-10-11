"use client"
import CustomTable from '@/components/customTable/customTable'
import MainLayout from '@/components/layoutComponents/MainLayout'
import LoadingSpinner from '@/components/loadingSpinner'
import OnBoarding from '@/components/OnBoarding'
import PageHeader from '@/components/Pageheader'
import Protected from '@/components/protected'
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast'
import { useCustomSelector } from '@/customHooks/customSelector'
import { createNewAuthData, deleteAuthData, getAllAuthData } from '@/store/action/authkeyAction'
import { MODAL_TYPE, ONBOARDING_VIDEOS, PAUTH_KEY_COLUMNS } from '@/utils/enums'
import { closeModal, openModal, RequiredItem } from '@/utils/utility'
import { CopyIcon, TrashIcon } from '@/components/Icons'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import DeleteModal from '@/components/UI/DeleteModal'
import SearchItems from '@/components/UI/SearchItems'
import { use } from 'react';

export const runtime = 'edge';

function Page({ params }) {
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const { authData, isFirstPauthCreation, descriptions } = useCustomSelector((state) => {
    const user = state.userDetailsReducer.userDetails || [];
    return {
      authData: state?.authDataReducer?.authData || [],
      isFirstPauthCreation: user?.meta?.onboarding?.PauthKey,
      descriptions: state.flowDataReducer.flowData?.descriptionsData?.descriptions || {},
    };
  });
  const [filterPauthKeys, setFilterPauthKeys] = useState(authData);
  const [selectedDataToDelete, setselectedDataToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstPauthCreation
  });

  useEffect(() => {
    dispatch(getAllAuthData())
    setFilterPauthKeys(authData)
  }, []); // Removed authData from dependencies to avoid infinite loop

const maskAuthKey = (authkey) => {
  if (!authkey) return '';
  return authkey.substring(0, 3) + '*'.repeat(9) + authkey.substring(authkey.length - 3);
};

  /**
   * Copies given content to clipboard
   * @param {string} content Content to be copied
   */
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success("Content copied to clipboard");
        // Optionally, you can show a success message to the user
      })
      .catch((error) => {
        console.error('Error copying content to clipboard:', error);
        // Optionally, you can show an error message to the user
      });
  };

  /**
   * Handler for creating a new auth key
   * @param {Event} e Event object
   * @param {string} name Name of the new auth key
   */
  const createAuthKeyHandler = async (e, name) => {
    const isDuplicate = authData.some(item => item.name === name);
    if (isDuplicate) {
      toast.error("The name has already been taken")
    }
    else if (name.length > 2) {
      setIsCreating(true); // Start loading
      try {
        await dispatch(createNewAuthData({
          name,
          throttle_limit: "60:800",
          temporary_throttle_limit: "60:600",
          temporary_throttle_time: "30",
        }));
        toast.success("Auth key created successfully");

      } catch (error) {
        toast.error("Failed to create pauth key");
        console.error(error);
      } finally {
        setIsCreating(false); // End loading
      }
    } else {
      toast.error("The name must be at least 3 characters. ")
    }
    closeModal(MODAL_TYPE.PAUTH_KEY_MODAL)
    document.getElementById('authNameInput').value = ''
  };

  const DeleteAuth = (item) => {
    closeModal(MODAL_TYPE?.DELETE_MODAL);
    dispatch(deleteAuthData(item)).then(() => {
      toast.success("Auth Key Deleted Successfully")
    });
  };

  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center">
        <div className="tooltip tooltip-primary" data-tip="delete">
          <a onClick={() => { setselectedDataToDelete(row); openModal(MODAL_TYPE.DELETE_MODAL) }}>
            <TrashIcon size={16} />
          </a>
        </div>
        <div
          className="tooltip tooltip-primary"
          onClick={() => copyToClipboard(row["originalAuthkey"])}
          data-tip="copy"
        >
          <CopyIcon size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="h-auto">
      <div className="w-full">
        {tutorialState?.showSuggestion && (
          <TutorialSuggestionToast
            setTutorialState={setTutorialState}
            flagKey="PauthKey"
            TutorialDetails="Pauth Key Setup"
          />
        )}
        {tutorialState?.showTutorial && (
          <OnBoarding
            setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))}
            video={ONBOARDING_VIDEOS.PauthKey}
            params={resolvedParams}
            flagKey="PauthKey"
          />
        )}
        <div className="px-2">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full pt-4">
            <PageHeader
              title="PauthKey"
              description={descriptions?.['Pauthkey'] || "A unique key used to validate API requests for sending and receiving messages securely."}
              docLink="https://gtwy.ai/blogs/features/pauthkey"
            />
           
          </div>
        </MainLayout>
        <div className="flex flex-row gap-4 justify-between ">

        <SearchItems data={authData} setFilterItems={setFilterPauthKeys} item="PauthKey"/>
        <div className="flex-shrink-0 mr-2">
              <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.PAUTH_KEY_MODAL)}>+ Create New PauthKey</button>
            </div>
            </div>
         </div>
        {isCreating ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            <CustomTable
              data={filterPauthKeys.map(item => ({
                ...item,
                actualName: item?.name || 'Unnamed Key',
                originalAuthkey: item?.authkey,
                authkey: maskAuthKey(item?.authkey), 
              }))}
              columnsToShow={PAUTH_KEY_COLUMNS}
              sorting
              sortingColumns={["name"]}
              keysToWrap={["authkey"]}
              endComponent={EndComponent}
            />
            {isCreating && <LoadingSpinner />}
          </div>
        )}
      </div>
      <dialog
        id={MODAL_TYPE.PAUTH_KEY_MODAL}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">Create New PauthKey</h3>
          <label className="input input-bordered flex items-center gap-2">
            Name{RequiredItem()} :
            <input
              type="text"
              className="grow"
              id="authNameInput"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const authName = e.target.value.trim();
                  if (authName) {
                    createAuthKeyHandler(e, authName);
                  } else {
                    toast.error("Input field cannot be empty");
                  }
                }
              }}
              placeholder="Insert Auth Name"
              required
            />
          </label>
          <div className="modal-action">
            <form method="dialog">
              <div className='flex gap-2'>
                <button className="btn">Cancel</button>
              </div>
            </form>
            <button className="btn btn-primary" onClick={(e) => createAuthKeyHandler(e, document.getElementById('authNameInput').value)}>+ Create</button>
          </div>
        </div>
      </dialog>

      <DeleteModal onConfirm={DeleteAuth} item={selectedDataToDelete} description={`Are you sure you want to delete the Pauth key "${selectedDataToDelete?.name}"? This action cannot be undone.`} title='Delete API Key' />
    </div>
  );
}

export default Protected(Page)
