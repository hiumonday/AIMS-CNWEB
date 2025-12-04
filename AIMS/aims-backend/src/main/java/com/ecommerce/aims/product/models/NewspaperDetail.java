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
@Table(name = "newspaper_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewspaperDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String editorInChief;
    private String publisher;
    private LocalDate publishDate;

    private String issueNumber;
    private String language;
    private String sections;
}
