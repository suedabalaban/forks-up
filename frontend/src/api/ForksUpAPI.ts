import axios from 'axios';
import { auth } from "../config/firebaseconfig";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('No authentication token available');
    }
    return token;
};

export { api, getToken };