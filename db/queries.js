db.recipes.countDocuments({ ingredients_refs: { $exists: true } });

// create text_index
db.recipes.createIndex({ name: "text" });

// MongoDB shell script

// 1. Önce recipes koleksiyonundan unique ingredients'ları çıkaralım
db.recipes.aggregate([
    // Ingredients array'ini tekil elemanlara ayır
    { $unwind: "$ingredients" },

    // Tekrar eden değerleri kaldır
    { $group: {
            _id: "$ingredients"
        }},

    // _id yerine ingredient field'ı olarak yeniden adlandır
    { $project: {
            _id: 0,
            ingredient: "$_id"
        }},

    // Yeni koleksiyona kaydet
    { $out: "unique_ingredients" }
])

// MongoDB shell script

// 1. Önce tüm ingredient'ları normalize eden yardımcı fonksiyon
function normalizeIngredient(ingredient) {
    return ingredient.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// 2. Tüm ingredients koleksiyonunu map olarak tutacağız
const ingredientsMap = new Map();
db.ingredients.find().forEach(ing => {
    ingredientsMap.set(normalizeIngredient(ing.ingredient), ing._id);
});

// 3. Eksik ingredient'ları tespit edip oluşturacağız
db.recipes.aggregate([
    { $unwind: "$ingredients" },
    { $group: { _id: null, allIngredients: { $addToSet: "$ingredients" } } }
]).forEach(result => {
    result.allIngredients.forEach(ing => {
        const normalizedIng = normalizeIngredient(ing);
        if (!ingredientsMap.has(normalizedIng)) {
            const newIngredient = {
                ingredient: ing,
                created_at: new Date()
            };
            const insertResult = db.ingredients.insertOne(newIngredient);
            ingredientsMap.set(normalizedIng, insertResult.insertedId);
        }
    });
});

// 4. Recipe'leri güncelleme
db.recipes.find().forEach(recipe => {
    const updatedIngredients = recipe.ingredients.map(ing => {
        const normalizedIng = normalizeIngredient(ing);
        const ingredientId = ingredientsMap.get(normalizedIng);

        if (!ingredientId) {
            print(`Warning: Could not find ingredient ${ing} in map`);
            return null;
        }

        return DBRef("ingredients", ingredientId);
    }).filter(ref => ref !== null);

    db.recipes.updateOne(
        { _id: recipe._id },
        {
            $set: {
                ingredients_refs: updatedIngredients,
                ingredients_original: recipe.ingredients // Orijinal listeyi de saklayalım
            }
        }
    );
});

// 5. Sonuçları kontrol etme
const totalRecipes = db.recipes.count();
const updatedRecipes = db.recipes.count({ ingredients_refs: { $exists: true } });
print(`Total recipes: ${totalRecipes}`);
print(`Updated recipes: ${updatedRecipes}`);