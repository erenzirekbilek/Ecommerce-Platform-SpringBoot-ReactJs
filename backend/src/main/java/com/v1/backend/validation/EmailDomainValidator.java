package com.v1.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;

public class EmailDomainValidator implements ConstraintValidator<EmailDomain, String> {

    private String[] allowedDomains;

    @Override
    public void initialize(EmailDomain constraintAnnotation) {
        this.allowedDomains = constraintAnnotation.allowed();
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        // Null ise geçer
        if (email == null) {
            return true;
        }

        // Email'den domain'i çıkar
        if (!email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1);

        // İzin verilen domainlerde var mı kontrol et
        return Arrays.stream(allowedDomains)
                .anyMatch(d -> d.equalsIgnoreCase(domain));
    }
}