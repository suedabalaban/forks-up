import {UserRound, Clock} from "lucide-react";
import {Recipe} from "../model/Recipe";
import {motion} from "framer-motion";
import {getIngredientEmoji} from "../assets/ingredientEmojis";
import {usePexelsImage} from "../hooks/usePexelsImage";
import {getCountryFlagFromTags} from "../utils/countryFlags";
import {getPreparationTimeFromTags} from "../utils/preparationTime";
import { usePantry } from '../context/PantryContext';

type RecipeCardProps = {
    recipe: Recipe;
    onClick: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({recipe, onClick}) => {
    const { pantryIngredients } = usePantry();
    const fallbackImage = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
    const { imageUrl, loading } = usePexelsImage(recipe.name, recipe.imageUrl || fallbackImage);

    // Helper function to check if ingredient exists in pantry
    const isIngredientInPantry = (ingredientName: string) => {
        return pantryIngredients.some(pantryItem =>
            ingredientName.toLowerCase().includes(pantryItem) || pantryItem.includes(ingredientName.toLowerCase())
        );
    };

    // Sort ingredients to show pantry items first
    const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
        const aInPantry = isIngredientInPantry(a.name);
        const bInPantry = isIngredientInPantry(b.name);
        return bInPantry ? 1 : aInPantry ? -1 : 0;
    });

    return (
        <motion.div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-0"
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
                    src={imageUrl}
                    alt={recipe.name}
                    className={`w-full h-full object-cover ${loading ? 'animate-pulse' : ''}`}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white mb-1">{recipe.name}</h3>
                        </div>
                    </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm text-2xl border border-white/10 hover:bg-black/40 transition-colors">
                        {getCountryFlagFromTags(recipe.tags)}
                    </span>
                </div>

                {getPreparationTimeFromTags(recipe.tags) && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-sm text-white text-sm font-medium border border-white/10 hover:bg-black/40 transition-colors">
                            <Clock size={16} className="text-amber-400" />
                            {getPreparationTimeFromTags(recipe.tags)}
                        </span>
                    </div>
                )}
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
                    <div className="flex flex-wrap gap-2">
                        {sortedIngredients.slice(0, 3).map((ingredient, index) => {
                            const inPantry = isIngredientInPantry(ingredient.name);
                            return (
                                <motion.span
                                    key={index}
                                    className={`inline-flex items-center gap-1 ${
                                        inPantry 
                                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                                            : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
                                    } rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5`}
                                    whileHover={{scale: 1.05}}
                                >
                                    {getIngredientEmoji(ingredient.name)} {ingredient.name}
                                </motion.span>
                            );
                        })}
                        {recipe.ingredients.length > 3 && (
                            <span
                                className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                            +{recipe.ingredients.length - 3} more
                        </span>
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