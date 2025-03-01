import { api, getToken } from './ForksUpAPI';
import {Recipe} from "../model/Recipe";

interface SliceResponse<T> {
    content: T[];
    first: boolean;
    last: boolean;
    hasPrevious: boolean;
    size: number;
    number: number;
}

export const getRecipes = async (
    keyword?: string,
    tags?: string[],
    pantryItems?: string[],
    page: number = 0,
    size: number = 9,
): Promise<SliceResponse<Recipe>> => {
    try {
        const params = new URLSearchParams();

        if (keyword) {
            params.append('keyword', keyword);
        }
        if (tags && tags.length > 0) {
            tags.forEach(tag => params.append('tags', tag));
        }
        if (pantryItems && pantryItems.length > 0) {
            pantryItems.forEach(item => params.append('pantryItems', item));
        }

        params.append('page', page.toString());
        params.append('size', size.toString());

        const token = await getToken();
        const response = await api.get(`/recipes/search?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving recipes:', error);
        throw error;
    }
};

export const getPersonalizedRecipes = async (
    keyword?: string,
    page: number = 0,
    size: number = 9,
): Promise<SliceResponse<Recipe>> => {
    try {
        const params = new URLSearchParams();
        if (keyword) {
            params.append('keyword', keyword);
        }
        params.append('page', page.toString());
        params.append('size', size.toString());

        const token = await getToken();
        const response = await api.get(`/recipes/preferences?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving recipes:', error);
        throw error;
    }
};

export const getRecipeById = async (id: string) => {
    try {
        const response = await api.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting recipe:', error);
        throw error;
    }
};

export const submitRecipeReview = async ({ recipeId, rating, comment, image }: any) => {
    try {
        const token = await getToken();
        const formData = new FormData();
        formData.append('recipeId', recipeId);
        formData.append('review', comment);
        formData.append('rating', rating.toString());
        if (image) {
            formData.append('image', image);
        }

        const response = await api.post('/user/review', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting recipe review:', error);
        throw error;
    }
};

export const getFavoriteRecipes = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/favorite/all', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data || [];
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        return [];
    }
};

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

export const getRecipeHistory = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/history/all', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving recipe history:', error);
        throw error;
    }
};

export const addToRecipeHistory = async (recipeId: string) => {
    try {
        const token = await getToken();
        await api.post(`/user/history/${recipeId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error adding to recipe history:', error);
        throw error;
    }
};

export const getLastRecipeFromHistory = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/history/last', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving last recipe history:', error);
        return null;
    }
};
