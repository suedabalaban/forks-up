package com.example.forksup.implement;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.CustomRecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CustomRecipeRepositoryImpl implements CustomRecipeRepository {
    private final MongoTemplate mongoTemplate;
    private static final int MAX_RESULTS = 10;

    @Autowired
    public CustomRecipeRepositoryImpl(MongoTemplate mongoTemplate){
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Recipe> findByNameRegex(String keyword){
        Query query = new Query();
        query.addCriteria(Criteria.where("name")
                .regex(keyword, "i"));
        query.limit(MAX_RESULTS);
        return mongoTemplate.find(query, Recipe.class);
    }
}
