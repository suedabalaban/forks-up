import {Ingredient} from "./Ingredient";

export type Recipe = {
    id: string;
    name: string;
    servings: number;
    serving_size: string;
    ingredients: Ingredient[];
    ingredientsRawStr?: string[];
    steps: string[];
    description: string;
    imageUrl?: string;
    tags: string[];
    searchTerms: string[];
};
