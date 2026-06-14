package com.travelplanner.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.travelplanner.model.User;
import com.travelplanner.service.DatabaseSimulator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class AuthServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        if ("/me".equals(pathInfo)) {
            handleMe(request, response);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        if ("/register".equals(pathInfo)) {
            handleRegister(request, response);
        } else if ("/login".equals(pathInfo)) {
            handleLogin(request, response);
        } else if ("/logout".equals(pathInfo)) {
            handleLogout(request, response);
        } else {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleRegister(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            User user = gson.fromJson(request.getReader(), User.class);
            if (user == null || user.getUsername() == null || user.getPassword() == null 
                    || user.getEmail() == null || user.getFullName() == null) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "All fields are required");
                return;
            }

            User registered = DatabaseSimulator.registerUser(user);
            
            // Clean password before sending back by creating a response copy
            User responseUser = new User(
                registered.getId(), registered.getUsername(), null, registered.getEmail(), registered.getRole(), registered.getFullName()
            );

            // Automatically log the user in after registration
            HttpSession session = request.getSession(true);
            session.setAttribute("user", responseUser);

            sendJson(response, HttpServletResponse.SC_CREATED, responseUser);
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            JsonObject body = gson.fromJson(request.getReader(), JsonObject.class);
            if (body == null || !body.has("username") || !body.has("password")) {
                sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Username and password are required");
                return;
            }

            String username = body.get("username").getAsString();
            String password = body.get("password").getAsString();

            User user = DatabaseSimulator.getUserByUsername(username);
            if (user == null || !user.getPassword().equals(password)) {
                sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid username or password");
                return;
            }

            // Clean password before sending back
            User responseUser = new User(
                user.getId(), user.getUsername(), null, user.getEmail(), user.getRole(), user.getFullName()
            );

            HttpSession session = request.getSession(true);
            session.setAttribute("user", responseUser);

            sendJson(response, HttpServletResponse.SC_OK, responseUser);
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An error occurred: " + e.getMessage());
        }
    }

    private void handleLogout(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        JsonObject res = new JsonObject();
        res.addProperty("message", "Logged out successfully");
        sendJson(response, HttpServletResponse.SC_OK, res);
    }

    private void handleMe(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Not authenticated");
            return;
        }

        User user = (User) session.getAttribute("user");
        
        // Refresh profile state from memory
        User freshUser = DatabaseSimulator.getUserById(user.getId());
        if (freshUser == null) {
            session.invalidate();
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "User no longer exists");
            return;
        }

        User responseUser = new User(
            freshUser.getId(), freshUser.getUsername(), null, freshUser.getEmail(), freshUser.getRole(), freshUser.getFullName()
        );
        sendJson(response, HttpServletResponse.SC_OK, responseUser);
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
