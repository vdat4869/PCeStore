package com.project.review.dto;

import java.time.LocalDateTime;

public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private Long productId;
    private Long userId;
    private String userFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewResponse() {
    }

    /**
     * Constructor internally used by the manual builder pattern.
     * java:S107: Constructor has 8 parameters, which is greater than 7 authorized.
     */
    @SuppressWarnings("java:S107")
    public ReviewResponse(Long id, Integer rating, String comment, Long productId, Long userId, String userFullName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.productId = productId;
        this.userId = userId;
        this.userFullName = userFullName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static ReviewResponseBuilder builder() {
        return new ReviewResponseBuilder();
    }

    public static class ReviewResponseBuilder {
        private Long id;
        private Integer rating;
        private String comment;
        private Long productId;
        private Long userId;
        private String userFullName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ReviewResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReviewResponseBuilder rating(Integer rating) {
            this.rating = rating;
            return this;
        }

        public ReviewResponseBuilder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public ReviewResponseBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }

        public ReviewResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ReviewResponseBuilder userFullName(String userFullName) {
            this.userFullName = userFullName;
            return this;
        }

        public ReviewResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ReviewResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ReviewResponse build() {
            return new ReviewResponse(id, rating, comment, productId, userId, userFullName, createdAt, updatedAt);
        }
    }
}
