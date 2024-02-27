"use client"
import { allAuthKey, createAuthKey } from '@/api'
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { createNewAuthData, getAllAuthData } from '@/store/action/authkeyAction'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function Page() {
const dispatch = useDispatch();
const authData = useCustomSelector((state) => state?.authDataReducer?.authData || [])
console.log(authData, "authdata")
  // const [authData, setAuthData] = useState([])

  useEffect(() => {
     dispatch(getAllAuthData())
  }, [authData]); // Removed authData from dependencies to avoid infinite loop

  const columns = ["name", "authkey", "created_at"];

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Content copied to clipboard:', content);
        // Optionally, you can show a success message to the user
      })
      .catch((error) => {
        console.error('Error copying content to clipboard:', error);
        // Optionally, you can show an error message to the user
      });
  };

  const createAuthKeyHandler = async (e , name)=> {
    dispatch(createNewAuthData({
      "name": name,
      "throttle_limit": "60:10",
      "temporary_throttle_limit": "60:05",
      "temporary_throttle_time": "10"
   }))
  }

  return (

    <>
      <button className="btn float-end mt-2 btn-sm mr-3 btn-primary" onClick={() => document.getElementById('my_modal_5').showModal()}>+ create new key</button>

      <table className="table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th> // Beautify the column headers
            ))}
          </tr>
        </thead>
        <tbody>
          {authData?.map((item) => (
            <tr key={item._id} className="hover-row hover">
              {columns.map(column => (
                <td key={`${item._id}-${column}`}>{item[column]}</td>
              ))}
              <td className="gap-3 flex justify-center align-center">
                <div className="tooltip tooltip-primary" data-tip="delete">
                  <a>
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
            <input type="text" className="grow" id='authNameInput' placeholder="Insert Auth Name" />
          </label>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}

              <button className="btn" onClick={(e) => createAuthKeyHandler(e , document.getElementById('authNameInput').value)}>+ Create</button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default Protected(Page)
