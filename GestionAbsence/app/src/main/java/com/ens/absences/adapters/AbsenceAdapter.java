package com.ens.absences.adapters;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.ens.absences.R;
import com.ens.absences.models.Absence;

import java.util.List;

public class AbsenceAdapter extends RecyclerView.Adapter<AbsenceAdapter.ViewHolder> {

    public interface OnAbsenceClick { void onClick(Absence absence); }

    private final List<Absence>  absences;
    private final OnAbsenceClick listener;

    public AbsenceAdapter(List<Absence> absences, OnAbsenceClick listener) {
        this.absences = absences;
        this.listener = listener;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_absence, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        Absence a = absences.get(position);

        h.tvDates.setText(a.startDate + "  →  " + a.endDate);
        h.tvMotif.setText(a.reason != null && !a.reason.isEmpty() ? a.reason : "Aucun motif");
        h.tvStatut.setText(labelStatut(a.status));
        h.tvStatut.setBackgroundColor(bgStatut(a.status));
        h.tvStatut.setTextColor(colorStatut(a.status));

        h.itemView.setOnClickListener(v -> listener.onClick(a));
    }

    @Override public int getItemCount() { return absences.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDates, tvMotif, tvStatut;
        ViewHolder(View v) {
            super(v);
            tvDates  = v.findViewById(R.id.tvDates);
            tvMotif  = v.findViewById(R.id.tvMotif);
            tvStatut = v.findViewById(R.id.tvStatut);
        }
    }

    private String labelStatut(String s) {
        if (s == null) return "Soumise";
        switch (s) {
            case "acceptee": return "Acceptée";
            case "refusee":  return "Refusée";
            case "en_cours": return "En vérification";
            default:         return "Soumise";
        }
    }

    private int bgStatut(String s) {
        if (s == null) return Color.parseColor("#EFF6FF");
        switch (s) {
            case "acceptee": return Color.parseColor("#ECFDF5");
            case "refusee":  return Color.parseColor("#FEF2F2");
            case "en_cours": return Color.parseColor("#FFFBEB");
            default:         return Color.parseColor("#EFF6FF");
        }
    }

    private int colorStatut(String s) {
        if (s == null) return Color.parseColor("#1D4ED8");
        switch (s) {
            case "acceptee": return Color.parseColor("#065F46");
            case "refusee":  return Color.parseColor("#B91C1C");
            case "en_cours": return Color.parseColor("#B45309");
            default:         return Color.parseColor("#1D4ED8");
        }
    }
}