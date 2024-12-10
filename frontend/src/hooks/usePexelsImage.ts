import { useState, useEffect } from 'react';

const PEXELS_API_KEY = 'wsIcM3r7pJGITcaTUYpEdpgDg2WqsRjOPC5VeGXsbrsBkPCHrznxjK0l'; // Replace with your actual Pexels API key

const getRandomImage = (photos: any[]): string => {
    if (photos.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * photos.length);
    return photos[randomIndex].src.large;
};

export const usePexelsImage = (searchQuery: string, fallbackUrl: string) => {
    const [imageUrl, setImageUrl] = useState<string>(fallbackUrl);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            if (!searchQuery) {
                setImageUrl(fallbackUrl);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery + " food")}&per_page=3`,
                    {
                        headers: {
                            Authorization: PEXELS_API_KEY,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch image');
                }

                const data = await response.json();
                
                if (data.photos && data.photos.length > 0) {
                    const selectedImageUrl = getRandomImage(data.photos);
                    setImageUrl(selectedImageUrl || fallbackUrl);
                } else {
                    setImageUrl(fallbackUrl);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setImageUrl(fallbackUrl);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [searchQuery, fallbackUrl]);

    return { imageUrl, loading, error };
};
