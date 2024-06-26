import { postmanCollection } from "@/config";
import { postmanCollectionFetched, setLoading, setError } from "../reducer/postmanCollectionReducer";

export const postmanCollectionAction = (dataToSend) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const data = await postmanCollection(dataToSend);
        dispatch(postmanCollectionFetched(data));
        dispatch(setLoading(false));
    } catch (error) {
        dispatch(setError(error));
        dispatch(setLoading(false));
        console.error(error);
    }
};
