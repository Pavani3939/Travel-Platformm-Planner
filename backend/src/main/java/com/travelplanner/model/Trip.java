package com.travelplanner.model;

import java.util.ArrayList;
import java.util.List;

public class Trip {
    private String id;
    private String userId;
    private String destinationId;
    private String startDate; // format: YYYY-MM-DD
    private String endDate;   // format: YYYY-MM-DD
    private double budget;
    private List<Expense> expenses;
    private List<Itinerary> itinerary;

    public Trip() {
        this.expenses = new ArrayList<>();
        this.itinerary = new ArrayList<>();
    }

    public Trip(String id, String userId, String destinationId, String startDate, String endDate, double budget) {
        this.id = id;
        this.userId = userId;
        this.destinationId = destinationId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
        this.expenses = new ArrayList<>();
        this.itinerary = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDestinationId() {
        return destinationId;
    }

    public void setDestinationId(String destinationId) {
        this.destinationId = destinationId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses != null ? expenses : new ArrayList<>();
    }

    public List<Itinerary> getItinerary() {
        return itinerary;
    }

    public void setItinerary(List<Itinerary> itinerary) {
        this.itinerary = itinerary != null ? itinerary : new ArrayList<>();
    }
}
