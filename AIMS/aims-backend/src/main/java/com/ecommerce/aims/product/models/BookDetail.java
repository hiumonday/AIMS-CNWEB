package com.ecommerce.aims.product.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String authors;
    private String coverType;
    private String publisher;
    private LocalDate publishDate;

    private Integer pageCount;
    private String language;
    private String genre;
}
