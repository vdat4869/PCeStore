package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    // Tìm profile bởi object User
    Optional<UserProfile> findByUser(User user);
}
