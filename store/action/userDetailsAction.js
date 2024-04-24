
import { createOrg, userdetails } from "@/api";
import { fetchUserDetails ,addOrganization} from "../reducer/userDetailsReducer";



export const userDetails = () => async (dispatch, getState) => {
    try {
      const data = await userdetails();
      dispatch(fetchUserDetails(data.data.data[0]));
    } catch (error) {
      console.error(error);
    }
  };

export const createOrgAction = (dataToSend) => async (dispatch) => {
  try {
    const response = await createOrg(dataToSend);
    console.log(response)
    dispatch(addOrganization({ name: response.data.data.name }));
  } catch (error) {
    console.error('Create Org Error:', error);
    throw error; 
  }
};

