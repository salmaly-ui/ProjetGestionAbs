package com.ens.absences.models;

import com.google.gson.annotations.SerializedName;

public class StatusLog {

    public int    id;
    public String nom;

    @SerializedName("old_status")  public String oldStatus;
    @SerializedName("new_status")  public String newStatus;
    @SerializedName("comment")     public String comment;
    @SerializedName("changed_at")  public String changedAt;
}