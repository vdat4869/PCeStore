package com.project.product.repository;

import com.project.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category", "inventory"})
    @NonNull
    Page<Product> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"category", "inventory"})
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "inventory"})
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "inventory"})
    Page<Product> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
}
