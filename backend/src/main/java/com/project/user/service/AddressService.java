package com.project.user.service;

import com.project.auth.entity.User;
import com.project.user.dto.AddressRequest;
import com.project.user.dto.AddressResponse;
import com.project.user.entity.Address;
import com.project.user.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    // Lấy toàn bộ địa chỉ của một User
    public List<AddressResponse> getUserAddresses(User user) {
        return addressRepository.findByUser(user).stream()
                .map(addr -> new AddressResponse(
                        addr.getId(),
                        addr.getStreet(),
                        addr.getCity(),
                        addr.getDistrict(),
                        addr.getIsDefault()
                )).collect(Collectors.toList());
    }

    // Thêm địa chỉ mới
    @Transactional
    public AddressResponse addAddress(User user, AddressRequest request) {
        List<Address> existingAddresses = addressRepository.findByUser(user);

        // Nếu đây là địa chỉ đầu tiên, tự động set làm mặc định bất chấp cờ
        Boolean isDefault = request.getIsDefault() != null ? request.getIsDefault() : false;
        
        if (existingAddresses.isEmpty()) {
            isDefault = true;
        } else if (isDefault) {
            // Nếu đánh set là mặc định, phải huỷ mặc định của tất cả địa chỉ cũ
            for (Address oldAddr : existingAddresses) {
                if (oldAddr.getIsDefault()) {
                    oldAddr.setIsDefault(false);
                    addressRepository.save(oldAddr); // Lưu đè cái cũ
                }
            }
        }

        Address newAddr = new Address(
                user,
                request.getStreet(),
                request.getCity(),
                request.getDistrict(),
                isDefault
        );

        addressRepository.save(newAddr);

        return new AddressResponse(
                newAddr.getId(),
                newAddr.getStreet(),
                newAddr.getCity(),
                newAddr.getDistrict(),
                newAddr.getIsDefault()
        );
    }

    // Xoá địa chỉ
    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        // Xác minh xem địa chỉ này có thuộc về user đang tạo req ko
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xoá địa chỉ này");
        }

        addressRepository.delete(address);
    }
}
