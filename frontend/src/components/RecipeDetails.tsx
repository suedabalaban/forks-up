import React, { useState, useEffect } from "react";
import { Close } from "@mui/icons-material";
import { Star, UserRound, Users } from "lucide-react";
import { auth } from "../config/firebaseconfig";
import axios from "axios";
import { Recipe } from "../model/Recipe";
import {addFavorite, checkFavoriteStatus, removeFavorite} from "../api/ForksUpAPI";
import { getIngredientEmoji } from "../assets/ingredientEmojis";

type RecipeDetailsProps = {
    recipe: Recipe;
    handleClosePopup: () => void;
};

type YouTubeVideo = {
    id: string;
    title: string;
    thumbnail: string;
};

const RecipeDetails: React.FC<RecipeDetailsProps> = ({recipe, handleClosePopup}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const YOUTUBE_API_KEY = 'AIzaSyAOJIp4JcDsW--0SKq5pDhgrPG19DdcO30';

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favoriteStatus = await checkFavoriteStatus(recipe.id);
                setIsFavorite(favoriteStatus);
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };

        fetchFavoriteStatus();

        // YouTube search effect
        const fetchYouTubeVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `https://www.googleapis.com/youtube/v3/search`,
                    {
                        params: {
                            part: 'snippet',
                            maxResults: 3,
                            q: `${recipe.name} recipe how to cook`,
                            type: 'video',
                            key: YOUTUBE_API_KEY
                        }
                    }
                );

                const videoResults = response.data.items.map((item: any) => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium.url
                }));

                setVideos(videoResults);
            } catch (err) {
                setError('Failed to load YouTube videos');
                console.error('YouTube API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchYouTubeVideos();
    }, [recipe.id, recipe.name]);

    const toggleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFavorite(recipe.id);
            } else {
                await addFavorite(recipe.id);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };

    return (
        <div
            onClick={handleClosePopup}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-full min-w-[50rem] mx-4 max-h-[80vh] flex flex-row overflow-y-auto relative"
            >
                <div className="min-w-[50rem] w-min">
                    <button onClick={handleClosePopup}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                        <Close/>
                    </button>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        {recipe.name}
                        <button
                            onClick={toggleFavorite}
                            className="flex items-center justify-center transition-all duration-200 focus:outline-none ml-2"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Star
                                className={`
                                transition-colors duration-200 h-full
                                ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}
                            `}
                            />
                        </button>
                    </h3>
                    <p className="text-m text-gray-500 mb-3">
                        {recipe.description}
                    </p>
                    <div className="flex flex-row mb-3">
                        <p className="mr-1 font-semibold">Servings: {recipe.servings}</p>
                        {Array.from(Array(recipe.servings % 2 === 1 ? (recipe.servings - 1) / 2 : recipe.servings / 2), (e, i) => {
                            return <Users key={i}/>;
                        })}
                        {
                            recipe.servings % 2 === 1 && <UserRound/>
                        }
                    </div>
                    <p className="font-semibold">Serving Size: {recipe.serving_size.slice(2)}</p>
                    <div className="mt-2">
                        <h4 className="font-semibold text-gray-700">🥘 Ingredients</h4>
                        <ul className="space-y-1">
                            {recipe.ingredientsRawStr?.map((ingredient, index) => {
                                const emoji = getIngredientEmoji(ingredient);
                                return (
                                    <li key={index} className="text-gray-600 flex items-center gap-2">
                                        <span className="w-6 text-center">{emoji || '•'}</span>
                                        {ingredient}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="mb-5 mt-4">
                        <h4 className="font-medium text-gray-700">Steps</h4>
                        <ol>
                            {recipe.steps?.map((step, index) => (
                                <li key={index}
                                    className="text-gray-600 flex flex-row">{(index + 1) + " - " + step + "\n"}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Youtube Thumbnails*/}
                <div className="mt-4 ml-2 w-96 pl-6 border-l">
                    <h4 className="font-semibold text-gray-700 mb-4">Related Videos</h4>
                    {loading && <p className="text-gray-600">Loading videos...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="space-y-4">
                        {videos.map((video) => (
                            <div key={video.id} className="group">
                                <a
                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <div className="relative">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full rounded-lg shadow-md transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
                                    </div>
                                    <h5 className="mt-2 text-sm text-gray-800 font-medium line-clamp-2">
                                        {video.title}
                                    </h5>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;