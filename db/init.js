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
