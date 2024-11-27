import {UserRound, Users} from "lucide-react";
import {Recipe} from "../model/Recipe";
import React from "react";
import { getIngredientEmoji } from "../assets/ingredientEmojis";

type RecipeCardProps = {
    recipe: Recipe;
    onClick: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48">
                <img
                    src={recipe.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-semibold text-white mb-1">{recipe.name}</h3>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {recipe.description}
                </p>
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <span key={idx} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
                                {ingredient.name} {getIngredientEmoji(ingredient.name)}
                            </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                            <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
                                +{recipe.ingredients.length - 3} more
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                        <span className="mr-2">Servings: {recipe.servings}</span>
                        <div className="flex">
                            {Array.from(Array(recipe.servings % 2 === 1 ? (recipe.servings - 1) / 2 : recipe.servings / 2), (e, i) => (
                                <Users key={i} size={16} className="text-gray-500"/>
                            ))}
                            {recipe.servings % 2 === 1 && <UserRound size={16} className="text-gray-500"/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;