package com.project.payment.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class SecurityUtils {

    private static final List<String> SIGNED_FIELDS = Arrays.asList(
            "merchant", "operation", "payment_method", "order_amount", "currency",
            "order_invoice_number", "order_description", "customer_id",
            "success_url", "error_url", "cancel_url"
    );

    public static String generateSePaySignature(Map<String, String> fields, String secretKey) {
        try {
            List<String> signed = new ArrayList<>();
            for (String field : SIGNED_FIELDS) {
                if (fields.containsKey(field)) {
                    signed.add(field + "=" + fields.get(field));
                }
            }

            String data = String.join(",", signed);

            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes("UTF-8"), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);

            byte[] hmacBytes = sha256Hmac.doFinal(data.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC-SHA256 signature", e);
        }
    }
}
