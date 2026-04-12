package com.project.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for mapping SePay Transactions List response (v2).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SePayTransactionResponse {
    private int status;
    private int count;
    private List<SePayTransactionDTO> transactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SePayTransactionDTO {
        private Long id;
        private String transaction_content;
        private String amount_in;
        private String reference_number;
        private String code;
        private String transaction_date;
        private String account_number;
    }
}
