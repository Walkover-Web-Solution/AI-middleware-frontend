import axios from "@/utils/interceptor";
import { toast } from "react-toastify";

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Knowledge Base Management APIs
export const createCollection = async (data) => {
    try {
        const response = await axios.post(`${URL}/api/rag/collection`, data);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to create Collection');
        console.error(error);
        return error;
    }
};

export const getCollections = async () => {
    try {
        const response = await axios.get(`${URL}/api/rag/collections`);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch collections');
        console.error(error);
        return error;
    }
};

export const createResource = async (data) => {
    try {
        const response = await axios.post(`${URL}/api/rag/resource`, data);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to create resource');
        console.error(error);
        return error;
    }
};

export const updateResource = async (id, data) => {
    try {
        const response = await axios.put(`${URL}/api/rag/resource/${id}`, data);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to update resource');
        console.error(error);
        return error;
    }
};

export const deleteResource = async (id) => {
    try {
        const response = await axios.delete(`${URL}/api/rag/resource/${id}`);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete resource');
        console.error(error);
        return error;
    }
};

export const getResourcesByCollectionId = async (collectionId) => {
    try {
        const response = await axios.get(`${URL}/api/rag/collection/${collectionId}/resources`);
        return response?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to fetch resources');
        console.error(error);
        return error;
    }
};
