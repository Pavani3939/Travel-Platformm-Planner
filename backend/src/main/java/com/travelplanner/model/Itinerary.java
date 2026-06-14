package com.travelplanner.model;

import java.util.ArrayList;
import java.util.List;

public class Itinerary {
    private int dayNumber;
    private List<String> activities;
    private String accommodation;

    public Itinerary() {
        this.activities = new ArrayList<>();
    }

    public Itinerary(int dayNumber, List<String> activities, String accommodation) {
        this.dayNumber = dayNumber;
        this.activities = activities != null ? activities : new ArrayList<>();
        this.accommodation = accommodation;
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
    }

    public String getAccommodation() {
        return accommodation;
    }

    public void setAccommodation(String accommodation) {
        this.accommodation = accommodation;
    }

    public void addActivity(String activity) {
        if (this.activities == null) {
            this.activities = new ArrayList<>();
        }
        this.activities.add(activity);
    }
}
