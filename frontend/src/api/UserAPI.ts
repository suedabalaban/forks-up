import { api, getToken } from './ForksUpAPI';

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

export const registerOrUpdateUser = async (user: any) => {
    try {
        if (!user) return;

        const isFirstLogin = !localStorage.getItem(`userRegistered_${user.uid}`);
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

        if (isNewUser || isFirstLogin) {
            const token = await getToken();
            await api.put('/user', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            localStorage.setItem(`userRegistered_${user.uid}`, 'true');
        }
    } catch (error) {
        console.error('Error registering user:', error);
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
                Authorization: `Bearer ${token}`,
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
                Authorization: `Bearer ${token}`,
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
                Authorization: `Bearer ${token}`,
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
        const response = await api.post('/user/description', { description }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating description:', error);
        throw error;
    }
};

export const getUserPreferences = async () => {
    try {
        const token = await getToken();
        const response = await api.get('/user/preferences', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving user preferences:', error);
        throw error;
    }
};

export const addUserPreferences = async (preferences: any) => {
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
};
