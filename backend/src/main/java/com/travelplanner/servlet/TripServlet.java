package com.travelplanner.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.travelplanner.model.User;
import com.travelplanner.model.Trip;
import com.travelplanner.model.Destination;
import com.travelplanner.model.Itinerary;
import com.travelplanner.service.DatabaseSimulator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class TripServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        User user = getAuthenticatedUser(request, response);
        if (user == null) return;

        String id = request.getParameter("id");
        if (id != null) {
            Trip trip = DatabaseSimulator.getTripById(id);
            if (trip == null) {
                sendError(response, HttpServletResponse.SC_NOT_FOUND, "Trip not found");
                return;
            }
            // Ensure owner or admin
            if (!trip.getUserId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }
            sendJson(response, HttpServletResponse.SC_OK, trip);
        } else {
            // Return user's trips
            List<Trip> userTrips = DatabaseSimulator.getTripsByUserId(user.getId());
            sendJson(response, HttpServletResponse.SC_OK, userTrips);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        User user = getAuthenticatedUser(request, response);
        if (user == null) return;

        try {
            JsonObject body = gson.fromJson(request.getReader(), JsonObject.class);
            if (body == null || !body.has("destinationId") || !body.has("startDate") 
                    || !body.has("endDate") || !body.has("budget")) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Required fields: destinationId, startDate, endDate, budget");
                return;
            }

            String destinationId = body.get("destinationId").getAsString();
            String startDate = body.get("startDate").getAsString();
            String endDate = body.get("endDate").getAsString();
            double budget = body.get("budget").getAsDouble();

            Destination dest = DatabaseSimulator.getDestinationById(destinationId);
            if (dest == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid destination ID");
                return;
            }

            // Create new Trip
            Trip trip = new Trip(null, user.getId(), destinationId, startDate, endDate, budget);

            // Generate itinerary days based on dates
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                long days = ChronoUnit.DAYS.between(start, end) + 1;
                
                if (days <= 0) {
                    sendError(response, HttpServletResponse.SC_BAD_REQUEST, "End date must be on or after start date");
                    return;
                }
                
                double dailyBudget = budget / days;
                List<Itinerary> itineraryList = new ArrayList<>();
                for (int i = 1; i <= days; i++) {
                    List<String> dailyActivities = generateActivitiesForDay(i, dest, dailyBudget, (int) days);
                    itineraryList.add(new Itinerary(i, dailyActivities, "Not Specified"));
                }
                trip.setItinerary(itineraryList);
            } catch (Exception dateEx) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid date format. Use YYYY-MM-DD");
                return;
            }

            Trip created = DatabaseSimulator.createTrip(trip);
            sendJson(response, HttpServletResponse.SC_CREATED, created);
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload: " + e.getMessage());
        }
    }

    private List<String> generateActivitiesForDay(int day, Destination dest, double dailyBudget, int totalDays) {
        List<String> activities = new ArrayList<>();
        String destName = dest.getName().toLowerCase();
        String desc = dest.getDescription().toLowerCase();
        
        if (day == 1) {
            activities.add("Arrival and Hotel Check-in at " + dest.getName());
            activities.add("Rest and explore the local neighborhood");
        } else if (day == totalDays) {
            activities.add("Souvenir shopping and final sightseeing");
            activities.add("Departure from " + dest.getName());
        } else {
            // Budget-based activity
            if (dailyBudget > 15000) {
                activities.add("Premium Private Guided Tour");
                activities.add("Fine Dining Experience");
            } else if (dailyBudget > 5000) {
                activities.add("Group City Sightseeing Tour");
                activities.add("Enjoy local popular restaurants");
            } else {
                activities.add("Self-guided Walking Tour");
                activities.add("Try local street food and public markets");
            }
            
            // Location-based activity
            if (desc.contains("beach") || destName.contains("maldives") || destName.contains("bali")) {
                activities.add("Relax at the beach and try water sports");
            } else if (desc.contains("histor") || destName.contains("rome") || destName.contains("kyoto") || desc.contains("ancient")) {
                activities.add("Visit historical monuments and museums");
            } else if (destName.contains("paris")) {
                activities.add("Eiffel Tower visit and Seine river cruise");
            } else if (destName.contains("tokyo") || destName.contains("new york")) {
                activities.add("Explore bustling city centers and shopping districts");
            } else if (desc.contains("mountain") || destName.contains("swiss") || destName.contains("banff")) {
                activities.add("Hiking and enjoying scenic nature views");
            }
        }
        return activities;
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        User user = getAuthenticatedUser(request, response);
        if (user == null) return;

        String id = request.getParameter("id");
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing trip parameter 'id'");
            return;
        }

        Trip existingTrip = DatabaseSimulator.getTripById(id);
        if (existingTrip == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Trip not found");
            return;
        }

        // Check ownership
        if (!existingTrip.getUserId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        try {
            Trip updatedTrip = gson.fromJson(request.getReader(), Trip.class);
            if (updatedTrip == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Empty request body");
                return;
            }

            // Enforce key immutable identifiers
            updatedTrip.setId(existingTrip.getId());
            updatedTrip.setUserId(existingTrip.getUserId());

            // Handle potential date change to adjust itinerary list
            if (!updatedTrip.getStartDate().equals(existingTrip.getStartDate()) 
                    || !updatedTrip.getEndDate().equals(existingTrip.getEndDate())) {
                try {
                    LocalDate start = LocalDate.parse(updatedTrip.getStartDate());
                    LocalDate end = LocalDate.parse(updatedTrip.getEndDate());
                    long newDays = ChronoUnit.DAYS.between(start, end) + 1;
                    
                    if (newDays <= 0) {
                        sendError(response, HttpServletResponse.SC_BAD_REQUEST, "End date must be on or after start date");
                        return;
                    }

                    List<Itinerary> oldItin = updatedTrip.getItinerary();
                    List<Itinerary> adjustedItin = new ArrayList<>();
                    for (int i = 1; i <= newDays; i++) {
                        // Keep previous activities if index fits, else create blank
                        if (oldItin != null && i <= oldItin.size()) {
                            adjustedItin.add(oldItin.get(i - 1));
                        } else {
                            adjustedItin.add(new Itinerary(i, new ArrayList<>(), "Not Specified"));
                        }
                    }
                    updatedTrip.setItinerary(adjustedItin);
                } catch (Exception e) {
                    sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid date values");
                    return;
                }
            }

            boolean ok = DatabaseSimulator.updateTrip(updatedTrip);
            if (ok) {
                sendJson(response, HttpServletResponse.SC_OK, updatedTrip);
            } else {
                sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update trip");
            }
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid request body");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        User user = getAuthenticatedUser(request, response);
        if (user == null) return;

        String id = request.getParameter("id");
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing trip parameter 'id'");
            return;
        }

        Trip existingTrip = DatabaseSimulator.getTripById(id);
        if (existingTrip == null) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Trip not found");
            return;
        }

        // Ownership validation
        if (!existingTrip.getUserId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return;
        }

        boolean removed = DatabaseSimulator.deleteTrip(id);
        if (removed) {
            JsonObject json = new JsonObject();
            json.addProperty("message", "Trip deleted successfully");
            sendJson(response, HttpServletResponse.SC_OK, json);
        } else {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to delete trip");
        }
    }

    private User getAuthenticatedUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Not authenticated");
            return null;
        }
        return (User) session.getAttribute("user");
    }

    private void sendJson(HttpServletResponse response, int status, Object obj) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(obj));
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject err = new JsonObject();
        err.addProperty("error", message);
        response.getWriter().write(gson.toJson(err));
    }
}
