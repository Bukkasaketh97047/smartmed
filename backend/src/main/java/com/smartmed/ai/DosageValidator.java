package com.smartmed.ai;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class DosageValidator {

    private static final Map<String, Integer> MAX_DAILY_DOSAGE = new HashMap<>();

    static {
        MAX_DAILY_DOSAGE.put("Paracetamol", 4000);
        MAX_DAILY_DOSAGE.put("Ibuprofen", 1200);
        MAX_DAILY_DOSAGE.put("Amoxicillin", 1500);
        MAX_DAILY_DOSAGE.put("Azithromycin", 500);
    }

    public String validate(String medicine, String dosageStr, String frequency) {
        if (!MAX_DAILY_DOSAGE.containsKey(medicine)) {
            return null;
        }

        try {
            // Basic parsing: "500mg" -> 500
            int dosage = Integer.parseInt(dosageStr.replaceAll("[^0-9]", ""));
            int dailyFreq = parseFrequency(frequency);
            int dailyTotal = dosage * dailyFreq;

            if (dailyTotal > MAX_DAILY_DOSAGE.get(medicine)) {
                return "⚠ Dosage for " + medicine + " (" + dailyTotal + "mg/day) may exceed recommended medical limits (" + MAX_DAILY_DOSAGE.get(medicine) + "mg/day).";
            }
        } catch (Exception e) {
            return "Unable to validate dosage for " + medicine;
        }
        return null;
    }

    private int parseFrequency(String freq) {
        if (freq.contains("1-1-1")) return 3;
        if (freq.contains("1-0-1") || freq.contains("Twice")) return 2;
        if (freq.contains("Daily") || freq.contains("Once")) return 1;
        return 1;
    }
}
