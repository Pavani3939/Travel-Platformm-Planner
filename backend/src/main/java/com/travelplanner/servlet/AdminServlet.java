package com.travelplanner.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.travelplanner.model.User;
import com.travelplanner.model.Destination;
import com.travelplanner.model.Trip;
import com.travelplanner.service.DatabaseSimulator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AdminServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        if (!validateAdmin(request, response)) return;

        String pathInfo = request.getPathInfo();

        if ("/stats".equals(pathInfo)) {
            handleStats(response);
        } else if ("/users".equals(pathInfo)) {
            handleGetUsers(response);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Admin endpoint not found");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        if (!validateAdmin(request, response)) return;

        String pathInfo = request.getPathInfo();

        if ("/destinations".equals(pathInfo)) {
            handleAddDestination(request, response);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Admin endpoint not found");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        if (!validateAdmin(request, response)) return;

        String pathInfo = request.getPathInfo();

        if ("/users".equals(pathInfo)) {
            handleDeleteUser(request, response);
        } else if ("/destinations".equals(pathInfo)) {
            handleDeleteDestination(request, response);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Admin endpoint not found");
        }
    }

    private boolean validateAdmin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Not authenticated");
            return false;
        }

        User user = (User) session.getAttribute("user");
        
        // Fetch fresh copy of user details to verify role
        User freshUser = DatabaseSimulator.getUserById(user.getId());
        if (freshUser == null || !"ADMIN".equals(freshUser.getRole())) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access forbidden. Admin role required");
            return false;
        }

        return true;
    }

    private void handleStats(HttpServletResponse response) throws IOException {
        List<User> allUsers = DatabaseSimulator.getAllUsers();
        List<Destination> allDestinations = DatabaseSimulator.getAllDestinations();
        List<Trip> allTrips = DatabaseSimulator.getAllTrips();

        double totalBudget = 0.0;
        Map<String, Integer> destCount = new HashMap<>();
        for (Trip t : allTrips) {
            totalBudget += t.getBudget();
            destCount.put(t.getDestinationId(), destCount.getOrDefault(t.getDestinationId(), 0) + 1);
        }

        // Find popular destination ID
        String popularDestId = "None";
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : destCount.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                popularDestId = entry.getKey();
            }
        }

        String popularDestName = "None";
        if (!"None".equals(popularDestId)) {
            Destination dest = DatabaseSimulator.getDestinationById(popularDestId);
            if (dest != null) {
                popularDestName = dest.getName() + " (" + dest.getCountry() + ")";
            }
        }

        JsonObject stats = new JsonObject();
        stats.addProperty("totalUsers", allUsers.size());
        stats.addProperty("totalDestinations", allDestinations.size());
        stats.addProperty("totalTrips", allTrips.size());
        stats.addProperty("totalSystemBudget", totalBudget);
        stats.addProperty("popularDestination", popularDestName);

        sendJson(response, HttpServletResponse.SC_OK, stats);
    }

    private void handleGetUsers(HttpServletResponse response) throws IOException {
        List<User> list = DatabaseSimulator.getAllUsers();
        // Clean passwords for security
        for (User u : list) {
            u.setPassword(null);
        }
        sendJson(response, HttpServletResponse.SC_OK, list);
    }

    private void handleDeleteUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String id = request.getParameter("id");
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing parameter 'id'");
            return;
        }

        if ("usr-admin".equals(id)) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Cannot delete primary administrator account");
            return;
        }

        boolean ok = DatabaseSimulator.deleteUser(id);
        if (ok) {
            JsonObject res = new JsonObject();
            res.addProperty("message", "User deleted successfully");
            sendJson(response, HttpServletResponse.SC_OK, res);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "User not found");
        }
    }

    private void handleAddDestination(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            Destination dest = gson.fromJson(request.getReader(), Destination.class);
            if (dest == null || dest.getName() == null || dest.getCountry() == null 
                    || dest.getDescription() == null || dest.getBudgetPerDay() <= 0) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing required destination parameters");
                return;
            }

            if (dest.getImageUrl() == null || dest.getImageUrl().trim().isEmpty()) {
                dest.setImageUrl("https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"); // default placeholder image
            }

            Destination created = DatabaseSimulator.addDestination(dest);
            sendJson(response, HttpServletResponse.SC_CREATED, created);
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid format");
        }
    }

    private void handleDeleteDestination(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String id = request.getParameter("id");
        if (id == null) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing parameter 'id'");
            return;
        }

        boolean ok = DatabaseSimulator.deleteDestination(id);
        if (ok) {
            JsonObject res = new JsonObject();
            res.addProperty("message", "Destination deleted successfully");
            sendJson(response, HttpServletResponse.SC_OK, res);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Destination not found");
        }
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
