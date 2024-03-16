import { createOrg,getAllOrg } from "@/api";
import { organizationCreated, organizationsFetched } from "../reducer/orgReducer";

export const createOrgAction = (dataToSend,onSuccess) => async(dispatch) => {
    try {
        const data = await createOrg(dataToSend);
        onSuccess(data);
        dispatch(organizationCreated(data));
      } catch (error) {
        console.error(error);
      }
}

export const getAllOrgAction = () => async (dispatch, getState) => {
    try {
      const response = await getAllOrg();
      dispatch(organizationsFetched(response.data));
    } catch (error) {
      console.error(error);
    }
  };


  export const setCurrentOrgIdAction = (orgId) => {
    return {
      type: 'organization/setCurrentOrgId',
      payload: orgId,
    };
  };
