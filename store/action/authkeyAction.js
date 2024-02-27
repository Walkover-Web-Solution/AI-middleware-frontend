    import { allAuthKey, createAuthKey } from "@/api";
import { fetchAllAuthData , createAuthData } from "../reducer/authkeyReducer";


export const getAllAuthData = () => async (dispatch, getState) => {
    try {
      const data = await allAuthKey();
      console.log(data.data , " data ")
      dispatch(fetchAllAuthData(data.data));
    } catch (error) {
      console.error(error);
    }
  };

  export const createNewAuthData = (dataToSend) => async(dispatch , getState) => {
    try {
       const data =  await createAuthKey(dataToSend)
        dispatch(createAuthData(data.data))
    } catch (error) {
        
    }
  }