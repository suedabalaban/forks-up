package com.example.forksup.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatBotResponse {

    @JsonProperty
    public String function;

    @JsonProperty
    public String[] args;

    @JsonProperty
    public String message;

    public ChatBotResponse(String function, String[] args, String message) {
        this.function = function;
        this.args = args;
        this.message = message;
    }

}
