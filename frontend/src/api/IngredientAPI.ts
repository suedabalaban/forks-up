import { api, getToken } from './ForksUpAPI';

export const getIngredients = async (searchQuery: string) => {
    try {
        const token = await getToken();
        return await api.get(`/ingredients/search`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { keyword: searchQuery }
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
    }
};
