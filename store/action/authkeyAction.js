    import { allAuthKey, createAuthKey, deleteAuthkey } from "@/api";
import { fetchAllAuthData , addAuthData, removeAuthData } from "../reducer/authkeyReducer";


export const getAllAuthData = () => async (dispatch, getState) => {
    try {
      const data = await allAuthKey();
      dispatch(fetchAllAuthData(data.data));
    } catch (error) {
      console.error(error);
    }
  };

  export const createNewAuthData = (dataToSend) => async(dispatch , getState) => {
    try {
       const {data} =  await createAuthKey(dataToSend)
        dispatch(addAuthData(data))
    } catch (error) {
        
    }
  }

  export const deleteAuthData = (data) => async(dispatch , getState) => {

    try {

      dispatch(removeAuthData(data.index))
     await  deleteAuthkey(data.id)
    } catch (error) {
      
    }
  }