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
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AddressService addressService;
    private final MessageSource messageSource;

    public UserController(UserService userService, AddressService addressService, MessageSource messageSource) {
        this.userService = userService;
        this.addressService = addressService;
        this.messageSource = messageSource;
    }

    private String translate(String key) {
        try {
            return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
        } catch (org.springframework.context.NoSuchMessageException e) {
            return key;
        }
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
        
        userService.changePassword(userDetails.getUser(), request);
        return ResponseEntity.ok(translate("success.user.password_changed"));
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

    // Chỉnh sửa thông tin một địa chỉ
    @PutMapping("/address/{id}")
    public ResponseEntity<String> updateAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        
        addressService.updateAddress(userDetails.getUser(), id, request);
        return ResponseEntity.ok(translate("success.address.updated"));
    }

    // Nâng địa chỉ lên làm Mặc định nhanh chóng
    @PutMapping("/address/{id}/default")
    public ResponseEntity<String> setDefaultAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        addressService.setDefaultAddress(userDetails.getUser(), id);
        return ResponseEntity.ok(translate("success.address.default_set"));
    }

    // Xoá địa chỉ thiết lập
    @DeleteMapping("/address/{id}")
    public ResponseEntity<String> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        addressService.deleteAddress(userDetails.getUser(), id);
        return ResponseEntity.ok(translate("success.address.deleted"));
    }
}
