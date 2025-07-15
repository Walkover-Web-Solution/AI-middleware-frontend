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

export const runtime = 'edge';

function Page({ params }) {
  const dispatch = useDispatch();
 const { authData, isFirstPauthCreation, } = useCustomSelector((state) => {
  const user = state.userDetailsReducer.userDetails || [];
  return {
    authData: state?.authDataReducer?.authData || [],
    isFirstPauthCreation: user?.meta?.onboarding?.PauthKey,
  };
});

  const [singleAuthData, setSingleAuthData] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: isFirstPauthCreation
  });

  useEffect(() => {
    dispatch(getAllAuthData())
  }, []); // Removed authData from dependencies to avoid infinite loop


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
    else  if (name.length > 2) {
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

  const deleteModel = (authname, authid, index) => {
    setSingleAuthData({ name: authname, id: authid, index })
    openModal(MODAL_TYPE.PAUTH_KEY_DELETE_MODAL)
    document.getElementById('authNameInput').value = ''
  }

  const DeleteAuth = () => {
    dispatch(deleteAuthData(singleAuthData)).then(() => {
      toast.success("Auth Key Deleted Successfully")
      // Optionally, you can show a success message to the user
    });
    closeModal(MODAL_TYPE.PAUTH_KEY_DELETE_MODAL);
  };

  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center">
        <div className="tooltip tooltip-primary" data-tip="delete">
          <a onClick={() => deleteModel(row["name"], row["id"], row.index)}>
            <TrashIcon size={16} />
          </a>
        </div>
        <div
          className="tooltip tooltip-primary"
          onClick={() => copyToClipboard(row["authkey"])}
          data-tip="copy auth key"
        >
          <CopyIcon size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="h-auto">
      {tutorialState?.showSuggestion && <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"PauthKey"} TutorialDetails={"Pauth Key Setup"}/>}
      {tutorialState?.showTutorial && (
        <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.PauthKey} params={params} flagKey={"PauthKey"} />
      )}
      <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-4 px-2 pt-4">
        <PageHeader
          title="PauthKey"
          description="A unique key used to validate API requests for sending and receiving messages securely."
        />
        <div className="flex-shrink-0 mt-4 sm:mt-0">
          <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.PAUTH_KEY_MODAL)}>+ create new Pauth key</button>
        </div>
      </div>
      </MainLayout>
      {isCreating && <LoadingSpinner />}
      <CustomTable
        data={authData.map(item => ({
          ...item,
          actualName: item.name
        }))}
        columnsToShow={PAUTH_KEY_COLUMNS}
        sorting
        sortingColumns={["name"]}
        keysToWrap={["authkey"]}
        endComponent={EndComponent}
      />
      <dialog
        id={MODAL_TYPE.PAUTH_KEY_MODAL}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">Create New Auth</h3>
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
              {/* if there is a button in form, it will close the modal */}

              <div className='flex gap-2'>
                <button className="btn">Cancel</button>
              </div>
            </form>
            <button className="btn btn-primary" onClick={(e) => createAuthKeyHandler(e, document.getElementById('authNameInput').value)}>+ Create</button>
          </div>
        </div>
      </dialog>

      <dialog id={MODAL_TYPE.PAUTH_KEY_DELETE_MODAL} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Do you want to delete {singleAuthData.name} ?</h3>
          {/* <p className="py-4">Do you want to delete {singleAuthData.name } ?</p> */}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Cancel</button>
            </form>
            <button className="btn" onClick={DeleteAuth}>Delete</button>

          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Protected(Page)
