import { api, getToken } from './ForksUpAPI';

export const getPantryItems = async () => {
    try {
        const token = await getToken();
        return await api.get(`/pantry`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error fetching pantry items:', error);
        throw error;
    }
};

export const addIngredient = async (ingredientId: string, quantity: number, unit: string) => {
    try {
        const token = await getToken();
        return await api.post('/pantry', null, {
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
        return await api.put(`/pantry/${ingredientId}`, null, {
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
        return await api.delete(`/pantry/${ingredientId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error removing ingredient:', error);
        throw error;
    }
};
