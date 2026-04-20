package com.ens.absences.models;

import com.google.gson.annotations.SerializedName;

public class Absence {

    public int    id;
    public String nom;
    public String email;

    @SerializedName("start_date")    public String startDate;
    @SerializedName("end_date")      public String endDate;
    @SerializedName("reason")        public String reason;
    @SerializedName("status")        public String status;
    @SerializedName("agent_comment") public String agentComment;
    @SerializedName("created_at")    public String createdAt;
    @SerializedName("file_path")     public String filePath;
}