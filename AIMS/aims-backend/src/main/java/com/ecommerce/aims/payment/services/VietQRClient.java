package com.ecommerce.aims.payment.services;

import com.ecommerce.aims.common.exception.BusinessException;
import com.ecommerce.aims.payment.config.VietQrProperties;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
        try {
            return payOS.paymentRequests().create(request);
        } catch (Exception e) {
            throw new BusinessException("PayOS create payment link error: " + e.getMessage());
        }
    }

    public VietQrCreateResponse createQr(Long orderId, BigDecimal amount, String description) {
        try {
            VietQrCreateRequest payload = new VietQrCreateRequest();
            payload.setOrderId(orderId);
            payload.setAmount(amount.setScale(0, RoundingMode.HALF_UP));
            payload.setDescription(description);
            return client()
                    .post()
                    .uri("/v2/generate")
                    .header("x-client-id", properties.getClientId())
                    .header("x-api-key", properties.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(VietQrCreateResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw new BusinessException("VietQR create error: " + ex.getResponseBodyAsString());
        }
    }

    private WebClient client() {
        return webClientBuilder.baseUrl(properties.getBaseUrl()).build();
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
