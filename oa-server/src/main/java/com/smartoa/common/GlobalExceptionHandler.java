package com.smartoa.common;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class GlobalExceptionHandler {
 @ExceptionHandler(BusinessException.class) org.springframework.http.ResponseEntity<ApiResponse<Void>> business(BusinessException e){return org.springframework.http.ResponseEntity.status(e.status()).body(ApiResponse.error(e.code(),e.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(HttpStatus.BAD_REQUEST) ApiResponse<Void> validation(MethodArgumentNotValidException e){return ApiResponse.error(40001,e.getBindingResult().getFieldErrors().get(0).getDefaultMessage());}
 @ExceptionHandler(IllegalArgumentException.class) @ResponseStatus(HttpStatus.BAD_REQUEST) ApiResponse<Void> badRequest(IllegalArgumentException e){return ApiResponse.error(40000,e.getMessage());}
 @ExceptionHandler(Exception.class) @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) ApiResponse<Void> unknown(Exception e){return ApiResponse.error(50000,"系统内部错误");}
}
