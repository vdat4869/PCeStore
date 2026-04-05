package com.project.user.service;

import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.user.dto.ChangePasswordRequest;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserProfileRepository userProfileRepository, 
                       UserRepository userRepository, 
                       PasswordEncoder passwordEncoder) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Lấy thông tin cá nhân
    public UserProfileResponse getProfile(User user) {
        // Nếu user này chưa có profile, tạo một bản profile mặc định trống
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile(user, null, null, null);
                    return userProfileRepository.save(newProfile);
                });
        
        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getAvatarUrl()
        );
    }

    // Cập nhật thông tin cá nhân
    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> new UserProfile(user, null, null, null));
        
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAvatarUrl(request.getAvatarUrl());

        userProfileRepository.save(profile);

        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getAvatarUrl()
        );
    }

    // Đổi mật khẩu
    public void changePassword(User user, ChangePasswordRequest request) {
        // Kiểm tra xem mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.old_password_incorrect");
        }

        // Kiểm tra xem mật khẩu mới có trùng với mật khẩu cũ không
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.new_password_same");
        }

        // Cập nhật mật khẩu mới 
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user); // Lưu Entity User vào DB
    }

    // Xoá người dùng (Soft Delete)
    public void deleteUser(User currentUser, Long targetUserId) {
        // Chỉ ADMIN hoặc chính chủ mới được xóa (thường là Admin xóa người dùng khác)
        if (!currentUser.getRole().equals(com.project.auth.entity.UserRole.ADMIN) && 
            !currentUser.getId().equals(targetUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_delete");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(true);
        userRepository.save(targetUser);
    }

    // Khôi phục người dùng (Restore) - Chỉ ADMIN
    public void restoreUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(com.project.auth.entity.UserRole.ADMIN)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_restore");
        }

        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(false);
        userRepository.save(targetUser);
    }
}
