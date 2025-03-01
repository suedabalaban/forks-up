import { api, getToken } from './ForksUpAPI';

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
        const response = await api.post(`/gemini/${recipeId}`, { inputText }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing recipe:', error);
        throw error;
    }
};
