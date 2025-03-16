import { api, getToken } from './ForksUpAPI';

export const getPredefinedQuestions = async (recipeId: string) => {
    try {
        const token = await getToken();
        const response = await api.post(`/gemini/questions/${recipeId}`, {
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

export const naturalLanguageSearch = async (inputText: string, page = 0, size = 9) => {
    try {
        const token = await getToken();
        const response = await api.post('/gemini/search/natural', 
            { inputText },
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error performing natural language search:', error);
        throw error;
    }
};

export const streamTextCompletion = async (input: string): Promise<string[]> => {
    try {
        const token = await getToken();
        const response = await api.get('/gemini/stream-complete', {
            headers: { Authorization: `Bearer ${token}` },
            params: { input }
        });
        return response.data;
    } catch (error) {
        console.error('Error streaming text completion:', error);
        throw error;
    }
};
