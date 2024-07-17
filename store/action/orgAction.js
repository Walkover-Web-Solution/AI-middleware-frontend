import { createOrg, getAllOrg } from "@/config";
import { organizationCreated, organizationsFetched, setCurrentOrgId } from "../reducer/orgReducer";

export const createOrgAction = (dataToSend, onSuccess) => async (dispatch) => {
  try {
    const data = await createOrg(dataToSend);
    onSuccess(data.data.data);
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


export const setCurrentOrgIdAction = (orgId) => (dispatch) => {
  try {
    dispatch(setCurrentOrgId(orgId));
  } catch (error) {
    console.error(error);

  }
};
