import React, { useState, useEffect } from "react";
import { Close } from "@mui/icons-material";
import { Star, UserRound, Users } from "lucide-react";
import { auth } from "../config/firebaseconfig";
import axios from "axios";
import {Recipe} from "../model/Recipe";

type RecipeDetailsProps = {
    recipe: Recipe;
    handleClosePopup: () => void;
};

const RecipeDetails: React.FC<RecipeDetailsProps> = ({recipe, handleClosePopup}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    useEffect(() => {
        auth.currentUser?.getIdToken().then((token) => {
            axios.get(`http://localhost:8080/api/user/favorite/${recipe.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then((response) => {
                    setIsFavorite(response.data);
                })
                .catch((e) => {
                    console.error("Error checking favorite status:", e);
                });
        });
    }, [recipe.id]);

    const toggleFavorite = () => {
        if (isFavorite) {
            auth.currentUser?.getIdToken().then((token) => {
                axios.delete(`http://localhost:8080/api/user/favorite/${recipe.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).catch((e) => {
                    console.error(e);
                });
            });
        } else {
            auth.currentUser?.getIdToken().then((token) => {
                axios.put(`http://localhost:8080/api/user/favorite/${recipe.id}`, null, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).catch((e) => {
                    console.error(e);
                });
            });
        }
        setIsFavorite(!isFavorite);
    };

    return (
        <div
            onClick={handleClosePopup}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto relative"
            >
                <button onClick={handleClosePopup} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <Close/>
                </button>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    {recipe.name}
                    <button
                        onClick={toggleFavorite}
                        className="flex items-center justify-center transition-all duration-200 focus:outline-none ml-2"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Star
                            className={`
                                transition-colors duration-200 h-full
                                ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}
                            `}
                        />
                    </button>
                </h3>
                <p className="text-m text-gray-500 mb-3">
                    {recipe.description}
                </p>
                <div className="flex flex-row mb-3">
                    <p className="mr-1 font-semibold">Servings: {recipe.servings}</p>
                    {Array.from(Array(recipe.servings % 2 === 1 ? (recipe.servings - 1) / 2 : recipe.servings / 2), (e, i) => {
                        return <Users key={i}/>;
                    })}
                    {
                        recipe.servings % 2 === 1 && <UserRound/>
                    }
                </div>
                <p className="font-semibold">Serving Size: {recipe.serving_size.slice(2)}</p>
                <div className="mt-2">
                    <h4 className="font-semibold text-gray-700">Ingredients</h4>
                    <ul>
                        {recipe.ingredientsRawStr?.map((ingredient, index) => (
                            <li key={index} className="text-gray-600">{ingredient}</li>
                        ))}
                    </ul>
                </div>
                <div className="mt-4">
                    <h4 className="font-medium text-gray-700">Steps</h4>
                    <ol>
                        {recipe.steps?.map((step, index) => (
                            <li key={index}
                                className="text-gray-600 flex flex-row">{(index + 1) + " - " + step + "\n"}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;