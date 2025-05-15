package com.example.forksup.interceptor;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;


@Component
public class LoggingInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String url = request.getRequestURI();

        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            url = url + "?" + queryString;
        }
        String httpMethod = request.getMethod();

        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;

            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();

            Logger controllerLogger = LoggerFactory.getLogger(handlerMethod.getBeanType());
            controllerLogger.info(httpMethod + " " + url + " (method: " + methodName + ")");
        } else {
            logger.info(httpMethod + " " + url);
        }

        return true;
    }
}
