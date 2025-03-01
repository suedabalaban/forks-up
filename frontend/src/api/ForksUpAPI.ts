import axios from 'axios';
import { auth } from "../config/firebaseconfig";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = async () => {
    let token = await auth.currentUser?.getIdToken();
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 1000;

    while (!token && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        token = await auth.currentUser?.getIdToken();
        attempts++;
    }

    if (!token) {
        throw new Error('No authentication token available after multiple attempts');
    }
    return token;
};

export { api, getToken };