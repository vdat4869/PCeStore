package com.project.user.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressRequest {

    @NotBlank(message = "Tên đường không được trống")
    private String street;

    @NotBlank(message = "Thành phố không được trống")
    private String city;

    @NotBlank(message = "Quận/huyện không được trống")
    private String district;

    private Boolean isDefault;

    public AddressRequest() {
    }

    public AddressRequest(String street, String city, String district, Boolean isDefault) {
        this.street = street;
        this.city = city;
        this.district = district;
        this.isDefault = isDefault;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean aDefault) {
        isDefault = aDefault;
    }
}
