package com.example.forksup.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class AppExceptionHandler {

    @ExceptionHandler(value = {NoHandlerFoundException.class, ResourceNotFoundException.class})
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public void handlerNotFound(HttpServletRequest request, Exception e) {
        e.printStackTrace();
    }


    @ExceptionHandler(value = RuntimeException.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public void handleInternalServerError(HttpServletRequest request, Exception e) {
        e.printStackTrace();
    }

}