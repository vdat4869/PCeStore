package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    // Lấy danh sách địa chỉ của một user
    List<Address> findByUser(User user);
}
