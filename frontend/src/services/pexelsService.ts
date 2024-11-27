import axios from 'axios';

const PIXABAY_API_URL = 'https://pixabay.com/api';
const PIXABAY_API_KEY = 'YOUR_API_KEY';

export const searchFoodImage = async (recipeName: string): Promise<string | null> => {
    try {
        // Tam isimle arama
        const searchResponse = await axios.get(PIXABAY_API_URL, {
            params: {
                key: PIXABAY_API_KEY,
                q: `${recipeName} food recipe dish`,
                image_type: 'photo',
                orientation: 'horizontal',
                per_page: 3,
                category: 'food',
                safesearch: true,
                order: 'popular'
            }
        });

        if (searchResponse.data.hits && searchResponse.data.hits.length > 0) {
            // Random olarak 3 sonuçtan birini seç
            const randomIndex = Math.floor(Math.random() * Math.min(3, searchResponse.data.hits.length));
            return searchResponse.data.hits[randomIndex].webformatURL;
        }

        // Genel yemek fotoğrafı al
        const generalResponse = await axios.get(PIXABAY_API_URL, {
            params: {
                key: PIXABAY_API_KEY,
                q: 'food cooking dish recipe',
                image_type: 'photo',
                orientation: 'horizontal',
                per_page: 3,
                category: 'food',
                safesearch: true,
                order: 'popular'
            }
        });

        if (generalResponse.data.hits && generalResponse.data.hits.length > 0) {
            // Random olarak 3 sonuçtan birini seç
            const randomIndex = Math.floor(Math.random() * Math.min(3, generalResponse.data.hits.length));
            return generalResponse.data.hits[randomIndex].webformatURL;
        }

        throw new Error('No image found');
    } catch (error) {
        console.error('Error fetching image:', error);
        // Random fallback görseller
        const fallbackImages = [
            'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
            'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
            'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg',
            'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
            'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg'
        ];
        return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }
};
