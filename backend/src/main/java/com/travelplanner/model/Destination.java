package com.travelplanner.model;

public class Destination {
    private String id;
    private String name;
    private String description;
    private String country;
    private String imageUrl;
    private double budgetPerDay;

    public Destination() {}

    public Destination(String id, String name, String description, String country, String imageUrl, double budgetPerDay) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.country = country;
        this.imageUrl = imageUrl;
        this.budgetPerDay = budgetPerDay;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getBudgetPerDay() {
        return budgetPerDay;
    }

    public void setBudgetPerDay(double budgetPerDay) {
        this.budgetPerDay = budgetPerDay;
    }
}
