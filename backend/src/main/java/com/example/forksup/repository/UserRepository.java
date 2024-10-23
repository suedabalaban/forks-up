package com.example.forksup.repository;

import com.example.forksup.model.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, ObjectId> {
    Optional<User> findUserByFirebaseId(String firebaseId);
}