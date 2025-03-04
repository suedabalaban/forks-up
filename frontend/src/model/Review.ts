import {Recipe} from "../model/Recipe";

export interface Review {
    id: string;
    recipe: Recipe
    rating: number;
    review: string;
    createdAt: string;
    user: {
        avatar: string | null;
        firebaseId: string;
        description: string;
        displayName: string;
    };
    recipeImage: string | null;
}