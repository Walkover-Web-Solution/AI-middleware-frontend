import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import SearchItems from '../UI/SearchItems';

const OrganizationHeader = ({ organizationsArray, setDisplayedOrganizations }) => {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex flex-row justify-between items-center'>
                <h2 className="text-2xl font-semibold text-base-content">Existing Workspaces</h2>
            </div>
            
            {/* Search and Create Button Row */}
            {organizationsArray?.length > 5 && (
                <div className='flex flex-row gap-3 items-center'>
                    <div className="flex-1">
                        <SearchItems
                            data={organizationsArray}
                            setFilterItems={setDisplayedOrganizations}
                            item="Workspaces"
                            style="input input-sm input-bordered w-full border-base-300 bg-base-200/80 text-base-content placeholder-base-content/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none px-4 transition-all duration-150 shadow-sm rounded-lg"
                        />
                    </div>
                    <button
                        onClick={() => openModal(MODAL_TYPE.CREATE_ORG_MODAL)}
                        className="btn btn-primary btn-sm whitespace-nowrap"
                    >
                        + Create New Workspace
                    </button>
                </div>
            )}
            
            {/* Show button alone when no search is needed */}
            {(!organizationsArray || organizationsArray?.length <= 5) && (
                <div className='flex justify-end'>
                    <button
                        onClick={() => openModal(MODAL_TYPE.CREATE_ORG_MODAL)}
                        className="btn btn-primary btn-sm"
                    >
                        + Create New Workspace
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrganizationHeader;
