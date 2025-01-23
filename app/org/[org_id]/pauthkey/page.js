"use client"
import LoadingSpinner from '@/components/loadingSpinner'
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customHooks/customSelector'
import { createNewAuthData, deleteAuthData, getAllAuthData } from '@/store/action/authkeyAction'
import { MODAL_TYPE, PAUTH_KEY_COLUMNS } from '@/utils/enums'
import { closeModal, openModal } from '@/utils/utility'
import { Copy, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

export const runtime = 'edge';

function Page() {
  const dispatch = useDispatch();
  const authData = useCustomSelector((state) => state?.authDataReducer?.authData || [])
  const [singleAuthData, setSingleAuthData] = useState({})
  const [isCreating, setIsCreating] = useState(false);
 

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
    if (name.length > 0) {
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
      toast.error("Input field cannot be empty");
    }
    closeModal(MODAL_TYPE.PAUTH_KEY_MODAL)
    document.getElementById('authNameInput').value=''
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
    })
    closeModal(MODAL_TYPE.PAUTH_KEY_DELETE_MODAL)
  }
  return (
    <div className="h-full p-5">
      {isCreating && <LoadingSpinner />}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">

            <table className="table">
              <thead>
                <tr>
                  {PAUTH_KEY_COLUMNS.map(column => (
                    <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th> // Beautify the column headers
                  ))}
                </tr>
              </thead>
              <tbody>
                {authData?.map((item, index) => (
                  <tr key={item._id} className="hover-row hover">
                    {PAUTH_KEY_COLUMNS.map(column => (
                      <td key={`${item._id}-${column}`}>{item[column]}</td>
                    ))}
                    <td className="gap-3 flex justify-center align-center">
                      <div className="tooltip tooltip-primary" data-tip="delete">
                        <a onClick={() => deleteModel(item['name'], item['id'], index)}>
                          <Trash2 strokeWidth={2} size={20} />
                        </a>
                      </div>
                      <div className="tooltip tooltip-primary" onClick={() => copyToClipboard(item['authkey'])} data-tip="copy auth key">
                        <Copy size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dialog id={MODAL_TYPE.PAUTH_KEY_MODAL} className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-2">Create New Auth</h3>
                <label className="input input-bordered flex items-center gap-2">
                  Name :
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
        </div>

      </div>
    </div>

  )
}

export default Protected(Page)
