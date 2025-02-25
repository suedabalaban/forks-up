import axios from 'axios';
import {auth} from "../config/firebaseconfig";

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
    return token
};

interface UserResponse {
    data: {
        description?: string;
    }
}

export const getMyUser = async (): Promise<UserResponse> => {
    try {
        const token = await getToken();
        const response = await api.get(`/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
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

export const getIngredients = async (searchQuery: string) => {
    try {
        const token = await getToken();
        return await api.get(`/ingredients/search`, {
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

export const getPantryItems = async () => {
    try {
        const token = await getToken();
        return await api.get(`/user/pantry`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error getting ingredients:', error);
        console.error('Error fetching pantry items:', error);
        throw error;
    }
};

export const addIngredient = async (ingredientId: string, quantity: number, unit: string) => {
    try {
        const token = await getToken();
        return await api.post('/user/pantry', null, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ingredientId,
                quantity,
                unit
            }
        });
    } catch (error) {
        console.error('Error adding ingredient:', error);
        throw error;
    }
};

export const updateQuantity = async (ingredientId: string, quantity: number, unit: string) => {
    try {
        const token = await getToken();
        return await api.put(`/user/pantry/${ingredientId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                quantity,
                unit
            }
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        throw error;
    }
};

export const removeIngredient = async (ingredientId: string) => {
    try {
        const token = await getToken();
        return await api.delete(`/user/pantry/${ingredientId}`, {
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
    keyword?: string,
    tags?: string[],
    pantryItems?: string[],
    page: number = 0,
    size: number = 9,
): Promise<any> => {
    try {
        const params = new URLSearchParams();

        // Add parameters only if they are defined
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
): Promise<any> => {
    try {
        const params = new URLSearchParams();
        // Add parameters only if they are defined
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

export const getFavoriteRecipes = async () => {
    try {
        const token = await getToken(); // Token al
        const response = await axios.get('http://localhost:8080/api/user/favorite/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        // API'den gelen veri null veya undefined ise boş array dön
        return response.data || [];
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        // Hata durumunda boş array dön
        return [];
    }
};

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

export interface DietaryRestrictions {
    health_conscious: string[]
    allergies_intolerances: string[]
    lifestyle: string[]
}

export interface Preferences {
    dietary_restrictions: DietaryRestrictions
    cuisines: string[]
    preparation_time: string
}

export const addUserPreferences = async (preferences: Preferences) => {
    try {
        const token = await getToken();
        const response = await api.post('/user/preferences', preferences, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving user preferences:', error);
        throw error;
    }
}

export const getUserPreferences = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/preferences', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error retrieving user preferences:', error);
        throw error;
    }
}

export const checkDietaryRestriction = async (recipeId: string, inputText: string) => {
    try {
        const token = await getToken();
        const response = await api.post(`/gemini/recipe/${recipeId}/dietary`,
            { inputText },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error checking dietary restriction:', error);
        throw error;
    }
};

export const analyzeRecipeSteps = async (recipeId: string, inputText: string) => {
    try {
        const token = await getToken();
        const response = await api.post(`/gemini/recipe/${recipeId}/steps`,
            { inputText },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error analyzing recipe steps:', error);
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

interface RecipeReview {
    recipeId: string;
    rating: number;
    comment: string;
    image?: File;
}

export const submitRecipeReview = async ({ recipeId, rating, comment, image }: RecipeReview) => {
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
                'Authorization': `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting recipe review:', error);
        throw error;
    }
};

export const uploadAvatar = async (avatar: File) => {
    try {
        const token = await getToken();
        const formData = new FormData();
        formData.append('avatar', avatar);

        const response = await api.post('/user/avatar', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};

export const getAvatar = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/avatar', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'arraybuffer',
        });
        return response.data;
    } catch (error) {
        console.error('Error getting avatar:', error);
        throw error;
    }
};

export const generateAvatar = async () => {
    try {
        const token = await getToken();
        const response = await api.post('/user/generate-avatar', null, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            responseType: 'arraybuffer'  
        });
        return response.data;
    } catch (error) {
        console.error('Error generating avatar:', error);
        throw error;
    }
};

export const updateDescription = async (description: string) => {
    try {
        const token = await getToken();
        const response = await api.post('/user/description',
            { description },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating description:', error);
        throw error;
    }
};

export const getRecipeById = async (id: string) => {
    try {
        const response = await api.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting avatar:', error);
        throw error;
    }
};

export const getPredefinedQuestions = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/gemini/questions', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting predefined questions:', error);
        throw error;
    }
};

export const analyzeRecipe = async (recipeId: string, inputText: string) => {
    try {
        const token = await getToken();
        const response = await api.post(`/gemini/${recipeId}`,
            { inputText },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error analyzing recipe:', error);
        throw error;
    }
};