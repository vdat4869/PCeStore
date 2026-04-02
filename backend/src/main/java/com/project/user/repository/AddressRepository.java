package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    // Lấy danh sách địa chỉ của một user
    List<Address> findByUser(User user);

    // Kích hoạt càn quét cấu trúc string giống nhau do user gởi lên
    boolean existsByUserAndStreetAndCityAndDistrict(User user, String street, String city, String district);

    // Tối ưu N+1 Query: Tắt cờ mặc định của tất cả địa chỉ xuống bằng một lệnh duy nhất O(1)
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user = :user AND a.isDefault = true")
    void clearDefaultAddressesForUser(User user);
}
