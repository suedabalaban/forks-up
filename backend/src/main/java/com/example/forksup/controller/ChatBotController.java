package com.example.forksup.controller;
import com.example.forksup.service.ChatBotService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chatbot")
public class ChatBotController {

//    private final ChatBotService chatBotService;
//
//    ChatBotController(ChatBotService chatBotService) {
//        this.chatBotService = chatBotService;
//    }
//
//    @GetMapping(value = "")
//    public Flux<String> sendMessage(HttpServletRequest request, @RequestParam(value = "message") String message) {
//        String uid = (String) request.getSession().getAttribute("uid");
//        String sessionId = request.getSession().getId();
//        return chatBotService.processRequest(message, sessionId, uid);
//    }

}
