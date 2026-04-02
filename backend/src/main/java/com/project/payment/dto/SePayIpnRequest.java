package com.project.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SePayIpnRequest {

    private long timestamp;

    @JsonProperty("notification_type")
    private String notificationType;

    private OrderData order;

    private TransactionData transaction;

    @Data
    public static class OrderData {
        private String id;
        
        @JsonProperty("order_id")
        private String orderId;

        @JsonProperty("order_status")
        private String orderStatus;

        @JsonProperty("order_currency")
        private String orderCurrency;

        @JsonProperty("order_amount")
        private String orderAmount;

        @JsonProperty("order_invoice_number")
        private String orderInvoiceNumber;

        @JsonProperty("order_description")
        private String orderDescription;
    }

    @Data
    public static class TransactionData {
        private String id;

        @JsonProperty("payment_method")
        private String paymentMethod;

        @JsonProperty("transaction_id")
        private String transactionId;

        @JsonProperty("transaction_status")
        private String transactionStatus;

        @JsonProperty("transaction_amount")
        private String transactionAmount;

        @JsonProperty("transaction_currency")
        private String transactionCurrency;
    }
}
