package com.project.notification.repository;

import com.project.auth.entity.User;
import com.project.notification.entity.Notification;
import com.project.notification.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByStatus(NotificationStatus status);
}
