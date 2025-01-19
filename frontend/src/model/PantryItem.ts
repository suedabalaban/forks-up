import {Ingredient} from "./Ingredient";

export type PantryItem = {
    ingredient: Ingredient;
    quantity: number;
    measurementUnit: string;
    id: string;
}