import axios from 'axios';
import {auth} from "../config/firebaseconfig";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token al ve başlık oluştur
const getToken = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
        throw new Error('No authentication token available');
    }
    return token
};

// Favori durumunu kontrol eden fonksiyon
export const checkFavoriteStatus = async (recipeId: string) => {
    try {
        const token = await getToken();
        const response = await api.get(`/user/favorite/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        throw error;
    }
};

// Favori ekleme fonksiyonu
export const addFavorite = async (recipeId: string) => {
    try {
        const token = await getToken();
        await api.put(`/user/favorite/${recipeId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

// Favori kaldırma fonksiyonu
export const removeFavorite = async (recipeId: string) => {
    try {
        const token = await getToken();
        await api.delete(`/user/favorite/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

//
export const getIngredients = async (searchQuery: string) => {
    try {
        const token = await getToken();
        return await axios.get(`http://localhost:8080/api/ingredients/search`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {keyword: searchQuery}
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
    }
};

//
export const getPantryItems = async () => {
    try {
        const token = await getToken();
        return await axios.get(`http://localhost:8080/api/user/pantry`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error fetching pantry items:', error);
        throw error;
    }
};

//
export const addIngredient = async (ingredientId: string) => {
    try {
        const token = await getToken();
        return await axios.post('http://localhost:8080/api/user/pantry', null, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ingredientId,
                quantity: 1
            }
        });
    } catch (error) {
        console.error('Error adding ingredient:', error);
        throw error;
    }
};

//
export const updateQuantity = async (ingredientId: string, quantity: number) => {
    try {
        const token = await getToken();
        return await axios.put(`http://localhost:8080/api/user/pantry/${ingredientId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { quantity }
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
    }
};

//
export const removeIngredient = async (ingredientId: string) => {
    try {
        const token = await getToken();
        return await axios.delete(`http://localhost:8080/api/user/pantry/${ingredientId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error removing ingredient:', error);
        throw error;
    }
};

export const getRecipes = async (
    keyword: string,
    selectedTags: string[] = [],
    page: number = 0,
    size: number = 10
) => {
    try {
        const token = await getToken();
        const tagsQuery = selectedTags
            .map(tag => `tags=${encodeURIComponent(tag)}`)
            .join('&');
        const response = await api.get('/recipes/searchTags', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                keyword,
                page,
                size,
            },
            paramsSerializer: params => {
                const baseParams = new URLSearchParams(params as any).toString();
                return tagsQuery ? `${baseParams}&${tagsQuery}` : baseParams;
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving recipes:', error);
        throw error;
    }
};

// Favori tarifleri getir
export const getFavoriteRecipes = async () => {
    try {
        const token = await getToken(); // Token al
        const response = await axios.get('http://localhost:8080/api/user/favorite/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        throw error;
    }
};

// Kullanıcıyı kaydet veya güncelle
export const registerOrUpdateUser = async (user: any) => {
    try {
        if (!user) return;

        const isFirstLogin = !localStorage.getItem(`userRegistered_${user.uid}`);
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

        if (isNewUser || isFirstLogin) {
            const token = await getToken();
            await axios.put('http://localhost:8080/api/user', null, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            localStorage.setItem(`userRegistered_${user.uid}`, 'true');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};