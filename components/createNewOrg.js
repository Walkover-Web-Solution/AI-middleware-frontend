import { createOrgAction } from '@/store/action/orgAction';
import { userDetails } from '@/store/action/userDetailsAction';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from './loadingSpinner';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';

const CreateOrg = ({handleSwitchOrg }) => {
    const [orgDetails, setOrgDetails] = useState({ name: '', about: '' });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const route = useRouter();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrgDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    }, []);

    const createOrgHandler = useCallback(async (e) => {
        e.preventDefault();
        const { name, about } = orgDetails;
        setIsLoading(true);
        try {
            const dataToSend = {
                company: {
                    name,
                    meta: { about },
                },
            };

            dispatch(createOrgAction(dataToSend, (data) => {
                dispatch(userDetails());
                handleSwitchOrg(data.id, data.name);
                toast.success('Organization created successfully');
                route.push(`/org/${data.id}/bridges`);
            }));
        } catch (error) {
            toast.error('Failed to create organization');
            console.error(error);
        } finally {
            setIsLoading(false);
            closeModal(MODAL_TYPE.CREATE_ORG_MODAL)
        }
    }, [orgDetails, dispatch, route]);

    return (
        <div>
            {isLoading && <LoadingSpinner />}
            <div className=""></div>
            <dialog id={MODAL_TYPE.CREATE_ORG_MODAL} className="modal">
                <div className="flex items-center justify-center min-h-screen">
                    <form className="modal-box relative p-5 bg-white rounded-lg shadow-xl mx-4" onSubmit={createOrgHandler}>
                        <h3 className="font-bold text-lg mb-2">Create Organization</h3>
                        <label className='label-text mb-1'>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={orgDetails.name}
                            onChange={handleChange}
                            placeholder="Organization Name"
                            className="input input-bordered w-full mb-4"
                            minLength={3}
                            maxLength={40}
                            required
                        />
                        <label className='label-text mb-1'>Description</label>
                        <textarea
                            id="message"
                            name="about"
                            rows="4"
                            value={orgDetails.about}
                            onChange={handleChange}
                            placeholder="About your Organization"
                            className="p-2.5 w-full text-sm textarea textarea-bordered"
                            minLength={10}
                            maxLength={400}
                            required
                        />
                        <div className="modal-action">
                            <button type="button" onClick={()=>closeModal(MODAL_TYPE.CREATE_ORG_MODAL)} className="btn">Close</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default CreateOrg;
