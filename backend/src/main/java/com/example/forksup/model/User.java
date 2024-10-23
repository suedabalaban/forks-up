package com.example.forksup.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;


import java.util.List;

@Document(collection = "user")
public class User {

    @Id
    private ObjectId id;
    @Field("firebase_id")
    private String firebase_id;
    @Field("ingredients")
    private Ingredients ingredients;
    @Field("preferences")
    private Preferences preferences;

    public ObjectId get_id() {
        return id;
    }

    public void set_id(ObjectId id) {
        this.id = id;
    }

    public String getFirebase_id() {
        return firebase_id;
    }

    public void setFirebase_id(String firebase_id) {
        this.firebase_id = firebase_id;
    }

    public Ingredients getIngredients() {
        return ingredients;
    }

    public void setIngredients(Ingredients ingredients) {
        this.ingredients = ingredients;
    }

    public Preferences getPreferences() {
        return preferences;
    }

    public void setPreferences(Preferences preferences) {
        this.preferences = preferences;
    }

    public static class Ingredients {
        private Proteins proteins;

        public Proteins getProteins() {
            return proteins;
        }

        public void setProteins(Proteins proteins) {
            this.proteins = proteins;
        }

        public static class Proteins {
            private Meat meat;
            private List<String> vegetables;
            private List<String> fruits;
            private List<String> grains;
            private List<String> dairy;

            public Meat getMeat() {
                return meat;
            }

            public void setMeat(Meat meat) {
                this.meat = meat;
            }

            public List<String> getVegetables() {
                return vegetables;
            }

            public void setVegetables(List<String> vegetables) {
                this.vegetables = vegetables;
            }

            public List<String> getFruits() {
                return fruits;
            }

            public void setFruits(List<String> fruits) {
                this.fruits = fruits;
            }

            public List<String> getGrains() {
                return grains;
            }

            public void setGrains(List<String> grains) {
                this.grains = grains;
            }

            public List<String> getDairy() {
                return dairy;
            }

            public void setDairy(List<String> dairy) {
                this.dairy = dairy;
            }

            public static class Meat {
                private List<String> beef;
                private List<String> pork;
                private List<String> poultry;
                private List<String> game;

                // Getters and Setters
                public List<String> getBeef() {
                    return beef;
                }

                public void setBeef(List<String> beef) {
                    this.beef = beef;
                }

                public List<String> getPork() {
                    return pork;
                }

                public void setPork(List<String> pork) {
                    this.pork = pork;
                }

                public List<String> getPoultry() {
                    return poultry;
                }

                public void setPoultry(List<String> poultry) {
                    this.poultry = poultry;
                }

                public List<String> getGame() {
                    return game;
                }

                public void setGame(List<String> game) {
                    this.game = game;
                }
            }
        }
    }

    public static class Preferences {
        private DietaryRestrictions dietary_restrictions;
        private List<String> cuisines;
        private String preparation_time;

        public DietaryRestrictions getDietary_restrictions() {
            return dietary_restrictions;
        }

        public void setDietary_restrictions(DietaryRestrictions dietary_restrictions) {
            this.dietary_restrictions = dietary_restrictions;
        }

        public List<String> getCuisines() {
            return cuisines;
        }

        public void setCuisines(List<String> cuisines) {
            this.cuisines = cuisines;
        }

        public String getPreparation_time() {
            return preparation_time;
        }

        public void setPreparation_time(String preparation_time) {
            this.preparation_time = preparation_time;
        }

        public static class DietaryRestrictions {
            private List<String> health_conscious;
            private List<String> allergies_intolerances;
            private List<String> lifestyle;

            public List<String> getHealth_conscious() {
                return health_conscious;
            }

            public void setHealth_conscious(List<String> health_conscious) {
                this.health_conscious = health_conscious;
            }

            public List<String> getAllergies_intolerances() {
                return allergies_intolerances;
            }

            public void setAllergies_intolerances(List<String> allergies_intolerances) {
                this.allergies_intolerances = allergies_intolerances;
            }

            public List<String> getLifestyle() {
                return lifestyle;
            }

            public void setLifestyle(List<String> lifestyle) {
                this.lifestyle = lifestyle;
            }
        }
    }
}