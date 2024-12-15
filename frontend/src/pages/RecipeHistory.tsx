import React, {useState, useEffect} from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeDetails from "../components/RecipeDetails";
import {Recipe} from "../model/Recipe";
import {History} from "lucide-react";
import {getRecipeHistory} from "../api/ForksUpAPI";
import {Link, useOutletContext} from "react-router-dom";
import {RecipeHistory as RecipeHistoryType} from "../model/RecipeHistory";

interface OutletContextType {
    onStartRecipe: (recipe: Recipe) => void;
    showRecipeDetails: boolean;
}

const RecipeHistory: React.FC = () => {
    const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryType[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const { onStartRecipe } = useOutletContext<OutletContextType>();

    useEffect(() => {
        const fetchRecipeHistory = async () => {
            setLoading(true);
            setError("");

            try {
                const history = await getRecipeHistory();
                const sortedHistory = history.sort((a: RecipeHistoryType, b: RecipeHistoryType) => 
                    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                );
                setRecipeHistory(sortedHistory);
            } catch (err) {
                console.error('Error:', err);
                setError('An error occurred while fetching recipe history');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipeHistory();
    }, []);

    const handleClosePopup = () => {
        setSelectedRecipe(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your recipe history...</p>
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
                <History className="mr-3 h-10 w-10 text-purple-600 dark:text-purple-400"/>
                <span className="text-gray-900 dark:text-gray-100">Recipe History</span>
            </h1>
            <div className="container mx-auto px-4 py-8">
                {recipeHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipeHistory.map((historyItem) => (
                            <div key={`${historyItem.recipe.id}-${historyItem.startedAt}`} className="relative">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                    {formatDate(historyItem.startedAt)}
                                </div>
                                <RecipeCard
                                    recipe={historyItem.recipe}
                                    onClick={() => setSelectedRecipe(historyItem.recipe)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="mb-6 text-6xl">
                            📖
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            No Recipe History Yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                            Start cooking delicious recipes and they'll appear here in your history.
                            This makes it easy to find and remake your favorite dishes!
                        </p>
                        <Link 
                            to="/search" 
                            className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-300"
                        >
                            Find Recipes
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

export default RecipeHistory; 