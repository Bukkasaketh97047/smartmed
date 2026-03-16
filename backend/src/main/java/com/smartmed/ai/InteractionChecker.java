package com.smartmed.ai;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class InteractionChecker {

    public List<String> checkInteractions(List<String> medicines) {
        List<String> alerts = new ArrayList<>();
        List<String> meds = medicines.stream().map(String::toLowerCase).toList();
        
        // 1. Ibuprofen + Blood Thinners (Aspirin/Warfarin)
        boolean hasIbuprofen = meds.stream().anyMatch(m -> m.contains("ibuprofen"));
        boolean hasBloodThinner = meds.stream().anyMatch(m -> m.contains("warfarin") || m.contains("aspirin"));

        if (hasIbuprofen && hasBloodThinner) {
            alerts.add("⚠ Drug Interaction Alert: Combining Ibuprofen with Blood Thinners may increase bleeding risk.");
        }

        // 2. Paracetamol + Alcohol (conceptually)
        // Since we don't have user alcohol consumption data yet, this is usually a general warning
        boolean hasParacetamol = meds.stream().anyMatch(m -> m.contains("paracetamol") || m.contains("dolo") || m.contains("crocin"));
        if (hasParacetamol) {
            // This is more of a safety warning than an interaction between two drugs in the list
            // But good for the "AI Safety Summary"
        }

        // 3. Ibuprofen + Aspirin
        boolean hasAspirin = meds.stream().anyMatch(m -> m.contains("aspirin"));
        if (hasIbuprofen && hasAspirin) {
            alerts.add("⚠ Safety Alert: Taking Ibuprofen and Aspirin together may reduce the heart-protective effect of aspirin.");
        }

        // 4. Multiple NSAIDs (Ibuprofen + Naproxen)
        boolean hasNaproxen = meds.stream().anyMatch(m -> m.contains("naproxen"));
        if (hasIbuprofen && hasNaproxen) {
            alerts.add("⚠ Caution: Multiple NSAIDs (Ibuprofen & Naproxen) detected. This increased risk of stomach ulcers.");
        }

        return alerts;
    }
}
