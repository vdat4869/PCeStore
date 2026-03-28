package com.project.user.controller;

import com.project.common.security.CustomUserDetails;
import com.project.user.dto.AddressRequest;
import com.project.user.dto.AddressResponse;
import com.project.user.dto.ChangePasswordRequest;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.service.AddressService;
import com.project.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AddressService addressService;

    public UserController(UserService userService, AddressService addressService) {
        this.userService = userService;
        this.addressService = addressService;
    }

    // Lấy thông tin tài khoản người dùng
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUser()));
    }

    // Cập nhật Profile (Yêu cầu thoả mãn SDT Validator)
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUser(), request));
    }

    // Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        try {
            userService.changePassword(userDetails.getUser(), request);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Lấy danh sách địa chỉ giao hàng
    @GetMapping("/address")
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(addressService.getUserAddresses(userDetails.getUser()));
    }

    // Thêm địa chỉ mới
    @PostMapping("/address")
    public ResponseEntity<AddressResponse> addAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        
        return ResponseEntity.ok(addressService.addAddress(userDetails.getUser(), request));
    }

    // Xoá địa chỉ thiết lập
    @DeleteMapping("/address/{id}")
    public ResponseEntity<String> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        try {
            addressService.deleteAddress(userDetails.getUser(), id);
            return ResponseEntity.ok("Đã xoá địa chỉ thành công!");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
