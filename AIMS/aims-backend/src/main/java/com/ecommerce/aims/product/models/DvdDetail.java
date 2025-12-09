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
@Table(name = "dvd_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DvdDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String discType;
    private String director;
    private Integer runtimeMinutes;
    private String studio;
    private String language;
    private String subtitles;
    private LocalDate releaseDate;
    private String genre;
}
