package com.example.forksup.implement;

import com.example.forksup.model.Recipe;
import com.example.forksup.repository.CustomRecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CustomRecipeRepositoryImpl implements CustomRecipeRepository {
    private final MongoTemplate mongoTemplate;

    @Autowired
    public CustomRecipeRepositoryImpl(MongoTemplate mongoTemplate){
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Recipe> findByNameRegex(String keyword, Pageable pageable){
        Query query = new Query();
        query.addCriteria(Criteria.where("name").regex(keyword, "i"));
        query.with(pageable);
        List<Recipe> recipes = mongoTemplate.find(query, Recipe.class);
        return recipes;
    }

}
