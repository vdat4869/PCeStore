package com.project.user.service;

import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.user.dto.ChangePasswordRequest;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import com.project.user.entity.UserAuditLog;
import com.project.user.entity.UserAction;
import com.project.user.repository.UserAuditLogRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAuditLogRepository auditLogRepository;
    private final com.project.user.repository.EmailChangeTokenRepository emailChangeTokenRepository;
    private final com.project.notification.service.NotificationService notificationService;
    private final com.project.common.service.FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, 
                       UserProfileRepository userProfileRepository, 
                       PasswordEncoder passwordEncoder,
                       UserAuditLogRepository auditLogRepository,
                       com.project.user.repository.EmailChangeTokenRepository emailChangeTokenRepository,
                       com.project.notification.service.NotificationService notificationService,
                       com.project.common.service.FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
        this.emailChangeTokenRepository = emailChangeTokenRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
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
        
        // Log hành động
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Cập nhật hồ sơ từ " + user.getEmail(), null));

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

        // Log hành động
        auditLogRepository.save(new UserAuditLog(user, UserAction.CHANGE_PASSWORD, "Đã đổi mật khẩu", null));
    }

    // Người dùng tự vô hiệu hóa tài khoản (Self-Deactivate)
    @org.springframework.transaction.annotation.Transactional
    public void deactivateAccount(User user) {
        user.setDeleted(true);
        userRepository.save(user);
        
        // Log hành động
        auditLogRepository.save(new UserAuditLog(user, UserAction.ACCOUNT_DEACTIVATED, "Người dùng tự hủy tài khoản", null));
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

    // Luồng Thay đổi Email - Bước 1: Gửi Token tới Email mới
    @org.springframework.transaction.annotation.Transactional
    public void requestEmailChange(User user, String newEmail) {
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("error.auth.email_used");
        }

        // Dọn dẹp token cũ nếu có
        emailChangeTokenRepository.deleteByUser(user);

        String token = java.util.UUID.randomUUID().toString();
        com.project.user.entity.EmailChangeToken emailToken = new com.project.user.entity.EmailChangeToken(
            user, newEmail, token, java.time.LocalDateTime.now().plusHours(24)
        );
        emailChangeTokenRepository.save(emailToken);

        // Gửi mail xác thực tới Email MỚI
        notificationService.sendEmailChangeVerification(user, newEmail, token, org.springframework.context.i18n.LocaleContextHolder.getLocale());
        
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Yêu cầu đổi email sang: " + newEmail, null));
    }

    // Luồng Thay đổi Email - Bước 2: Xác nhận và Cập nhật
    @org.springframework.transaction.annotation.Transactional
    public void confirmEmailChange(String token) {
        com.project.user.entity.EmailChangeToken emailToken = emailChangeTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("error.auth.token_not_found"));

        if (emailToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            emailChangeTokenRepository.delete(emailToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }

        User user = emailToken.getUser();
        String oldEmail = user.getEmail();
        user.setEmail(emailToken.getNewEmail());
        userRepository.save(user);

        emailChangeTokenRepository.delete(emailToken);
        
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Đổi email xong: " + oldEmail + " -> " + user.getEmail(), null));
    }

    // Tải ảnh đại diện (Physical Avatar)
    @org.springframework.transaction.annotation.Transactional
    public String updateAvatar(User user, org.springframework.web.multipart.MultipartFile file) {
        UserProfile profile = userProfileRepository.findByUser(user)
            .orElseGet(() -> new UserProfile(user, null, null, null));

        // Xóa ảnh cũ nếu có và không phải mặc định
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().startsWith("http")) {
            fileStorageService.deleteAvatar(profile.getAvatarUrl());
        }

        // Lưu ảnh mới
        String fileName = fileStorageService.storeAvatar(file);
        profile.setAvatarUrl(fileName);
        userProfileRepository.save(profile);

        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Cập nhật ảnh đại diện mơi: " + fileName, null));
        
        return fileName;
    }
}
