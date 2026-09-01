package org.uorderflow.utils;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class FormatUtils {

    private static final Locale PT_BR = new Locale("pt", "BR");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    public static String formatToBRL(Double price) {
        if (price == null) {
            return "R$ 0,00";
        }
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(PT_BR);
        return currencyFormat.format(price);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATE_TIME_FORMATTER);
    }
}
