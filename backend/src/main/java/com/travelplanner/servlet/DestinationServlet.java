package com.travelplanner.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.travelplanner.model.Destination;
import com.travelplanner.service.DatabaseSimulator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class DestinationServlet extends HttpServlet {
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        List<Destination> list = DatabaseSimulator.getAllDestinations();
        
        // Optional search filtering by query parameter
        String search = request.getParameter("search");
        if (search != null && !search.trim().isEmpty()) {
            String cleanSearch = search.toLowerCase().trim();
            list = list.stream()
                .filter(d -> d.getName().toLowerCase().contains(cleanSearch) 
                        || d.getCountry().toLowerCase().contains(cleanSearch)
                        || d.getDescription().toLowerCase().contains(cleanSearch))
                .collect(Collectors.toList());
        }

        sendJson(response, HttpServletResponse.SC_OK, list);
    }

    private void sendJson(HttpServletResponse response, int status, Object obj) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(obj));
    }
}
