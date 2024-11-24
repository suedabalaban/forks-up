import React, {useState, useEffect} from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeDetails from "../components/RecipeDetails";
import axios from "axios";
import {auth} from "../config/firebaseconfig";
import LoadingPage from "./Loading";
import {Recipe} from "../model/Recipe";
import {Star} from "lucide-react";
import {getFavoriteRecipes} from "../api/ForksUpAPI";

const SearchRecipes: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            setLoading(true);
            setError("");

            try {
                const favoriteRecipes = await getFavoriteRecipes();
                if (Array.isArray(favoriteRecipes)) {
                    setRecipes(favoriteRecipes);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err: any) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'An error occurred while fetching favorites');
                    console.error('Error fetching favorites:', err.response?.data);
                } else {
                    setError('An unexpected error occurred');
                    console.error('Error:', err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteRecipes();
    }, []);

    const handleClosePopup = () => {
        setSelectedRecipe(null);
    };

    if (loading) {
        return (
            <LoadingPage/>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto p-5">
            <h1 className="text-4xl w-full items-center justify-center flex flex-row mt-6 font-semibold mb-2">
                <Star className="mr-3 h-10 w-10 fill-yellow-400 text-yellow-400"/>
                <span>Favorite Recipes</span>
            </h1>
            <div className="container mx-auto px-4 py-8">
                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={() => setSelectedRecipe(recipe)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-4">
                        No favorite recipes found.
                    </div>
                )}

                {selectedRecipe && (
                    <RecipeDetails
                        recipe={selectedRecipe}
                        handleClosePopup={handleClosePopup}
                    />
                )}
            </div>
        </div>

    );
};

export default SearchRecipes;