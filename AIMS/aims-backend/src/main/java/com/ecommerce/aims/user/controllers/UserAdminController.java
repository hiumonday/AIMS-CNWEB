//package com.ecommerce.aims.user.controllers;
//
//import com.ecommerce.aims.common.dto.ApiResponse;
//import com.ecommerce.aims.common.dto.PageResponse;
//import com.ecommerce.aims.user.dto.UserRequest;
//import com.ecommerce.aims.user.dto.UserResponse;
//import com.ecommerce.aims.user.services.UserService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/admin/users")
//@RequiredArgsConstructor
//public class UserAdminController {
//
//    private final UserService userService;
//
//    @PreAuthorize("hasAuthority('PERM_USER:WRITE') or hasAuthority('PERM_USER:ROLE_MANAGE')")
//    @PostMapping
//    public ApiResponse<UserResponse> create(@Valid @RequestBody UserRequest request) {
//        return ApiResponse.success(userService.createUser(request), "User created");
//    }
//
//    @PreAuthorize("hasAuthority('PERM_USER:WRITE') or hasAuthority('PERM_USER:ROLE_MANAGE')")
//    @PutMapping("/{id}")
//    public ApiResponse<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
//        return ApiResponse.success(userService.updateUser(id, request), "User updated");
//    }
//
//    @PreAuthorize("hasAuthority('PERM_USER:READ')")
//    @GetMapping("/{id}")
//    public ApiResponse<UserResponse> get(@PathVariable Long id) {
//        return ApiResponse.success(userService.getUser(id), "User detail");
//    }
//
//    @PreAuthorize("hasAuthority('PERM_USER:READ')")
//    @GetMapping
//    public ApiResponse<PageResponse<UserResponse>> list(@RequestParam(defaultValue = "0") int page,
//                                                        @RequestParam(defaultValue = "20") int size) {
//        return ApiResponse.success(userService.listUsers(page, size), "Users list");
//    }
//
//    @PreAuthorize("hasAuthority('PERM_USER:BLOCK')")
//    @PostMapping("/{id}/lock")
//    public ApiResponse<UserResponse> lock(@PathVariable Long id) {
//        return ApiResponse.success(userService.lockUser(id), "User locked");
//    }
//
//    @PreAuthorize("hasAuthority('PERM_USER:BLOCK')")
//    @PostMapping("/{id}/unlock")
//    public ApiResponse<UserResponse> unlock(@PathVariable Long id) {
//        return ApiResponse.success(userService.unlockUser(id), "User unlocked");
//    }
//}
