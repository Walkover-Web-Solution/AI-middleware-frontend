import { createOrgAction } from '@/store/action/orgAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from './loadingSpinner';

function CreateOrg({ onClose }) {
    const [orgDetails, setOrgDetails] = useState({
        name: '',
        about: '',
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
    const handleAboutCompanyChange = (e) => {
        setOrgDetails({
            ...orgDetails,
            [e.target.name]: e.target.value
        });
    };

    const createOrgHandler = async () => {
        const { name, about } = orgDetails;
        if (!name.trim() || name.trim().length < 3 ) {
            toast.error("Organization name is required and must be at least 3 characters long");
            return;
        }
        if (!about.trim() || about.trim().length < 10 ) {
            toast.error("About Organization is required and must be at least 10 characters long");
            return;
        }

        setIsLoading(true);
        try {
            const dataToSend = {
                "company": {
                    "name": name,
                    "meta": {
                        about
                    }
                }
            };

            dispatch(createOrgAction(dataToSend, (data) => {
                onClose();
                dispatch(userDetails());
                toast.success('Organization created successfully');
                route.push(`/org/${data.id}/bridges`);
            }));
        } catch (error) {
            toast.error('Failed to create organization');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

            <dialog id="create-org-modal" className="modal fixed z-50 inset-0 overflow-y-auto" open>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="modal-box relative p-5 bg-white rounded-lg shadow-xl mx-4">
                        <h3 className="font-bold text-lg">Create Organization</h3>
                        <input type="text" name="name" value={orgDetails.name} onChange={handleChange} placeholder="Organization Name" className="input input-bordered w-full mb-4" />
                        <textarea id="message" name="about" rows="4" value={orgDetails.about} onChange={handleAboutCompanyChange} placeholder="About your Organization" className="p-2.5 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500" />
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

