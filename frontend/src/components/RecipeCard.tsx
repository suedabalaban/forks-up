import {UserRound, Users} from "lucide-react";

type Recipe = {
    id: Object;
    name: string;
    servings: number;
    serving_size: string;
    ingredients?: string[];
    ingredientsRawStr?: string[];
    steps?: string[];
    description: string;
};

type RecipeCardProps = {
    recipe: Recipe;
    onClick: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-row">
                <h3 className="grow text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-3">
                {recipe.description}
            </p>
            <div className="text-gray-600">
                <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Ingredients: </span>
                    <span
                        className="text-sm text-gray-600">
                        {recipe.ingredients?.map((ingredient) => (ingredient + " | "))}
                    </span>
                </div>
                <p className="mb-1 flex flex-row mt-2">
                    <p className="mr-1">Servings: {recipe.servings}</p>
                    {Array.from(Array(recipe.servings % 2 === 1 ? (recipe.servings - 1) / 2 : recipe.servings / 2), (e, i) => {
                        return <Users key={i}/>;
                    })}
                    {
                        recipe.servings % 2 === 1 && <UserRound/>
                    }
                </p>
            </div>
        </div>
    );
};

export default RecipeCard;