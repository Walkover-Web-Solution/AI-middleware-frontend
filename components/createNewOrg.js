import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createOrgAction, addOrganization } from '@/store/action/userDetailsAction';
import { userDetails } from '@/store/action/userDetailsAction';

function CreateOrg({onClose}) {
    const [orgDetails, setOrgDetails] = useState({
        name: '',
        email: '',
        mobile: '',
        timezone: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const route = useRouter();

    const handleChange = (e) => {
        setOrgDetails({
            ...orgDetails,
            [e.target.name]: e.target.value
        });
    };


    const createOrgHandler = async () => {
        const { name, email, mobile, timezone } = orgDetails;
        if (!name.trim() || name.trim().length < 3) {
            toast.error("Organization name is required and must be at least 3 characters long");
            
            return;
        }   
        
        setIsLoading(true);
        try {
            const dataToSend = {
                "company": {
                    "name": name	
                }
            };
    
            dispatch(createOrgAction(dataToSend))
                onClose(); 
                route.push('/org'); 
               
            
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div>
            {isLoading &&  
                 (<div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
                 <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
                   <div className="flex items-center justify-center space-x-2">
                     {/* Tailwind CSS Spinner */}
                     <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span className="text-xl font-medium text-gray-700">Loading...</span>
                   </div>
                 </div>
               </div>
               )
            }
             <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

<dialog id="create-org-modal" className="modal fixed z-50 inset-0 overflow-y-auto" open>
    <div className="flex items-center justify-center min-h-screen">
        <div className="modal-box relative p-5 bg-white rounded-lg shadow-xl mx-4">
            <h3 className="font-bold text-lg">Create Organization</h3>
            <input type="text" name="name" value={orgDetails.name} onChange={handleChange} placeholder="Organization Name" className="input input-bordered w-full mb-4" />
            
            <div className="modal-action">
                <button onClick={onClose} className="btn">Close</button>
                <button onClick={createOrgHandler} className="btn btn-primary">Create</button>
            </div>
        </div>
    </div>
</dialog>
        </div>
    );
}

export default CreateOrg;

