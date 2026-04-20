package com.ens.absences.adapters;

import com.ens.absences.models.StatusLog;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.ens.absences.R;

import java.util.List;

public class LogAdapter extends RecyclerView.Adapter<LogAdapter.ViewHolder> {

    private final List<StatusLog> logs;

    public LogAdapter(List<StatusLog> logs) { this.logs = logs; }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_log, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        StatusLog log = logs.get(position);

        // Afficher la transition de statut
        String transition = (log.oldStatus != null ? log.oldStatus + " → " : "") + log.newStatus;
        h.tvTransition.setText(transition);

        // Commentaire
        h.tvComment.setText(log.comment != null && !log.comment.isEmpty()
                ? log.comment : "Aucun commentaire");

        // Agent + date
        String agent = (log.nom != null ? "Par " + log.nom : "Système");
        h.tvAgent.setText(agent + " • " + (log.changedAt != null ? log.changedAt.substring(0, 10) : ""));
    }

    @Override public int getItemCount() { return logs.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTransition, tvComment, tvAgent;
        ViewHolder(View v) {
            super(v);
            tvTransition = v.findViewById(R.id.tvTransition);
            tvComment    = v.findViewById(R.id.tvComment);
            tvAgent      = v.findViewById(R.id.tvAgent);
        }
    }
}