package com.example.forksup.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;

import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class LoggingInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Request'i wrap ediyoruz ki body'yi okuyabilelim
        if (!(request instanceof ContentCachingRequestWrapper)) {
            request = new ContentCachingRequestWrapper(request);
        }

        // Response'u wrap ediyoruz ki içeriğini okuyabilelim
        if (!(response instanceof ContentCachingResponseWrapper)) {
            response = new ContentCachingResponseWrapper(response);
        }

        String url = request.getRequestURI();
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            url = url + "?" + queryString;
        }
        String httpMethod = request.getMethod();

        // Request parametrelerini topluyoruz
        Map<String, Object> requestParams = new HashMap<>();

        // Query parametreleri
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String[] paramValues = request.getParameterValues(paramName);
            if (paramValues.length == 1) {
                requestParams.put(paramName, paramValues[0]);
            } else {
                requestParams.put(paramName, paramValues);
            }
        }

        // Request body (POST, PUT vb. için)
        String requestBody = getRequestBody(request);
        if (requestBody != null && !requestBody.isEmpty()) {
            requestParams.put("requestBody", requestBody);
        }

        // Header bilgileri (isteğe bağlı)
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            // Sensitive header'ları filtreliyoruz
            if (!headerName.toLowerCase().contains("authorization") &&
                    !headerName.toLowerCase().contains("cookie")) {
                headers.put(headerName, request.getHeader(headerName));
            }
        }

        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String methodName = handlerMethod.getMethod().getName();

            // Metot parametrelerini alıyoruz
            Map<String, Object> methodParams = getMethodParameters(handlerMethod, request);

            Logger controllerLogger = LoggerFactory.getLogger(handlerMethod.getBeanType());

            StringBuilder logMessage = new StringBuilder();
            logMessage.append(httpMethod).append(" ").append(url)
                    .append(" (method: ").append(methodName).append(")");

            if (!requestParams.isEmpty()) {
                logMessage.append(" - Parameters: ").append(formatJson(requestParams));
            }

            if (!methodParams.isEmpty()) {
                logMessage.append(" - MethodParams: ").append(formatJson(methodParams));
            }

            controllerLogger.info(logMessage.toString());
        } else {
            StringBuilder logMessage = new StringBuilder();
            logMessage.append(httpMethod).append(" ").append(url);

            if (!requestParams.isEmpty()) {
                logMessage.append(" - Parameters: ").append(formatJson(requestParams));
            }

            logger.info(logMessage.toString());
        }

        // Request'i context'e kaydediyoruz ki postHandle'da kullanabilelim
        request.setAttribute("startTime", System.currentTimeMillis());
        request.setAttribute("handler", handler);

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) throws Exception {

        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        String url = request.getRequestURI();
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            url = url + "?" + queryString;
        }

        // Response body'yi alıyoruz
        String responseBody = getResponseBody(response);
        int statusCode = response.getStatus();

        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String methodName = handlerMethod.getMethod().getName();

            Logger controllerLogger = LoggerFactory.getLogger(handlerMethod.getBeanType());

            StringBuilder logMessage = new StringBuilder();
            logMessage.append("RESPONSE - ").append(request.getMethod()).append(" ").append(url)
                    .append(" (method: ").append(methodName).append(")")
                    .append(" - Status: ").append(statusCode)
                    .append(" - Time: ").append(executionTime).append("ms");

            if (responseBody != null && !responseBody.isEmpty()) {
                // Response body'yi JSON formatında pretty print ile loglamak için
                try {
                    Object jsonObject = objectMapper.readValue(responseBody, Object.class);
                    String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
                    logMessage.append(" - Response: ").append(prettyJson);
                } catch (Exception e) {
                    // JSON parse edilemezse normal string olarak logla
                    logMessage.append(" - Response: ").append(responseBody);
                }
            }

            controllerLogger.info(logMessage.toString());
        } else {
            StringBuilder logMessage = new StringBuilder();
            logMessage.append("RESPONSE - ").append(request.getMethod()).append(" ").append(url)
                    .append(" - Status: ").append(statusCode)
                    .append(" - Time: ").append(executionTime).append("ms");

            if (responseBody != null && !responseBody.isEmpty()) {
                try {
                    Object jsonObject = objectMapper.readValue(responseBody, Object.class);
                    String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject);
                    logMessage.append(" - Response: ").append(prettyJson);
                } catch (Exception e) {
                    logMessage.append(" - Response: ").append(responseBody);
                }
            }

            logger.info(logMessage.toString());
        }

        // Response wrapper'ı kullanıyorsak, içeriği geri yazmalıyız
        if (response instanceof ContentCachingResponseWrapper) {
            ((ContentCachingResponseWrapper) response).copyBodyToResponse();
        }
    }

    private String getRequestBody(HttpServletRequest request) {
        if (request instanceof ContentCachingRequestWrapper) {
            ContentCachingRequestWrapper wrapper = (ContentCachingRequestWrapper) request;
            byte[] body = wrapper.getContentAsByteArray();
            if (body.length > 0) {
                return new String(body, StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private String getResponseBody(HttpServletResponse response) {
        if (response instanceof ContentCachingResponseWrapper) {
            ContentCachingResponseWrapper wrapper = (ContentCachingResponseWrapper) response;
            byte[] body = wrapper.getContentAsByteArray();
            if (body.length > 0) {
                return new String(body, StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private String formatJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }

    private Map<String, Object> getMethodParameters(HandlerMethod handlerMethod, HttpServletRequest request) {
        Map<String, Object> methodParams = new HashMap<>();

        try {
            Method method = handlerMethod.getMethod();
            Parameter[] parameters = method.getParameters();
            String[] parameterNames = parameterNameDiscoverer.getParameterNames(method);

            if (parameterNames != null) {
                for (int i = 0; i < parameters.length; i++) {
                    Parameter parameter = parameters[i];
                    String paramName = parameterNames[i];
                    String paramType = parameter.getType().getSimpleName();

                    // Parametre değerini request'ten almaya çalışıyoruz
                    Object paramValue = getParameterValue(parameter, paramName, request);

                    Map<String, Object> paramInfo = new HashMap<>();
                    paramInfo.put("type", paramType);
                    paramInfo.put("value", paramValue);

                    methodParams.put(paramName, paramInfo);
                }
            }
        } catch (Exception e) {
            logger.debug("Error getting method parameters: " + e.getMessage());
        }

        return methodParams;
    }

    private Object getParameterValue(Parameter parameter, String paramName, HttpServletRequest request) {
        Class<?> paramType = parameter.getType();

        // HttpServletRequest, HttpServletResponse gibi servlet objeleri
        if (paramType == HttpServletRequest.class) {
            return "HttpServletRequest";
        } else if (paramType == HttpServletResponse.class) {
            return "HttpServletResponse";
        }

        // @RequestParam, @PathVariable gibi annotasyonlara bakıyoruz
        if (parameter.isAnnotationPresent(org.springframework.web.bind.annotation.RequestParam.class)) {
            org.springframework.web.bind.annotation.RequestParam requestParam =
                    parameter.getAnnotation(org.springframework.web.bind.annotation.RequestParam.class);
            String actualParamName = requestParam.value().isEmpty() ? paramName : requestParam.value();
            return request.getParameter(actualParamName);
        }

        if (parameter.isAnnotationPresent(org.springframework.web.bind.annotation.PathVariable.class)) {
            org.springframework.web.bind.annotation.PathVariable pathVariable =
                    parameter.getAnnotation(org.springframework.web.bind.annotation.PathVariable.class);
            String actualParamName = pathVariable.value().isEmpty() ? paramName : pathVariable.value();

            // Path variable değerini URI'den çıkarmaya çalışıyoruz
            String uri = request.getRequestURI();
            // Bu basit bir yaklaşım, gerçek path variable extraction daha karmaşık olabilir
            return "PathVariable(" + actualParamName + ")";
        }

        // @RequestBody parametreleri
        if (parameter.isAnnotationPresent(org.springframework.web.bind.annotation.RequestBody.class)) {
            return "RequestBody(" + paramType.getSimpleName() + ")";
        }

        // Model, Pageable vb. Spring objeleri
        if (paramType.getName().startsWith("org.springframework")) {
            return paramType.getSimpleName();
        }

        // Custom objeler
        if (!paramType.isPrimitive() && !paramType.getName().startsWith("java.lang")) {
            return "CustomObject(" + paramType.getSimpleName() + ")";
        }

        // Normal parametreler
        return request.getParameter(paramName);
    }
}