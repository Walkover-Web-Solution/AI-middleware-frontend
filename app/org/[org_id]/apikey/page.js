"use client"
import Sidebar from '@/components/Sidebar'
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { createNewAuthData, deleteAuthData, getAllAuthData } from '@/store/action/authkeyAction'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

export const runtime = 'edge';

function Page({ params }) {
  const dispatch = useDispatch();
  const authData = useCustomSelector((state) => state?.authDataReducer?.authData || [])
  const [singleAuthData, setSingleAuthData] = useState({})
  const [isCreating, setIsCreating] = useState(false);
  const path = usePathname()
  const route = useRouter()
  // const [authData, setAuthData] = useState([])

  useEffect(() => {
    dispatch(getAllAuthData())
  }, [authData]); // Removed authData from dependencies to avoid infinite loop

  const columns = ["name", "authkey", "created_at"];

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
        document.getElementById('my_modal_5').close();
      } catch (error) {
        toast.error("Failed to create auth key");
        console.error(error);
      } finally {
        setIsCreating(false); // End loading
      }
    } else {
      toast.error("Input field cannot be empty");
    }
  };

  const deleteModel = (authname, authid, index) => {
    setSingleAuthData({ name: authname, id: authid, index })
    document.getElementById('api-key-modal').showModal()
  }

  const DeleteAuth = () => {
    dispatch(deleteAuthData(singleAuthData)).then(() => {
      toast.success("Auth Key Deleted Successfully")
      // Optionally, you can show a success message to the user
    })
    document.getElementById('api-key-modal').close()
  }
  return (
    <div className="drawer lg:drawer-open">
      {isCreating &&
        (<div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
          <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
            <div className="flex items-center justify-center space-x-2">
              {/* Tailwind CSS Spinner */}
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-medium text-gray-700">Creating...</span>
            </div>
          </div>
        </div>
        )}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">

            <table className="table">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th> // Beautify the column headers
                  ))}
                </tr>
              </thead>
              <tbody>
                {authData?.map((item, index) => (
                  <tr key={item._id} className="hover-row hover">
                    {columns.map(column => (
                      <td key={`${item._id}-${column}`}>{item[column]}</td>
                    ))}
                    <td className="gap-3 flex justify-center align-center">
                      <div className="tooltip tooltip-primary" data-tip="delete">
                        <a onClick={() => deleteModel(item['name'], item['id'], index)}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_117_1501)">
                              <path d="M7 4V2H17V4H22V6H20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="#03053D" />
                            </g>
                            <defs>
                              <clipPath id="clip0_117_1501">
                                <rect width="24 " height="24" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </a>
                      </div>
                      <div className="tooltip tooltip-primary" onClick={() => copyToClipboard(item['authkey'])} data-tip="copy auth key">
                        <a>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_7_7)">
                              <path d="M7 6V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H20C20.2652 2 20.5196 2.10536 20.7071 2.29289C20.8946 2.48043 21 2.73478 21 3V17C21 17.2652 20.8946 17.5196 20.7071 17.7071C20.5196 17.8946 20.2652 18 20 18H17V21C17 21.552 16.55 22 15.993 22H4.007C3.87513 22.0008 3.7444 21.9755 3.62232 21.9256C3.50025 21.8757 3.38923 21.8022 3.29566 21.7093C3.20208 21.6164 3.12779 21.5059 3.07705 21.3841C3.02632 21.2624 3.00013 21.1319 3 21L3.003 7C3.003 6.448 3.453 6 4.01 6H7ZM5.003 8L5 20H15V8H5.003ZM9 6H17V16H19V4H9V6Z" fill="#03053D" />
                            </g>
                            <defs>
                              <clipPath id="clip0_7_7">
                                <rect width="24 " height="24" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>

                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Create New Auth</h3>
                <label className="input input-bordered flex items-center gap-2">
                  Name
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
                  <button className="btn" onClick={(e) => createAuthKeyHandler(e, document.getElementById('authNameInput').value)}>+ Create</button>
                </div>
              </div>
            </dialog>

            <dialog id="api-key-modal" className="modal">
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
