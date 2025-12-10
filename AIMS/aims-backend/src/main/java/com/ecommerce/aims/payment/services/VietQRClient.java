package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.payment.config.VietQrProperties;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@Service
public class VietQRClient {

    private final WebClient.Builder webClientBuilder;
    private final VietQrProperties properties;
    private final PayOS payOS;

    public VietQRClient(WebClient.Builder webClientBuilder,
            VietQrProperties properties,
            @Value("${vietqr.client-id}") String clientId,
            @Value("${vietqr.api-key}") String apiKey,
            @Value("${vietqr.checksum-key}") String checksumKey) {
        this.webClientBuilder = webClientBuilder;
        this.properties = properties;
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request) {
        Objects.requireNonNull(request, "request must not be null");
        try {
            return payOS.paymentRequests().create(request);
        } catch (Exception e) {
            throw new BusinessException("PayOS create payment link error: " + e.getMessage());
        }
    }

    public VietQrCreateResponse createQr(Long orderId, BigDecimal amount, String description) {
        try {
            VietQrCreateRequest payload = new VietQrCreateRequest();
            payload.setOrderId(Objects.requireNonNull(orderId, "orderId must not be null"));
            payload.setAmount(Objects.requireNonNull(amount, "amount must not be null").setScale(0, RoundingMode.HALF_UP));
            payload.setDescription(description);
            return client()
                    .post()
                    .uri("/v2/generate")
                    .header("x-client-id", Objects.requireNonNull(properties.getClientId(), "clientId must not be null"))
                    .header("x-api-key", Objects.requireNonNull(properties.getApiKey(), "apiKey must not be null"))
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON, "mediaType must not be null"))
                    .bodyValue(Objects.requireNonNull(payload, "payload must not be null"))
                    .retrieve()
                    .bodyToMono(VietQrCreateResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw new BusinessException("VietQR create error: " + ex.getResponseBodyAsString());
        }
    }

    private WebClient client() {
        return webClientBuilder.baseUrl(Objects.requireNonNull(properties.getBaseUrl(), "baseUrl must not be null")).build();
    }

    @Data
    public static class VietQrCreateRequest {
        private Long orderId;
        private BigDecimal amount;
        private String description;
    }

    @Data
    public static class VietQrCreateResponse {
        private String qrContent;
        private String qrImage;
        private String transactionId;
    }
}
