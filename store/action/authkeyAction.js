    import { allAuthKey, createAuthKey, deleteAuthkey } from "@/config";
import { fetchAllAuthData , addAuthData, removeAuthData } from "../reducer/authkeyReducer";


/**
 * Action to fetch all auth keys from the server
 * and update the authkey reducer with the fetched data
 * @returns {function(*, *)} a thunk action creator
 */
export const getAllAuthData = () => async (dispatch, getState) => {
  // Fetch all auth keys from the server
  try {
    const { data } = await allAuthKey();
    // Update the authkey reducer with the fetched data
    dispatch(fetchAllAuthData(data));
  } catch (error) {
    // Log the error if any
    console.error(error);
  }
};


  /**
   * Action creator to create a new auth key
   * @param {object} dataToSend - the data to be sent to the server
   * for creating a new auth key
   * @returns {function(*, *)} a thunk action creator
   */
  export const createNewAuthData = (dataToSend) => async (dispatch, getState) => {
    try {
      // Make a request to the server to create a new auth key
      const { data } = await createAuthKey(dataToSend);

      // Update the authkey reducer with the new auth key data
      dispatch(addAuthData(data));
    } catch (error) {
      // Log the error if any
      console.error(error);
    }
  };
  

  /**
   * Action creator to delete an auth key
   * @param {object} data - the auth key data to be deleted
   * @param {number} data.id - the id of the auth key to be deleted
   * @param {number} data.index - the index of the auth key in the authkeys state
   * @returns {function(*, *)} a thunk action creator
   */
  export const deleteAuthData = (data) => async (dispatch, getState) => {
    try {
      // Remove the auth key from the authkeys reducer
      dispatch(removeAuthData(data.index));

      // Make a request to the server to delete the auth key
      await deleteAuthkey(data.id);
    } catch (error) {
      // Log the error if any
      console.error(error);
    }
  };
