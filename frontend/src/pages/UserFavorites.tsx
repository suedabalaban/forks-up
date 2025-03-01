import React, {useState, useEffect} from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeDetails from "../components/RecipeDetails";
import {Recipe} from "../model/Recipe";
import {Star} from "lucide-react";
import {Link, useOutletContext} from "react-router-dom";
import { getFavoriteRecipes } from "../api/RecipeAPI";

interface OutletContextType {
    onStartRecipe: (recipe: Recipe) => void;
    showRecipeDetails: boolean;
}

const UserFavorites: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const { onStartRecipe } = useOutletContext<OutletContextType>();

    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            setLoading(true);
            setError("");

            try {
                const favoriteRecipes = await getFavoriteRecipes();
                setRecipes(favoriteRecipes);
            } catch (err) {
                console.error('Error:', err);
                setError('An error occurred while fetching favorites');
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
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your favorites...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto p-5">
            <h1 className="text-4xl w-full items-center justify-center flex flex-row mt-6 font-semibold mb-2">
                <Star className="mr-3 h-10 w-10 fill-yellow-400 text-yellow-400"/>
                <span className="text-gray-900 dark:text-gray-100">Favorite Recipes</span>
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
                    <div className="text-center py-16">
                        <div className="mb-6 text-6xl">
                            🍳
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            No Favorite Recipes Yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            Start exploring delicious recipes and save your favorites to build your personal collection.
                            You can easily find them here for quick access later!
                        </p>
                        <Link 
                            to="/search" 
                            className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-300"
                        >
                            Discover Recipes
                        </Link>
                    </div>
                )}

                {selectedRecipe && (
                    <RecipeDetails
                        recipe={selectedRecipe}
                        onClose={handleClosePopup}
                        onStartRecipe={onStartRecipe}
                    />
                )}
            </div>
        </div>

    );
};

export default UserFavorites;