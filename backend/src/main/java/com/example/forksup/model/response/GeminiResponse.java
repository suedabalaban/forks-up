package com.example.forksup.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiResponse {
    private String response;
    private Map<String, Object> functionCall; // For function calls

    // Constructor for text responses
    public GeminiResponse(String response) {
        this.response = response;
    }
    // Constructor for function calls
    public GeminiResponse(Map<String, Object> functionCall) {
        this.functionCall = functionCall;
    }

    public String getResponse() {return response;}
    public void setResponse(String response) {this.response = response;}

    public Map<String, Object> getFunctionCall() {
        return functionCall;
    }

    // Check if the response is a function call
    public boolean isFunctionCall() {
        return functionCall != null;
    }
}
