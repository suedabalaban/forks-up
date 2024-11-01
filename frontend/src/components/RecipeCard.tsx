import React from 'react';

type Recipe = {
    id: string;
    name: string;
    servings: number;
    serving_size: string;
    ingredients?: string[];
    steps?: string[];
};

type RecipeCardProps = {
    recipe: Recipe;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
            <div className="text-gray-600">
                <p className="mb-1">Servings: {recipe.servings}</p>
                <p className="mb-1">Serving Size: {recipe.serving_size}</p>
                <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Ingredients: </span>
                    <span className="text-sm text-gray-600">{recipe.ingredients?.length || 0}</span>
                </div>
                <div className="mt-1">
                    <span className="text-sm font-medium text-gray-700">Steps: </span>
                    <span className="text-sm text-gray-600">{recipe.steps?.length || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;
    