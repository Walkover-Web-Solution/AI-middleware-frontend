import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';

const OrganizationHeader = () => {
    return (
        <div className='flex flex-row justify-between items-center'>
            <h2 className="text-2xl font-semibold text-base-content">Existing Organizations</h2>
            <button
                onClick={() => openModal(MODAL_TYPE.CREATE_ORG_MODAL)}
                className="btn btn-primary"
            >
                + Create New Organization
            </button>
        </div>
    );
};

export default OrganizationHeader;
