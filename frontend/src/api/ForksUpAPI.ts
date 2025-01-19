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

//
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

//
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

//
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

//
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

//
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
        // API'den gelen veri null veya undefined ise boş array dön
        return response.data || [];
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        // Hata durumunda boş array dön
        return [];
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

//
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

// Gemini API - Diyet kısıtlamalarını kontrol et
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

// Gemini API - Tarif adımlarını analiz et
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

// Tarif geçmişini getir
export const getRecipeHistory = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/recipeHistory/all', {
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

// Tarif geçmişine ekle
export const addToRecipeHistory = async (recipeId: string) => {
    try {
        const token = await getToken();
        await api.post(`/user/recipeHistory/${recipeId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error adding to recipe history:', error);
        throw error;
    }
};

// Tarif geçmişinden kaldır
export const removeFromRecipeHistory = async (recipeId: string) => {
    try {
        const token = await getToken();
        await api.delete(`/user/recipeHistory/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error removing from recipe history:', error);
        throw error;
    }
};

// Tarif yapıldıktan sonra malzeme miktarlarını güncelle
export const updatePantryAfterRecipe = async (ingredientIds: string[]) => {
    try {
        const token = await getToken();
        const response = await api.put('/user/recipeHistory/update', null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                ingredientIds: ingredientIds
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating pantry after recipe:', error);
        throw error;
    }
};

// Son tarif geçmişini getir
export const getLastRecipeHistory = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/recipeHistory/last', {
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