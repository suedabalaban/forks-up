import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RecipeDetails from '../components/RecipeDetails';
import { getRecipeById } from '../api/ForksUpAPI';
import Loading from './Loading';
import {Recipe} from "../model/Recipe";

const SharedRecipe: React.FC = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<Recipe>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const recipeData = await getRecipeById(id!);
                setRecipe(recipeData);
                console.log(recipe)
            } catch (err) {
                setError('Recipe not found');
                console.error('Error fetching recipe:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    if (loading) return <Loading />;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!recipe) return <div className="text-center p-8">Recipe not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <RecipeDetails 
                recipe={recipe}
                isFullScreen={true}
                onClose={() => {}}
            />
        </div>
    );
};

export default SharedRecipe;
