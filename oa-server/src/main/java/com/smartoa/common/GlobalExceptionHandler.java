package com.smartoa.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice 
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class) 
    public ResponseEntity<ApiResponse<Void>> business(BusinessException e) {
        return ResponseEntity.status(e.status()).body(ApiResponse.error(e.code(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class) 
    @ResponseStatus(HttpStatus.BAD_REQUEST) 
    public ApiResponse<Void> validation(MethodArgumentNotValidException e) {
        return ApiResponse.error(40001, e.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class) 
    @ResponseStatus(HttpStatus.BAD_REQUEST) 
    public ApiResponse<Void> badRequest(IllegalArgumentException e) {
        return ApiResponse.error(40000, e.getMessage());
    }

    // 捕获 Spring Security 6.x 权限拒绝异常
    @ExceptionHandler(AuthorizationDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAuthorizationDenied(AuthorizationDeniedException e) {
        return ApiResponse.error(40300, "权限不足，拒绝访问");
    }

    // 捕获传统 Spring Security 权限拒绝异常
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAccessDenied(AccessDeniedException e) {
        return ApiResponse.error(40300, "权限不足，拒绝访问");
    }

    @ExceptionHandler(Exception.class) 
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) 
    public ApiResponse<Void> unknown(Exception e) {
        return ApiResponse.error(50000, "系统内部错误");
    }
}