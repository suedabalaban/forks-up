db = db.getSiblingDB('forksupdb');
db.auth('sodabatuhan', 'S0DABaTuHaN');

// Recipes koleksiyonunda metin indeksleri oluştur
db.recipes.createIndex(
  {
    'name': 'text',
    'tags': 'text',
    'search_terms': 'text',
    'ingredients_raw_str': 'text'
  },
  {
    weights: {
      name: 3,
      search_terms: 5,
      tags: 8,
      ingredients_raw_str: 4
    },
    name: 'recipeTextIndex'
  }
);

// Ingredients koleksiyonunda gerekli güncellemeleri yap
db.ingredients.updateMany(
  {},
  { $rename: { 'ingredient': 'name' } } 
);

// Ingredients koleksiyonunda metin indeksleri oluştur
db.ingredients.createIndex(
  { 'name': 'text' },
  { name: 'ingredientNameIndex' }
);
