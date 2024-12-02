import {UserRound} from "lucide-react";
import {Recipe} from "../model/Recipe";
import React from "react";
import {motion} from "framer-motion";
import {getIngredientEmoji} from "../assets/ingredientEmojis";

type RecipeCardProps = {
    recipe: Recipe;
    onClick: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({recipe, onClick}) => {
    return (
        <motion.div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            whileHover={{
                scale: 1.03,
                transition: {duration: 0.2}
            }}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
        >
            <div className="relative h-48">
                <motion.img
                    whileHover={{scale: 1.1}}
                    transition={{duration: 0.3}}
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
            <motion.div
                className="p-4"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2}}
            >
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {recipe.description}
                </p>
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <motion.span
                                key={idx}
                                className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-1 text-xs"
                                whileHover={{scale: 1.1}}
                                transition={{duration: 0.2}}
                            >
                                {ingredient.name} {getIngredientEmoji(ingredient.name)}
                            </motion.span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                            <motion.span
                                className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-1 text-xs"
                                whileHover={{scale: 1.1}}
                                transition={{duration: 0.2}}
                            >
                                +{recipe.ingredients.length - 3} more
                            </motion.span>
                        )}
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <span className="mr-2">Servings: {recipe.servings}</span>
                        <div className="flex items-center">
                            {Array.from(Array(Math.min(10, recipe.servings))).map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    transition={{delay: idx * 0.1}}
                                >
                                    <UserRound size={16} className="text-gray-400 dark:text-gray-500"/>
                                </motion.div>
                            ))}
                            {recipe.servings > 10 && (
                                <span className="ml-1 text-gray-400 dark:text-gray-500">+</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RecipeCard;