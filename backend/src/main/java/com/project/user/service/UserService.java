package com.project.user.service;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.user.dto.AdminUserResponse;
import com.project.user.dto.ChangePasswordRequest;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import com.project.user.entity.UserAuditLog;
import com.project.user.entity.UserAction;
import com.project.user.repository.UserAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAuditLogRepository auditLogRepository;
    private final com.project.user.repository.EmailChangeTokenRepository emailChangeTokenRepository;
    private final com.project.notification.service.NotificationService notificationService;
    private final com.project.common.service.FileStorageService fileStorageService;

    @PersistenceContext
    private EntityManager entityManager;

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

    // --- User Self-Management ---

    public UserProfileResponse getProfile(User user) {
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    // Check if a soft-deleted profile exists to prevent Unique Constraint violation
                    return userProfileRepository.findByUserIdIncludingDeleted(user.getId())
                            .map(deletedProfile -> {
                                deletedProfile.setDeleted(false);
                                return userProfileRepository.save(deletedProfile);
                            })
                            .orElseGet(() -> {
                                UserProfile newProfile = new UserProfile(user, null, null, null);
                                return userProfileRepository.save(newProfile);
                            });
                });
        
        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName() != null ? profile.getFullName() : user.getFullName(),
                profile.getPhone() != null ? profile.getPhone() : user.getPhone(),
                profile.getAvatarUrl()
        );
    }

    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> new UserProfile(user, null, null, null));
        
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAvatarUrl(request.getAvatarUrl());

        userProfileRepository.save(profile);
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Cập nhật hồ sơ từ " + user.getEmail(), null));

        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getAvatarUrl()
        );
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.old_password_incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.new_password_same");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogRepository.save(new UserAuditLog(user, UserAction.CHANGE_PASSWORD, "Đã đổi mật khẩu", null));
    }

    @Transactional
    public void deactivateAccount(User user) {
        user.setDeleted(true);
        userRepository.save(user);
        auditLogRepository.save(new UserAuditLog(user, UserAction.ACCOUNT_DEACTIVATED, "Người dùng tự hủy tài khoản", null));
    }

    // --- Admin Management ---

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAllIncludingDeleted(pageable).map(this::mapToAdminResponse);
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsersIncludingDeleted(keyword, pageable).map(this::mapToAdminResponse);
    }

    @Transactional
    public void updateUserRole(Long userId, UserRole role) {
        User user = userRepository.findByIdIncludingDeleted(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findByIdIncludingDeleted(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.ADMIN) && !currentUser.getId().equals(targetUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_delete");
        }

        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(true);
        userRepository.save(targetUser);
    }

    @Transactional
    public void hardDeleteUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_delete");
        }
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Không thể tự xóa chính mình bằng quyền Admin");
        }
        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        
        Long uId = targetUser.getId();

        // 1. Dọn dẹp dữ liệu ràng buộc
        entityManager.createQuery("DELETE FROM Notification n WHERE n.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM NotificationPreference np WHERE np.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM Address a WHERE a.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM RefreshToken r WHERE r.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM EmailVerificationToken e WHERE e.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM PasswordResetToken p WHERE p.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM EmailChangeToken ect WHERE ect.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM UserAuditLog u WHERE u.user.id = :uid").setParameter("uid", uId).executeUpdate();
        entityManager.createQuery("DELETE FROM LoginLog l WHERE l.email = :email").setParameter("email", targetUser.getEmail()).executeUpdate();
        entityManager.createQuery("DELETE FROM Review r WHERE r.user.id = :uid").setParameter("uid", uId).executeUpdate();

        // 2. Xóa Orders theo cơ chế cascade (để tự động xóa OrderItem, Shipping, Payment)
        java.util.List<?> orders = entityManager.createQuery("SELECT o FROM Order o WHERE o.userId = :uid").setParameter("uid", uId).getResultList();
        for (Object o : orders) {
            entityManager.remove(o);
        }

        // 3. Xóa profile tham chiếu
        userProfileRepository.findByUser(targetUser).ifPresent(p -> userProfileRepository.delete(p));
        
        // 4. Cuối cùng xoá User
        userRepository.delete(targetUser);
    }

    @Transactional
    public void restoreUser(Long targetUserId) {
        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(false);
        userRepository.save(targetUser);
    }

    private AdminUserResponse mapToAdminResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .isDeleted(user.isDeleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // --- Email Identity Flow ---

    @Transactional
    public void requestEmailChange(User user, String newEmail) {
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("error.auth.email_used");
        }
        emailChangeTokenRepository.deleteByUser(user);
        String token = java.util.UUID.randomUUID().toString();
        com.project.user.entity.EmailChangeToken emailToken = new com.project.user.entity.EmailChangeToken(
            user, newEmail, token, java.time.LocalDateTime.now().plusHours(24)
        );
        emailChangeTokenRepository.save(emailToken);
        notificationService.sendEmailChangeVerification(user, newEmail, token, org.springframework.context.i18n.LocaleContextHolder.getLocale());
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Yêu cầu đổi email sang: " + newEmail, null));
    }

    @Transactional
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

    @Transactional
    public String updateAvatar(User user, org.springframework.web.multipart.MultipartFile file) {
        UserProfile profile = userProfileRepository.findByUser(user)
            .orElseGet(() -> new UserProfile(user, null, null, null));
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().startsWith("http")) {
            fileStorageService.deleteAvatar(profile.getAvatarUrl());
        }
        String fileName = fileStorageService.storeAvatar(file);
        profile.setAvatarUrl(fileName);
        userProfileRepository.save(profile);
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, "Cập nhật ảnh đại diện mơi: " + fileName, null));
        return fileName;
    }
}
