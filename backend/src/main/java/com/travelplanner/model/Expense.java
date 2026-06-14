package com.travelplanner.model;

public class Expense {
    private String id;
    private String description;
    private double amount;
    private String category; // e.g. Food, Transport, Lodging, Activities, Other
    private String currency = "INR";

    public Expense() {}

    public Expense(String id, String description, double amount, String category) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.currency = "INR";
    }

    public Expense(String id, String description, double amount, String category, String currency) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.currency = currency;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
