#!/bin/bash
set -e

echo "MongoDB'nin başlaması bekleniyor..."

# MongoDB'nin başlatıldığını kontrol eden döngü
for i in {1..30}; do
    if mongosh --quiet --eval "db.runCommand({ ping: 1 })"; then
        echo "MongoDB başlatıldı!"
        break
    fi
    echo "MongoDB başlatılmadı, bekleniyor..."
    sleep 2
done

echo "Veritabanı ve kullanıcı oluşturuluyor..."

# MongoDB komutlarını bir dosyaya yaz ve çalıştır
cat <<EOF > /docker-entrypoint-initdb.d/init.js
db = db.getSiblingDB('admin');
db.auth('sodabatuhan', 'S0DABaTuHaN');

db = db.getSiblingDB('forksupdb');
db.createUser({
  user: 'sodabatuhan',
  pwd: 'S0DABaTuHaN',
  roles: ['readWrite']
});

db.createCollection('ingredients');
db.createCollection('recipes');
EOF

mongosh /docker-entrypoint-initdb.d/init.js

echo "Veritabanı ve kullanıcı oluşturuldu, import başlıyor..."

# Import işlemleri
sleep 2

mongoimport \
    --uri "mongodb://sodabatuhan:S0DABaTuHaN@localhost:27017/forksupdb?authSource=admin" \
    --collection ingredients \
    --type json \
    --file /docker-entrypoint-initdb.d/forksupdb.ingredients.json \
    --jsonArray

mongoimport \
    --uri "mongodb://sodabatuhan:S0DABaTuHaN@localhost:27017/forksupdb?authSource=admin" \
    --collection recipes \
    --type json \
    --file /docker-entrypoint-initdb.d/forksupdb.recipes.json \
    --jsonArray

echo "Import işlemi tamamlandı, indeksler oluşturuluyor..."

# İndeks oluşturma için JavaScript dosyası hazırla
cat <<EOF > /docker-entrypoint-initdb.d/create_indexes.js
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
  { \$rename: { 'ingredient': 'name' } } 
);

// Ingredients koleksiyonunda metin indeksleri oluştur
db.ingredients.createIndex(
  { 'name': 'text' },
  { name: 'ingredientNameIndex' }
);
EOF

mongosh /docker-entrypoint-initdb.d/create_indexes.js

echo "İndeksler oluşturuldu, işlem tamamlandı."