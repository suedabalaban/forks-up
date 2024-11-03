import React, {useState, useEffect} from "react";
import RecipeCard from "../components/RecipeCard";
import RecipeDetails from "../components/RecipeDetails";
import axios from "axios";
import {auth} from "../config/firebaseconfig";
import LoadingPage from "./Loading";

type Recipe = {
    id: string;
    name: string;
    servings: number;
    serving_size: string;
    ingredients?: string[];
    ingredientsRawStr?: string[];
    steps?: string[];
    description: string;
};

const SearchRecipes: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            setLoading(true);
            auth.currentUser?.getIdToken().then((token: any) => {
                axios.get(
                    'http://localhost:8080/api/user/favorite/all',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                ).then((response) => {
                    if (response.data && Array.isArray(response.data)) {
                        setRecipes(response.data);
                    }
                }).catch((err) => {
                    if (axios.isAxiosError(err)) {
                        setError(err.response?.data?.message || "An error occurred while fetching favorites");
                        console.error("Error fetching favorites:", err.response?.data);
                    } else {
                        setError("An unexpected error occurred");
                        console.error("Error:", err);
                    }
                }).finally(() => {
                    setLoading(false);
                });
            })
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
    );
};

export default SearchRecipes;