package com.travelplanner.service;

import com.travelplanner.model.User;
import com.travelplanner.model.Destination;
import com.travelplanner.model.Trip;
import com.travelplanner.model.Itinerary;
import com.travelplanner.model.Expense;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

public class DatabaseSimulator {
    private static final List<User> users = new CopyOnWriteArrayList<>();
    private static final List<Destination> destinations = new CopyOnWriteArrayList<>();
    private static final List<Trip> trips = new CopyOnWriteArrayList<>();

    // Static initializer block to populate initial/default data
    static {
        // Create initial users
        users.add(new User("usr-admin", "admin", "admin123", "admin@travelplanner.com", "ADMIN", "System Administrator"));
        users.add(new User("usr-1", "user", "user123", "john.doe@gmail.com", "USER", "John Doe"));

        // Create standard destinations with Rupee amounts (estimated daily budgets)
        destinations.add(new Destination(
            "dest-1", "Paris", "The City of Light, famous for Eiffel Tower, museums, and romantic atmosphere.",
            "France", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80", 12000.0
        ));
        destinations.add(new Destination(
            "dest-2", "Tokyo", "A massive metropolis blending ultra-modern skyscrapers with historic temples.",
            "Japan", "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600", 15000.0
        ));
        destinations.add(new Destination(
            "dest-3", "Bali", "An Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.",
            "Indonesia", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", 4000.0
        ));
        destinations.add(new Destination(
            "dest-4", "New York", "One of the world's most vibrant cities, featuring Central Park, Broadway, and Times Square.",
            "USA", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80", 18000.0
        ));
        destinations.add(new Destination(
            "dest-5", "Rome", "Italy's capital city, famous for the Colosseum, Vatican, and its ancient history.",
            "Italy", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80", 10000.0
        ));
        destinations.add(new Destination(
            "dest-6", "Cape Town", "A port city on South Africa's southwest coast, on a peninsula beneath the imposing Table Mountain.",
            "South Africa", "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80", 7000.0
        ));
        destinations.add(new Destination(
            "dest-7", "London", "Rich history, royal palaces, world-class museums, and beautiful parks.",
            "UK", "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600", 11000.0
        ));
        destinations.add(new Destination(
            "dest-8", "Sydney", "Stunning harbor, world-famous beaches, and the Opera House.",
            "Australia", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80", 14000.0
        ));
        destinations.add(new Destination(
            "dest-9", "Cairo", "Home to the ancient pyramids, rich history, and the Sphinx.",
            "Egypt", "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80", 5000.0
        ));
        destinations.add(new Destination(
            "dest-10", "Rio de Janeiro", "Famous for Copacabana and Ipanema beaches, Christ the Redeemer, and Sugarloaf Mountain.",
            "Brazil", "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80", 8000.0
        ));
        destinations.add(new Destination(
            "dest-11", "Amsterdam", "Famous for its artistic heritage, elaborate canal system, and narrow houses.",
            "Netherlands", "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80", 10500.0
        ));

        // Create a default trip for John Doe (usr-1)
        Trip defaultTrip = new Trip("trip-1", "usr-1", "dest-1", "2026-07-01", "2026-07-04", 80000.0);
        
        // Populate itinerary (3 days)
        List<Itinerary> defaultItinerary = new ArrayList<>();
        defaultItinerary.add(new Itinerary(1, new ArrayList<>(List.of("Arrive in Paris, check in to hotel", "Evening cruise on the Seine River")), "Hotel de Ville"));
        defaultItinerary.add(new Itinerary(2, new ArrayList<>(List.of("Visit the Eiffel Tower", "Explore the Louvre Museum")), "Hotel de Ville"));
        defaultItinerary.add(new Itinerary(3, new ArrayList<>(List.of("Stroll down Champs-Élysées", "Visit Notre-Dame Cathedral", "Dinner at local bistro")), "Hotel de Ville"));
        defaultTrip.setItinerary(defaultItinerary);

        // Populate expenses in Rupees
        List<Expense> defaultExpenses = new ArrayList<>();
        defaultExpenses.add(new Expense("exp-1", "Flight tickets", 35000.0, "Transport"));
        defaultExpenses.add(new Expense("exp-2", "Hotel room (3 nights)", 25000.0, "Lodging"));
        defaultExpenses.add(new Expense("exp-3", "Louvre tickets", 3000.0, "Activities"));
        defaultTrip.setExpenses(defaultExpenses);

        trips.add(defaultTrip);
    }

    // --- User CRUD ---
    public static User getUserById(String id) {
        return users.stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
    }

    public static User getUserByUsername(String username) {
        return users.stream().filter(u -> u.getUsername().equalsIgnoreCase(username)).findFirst().orElse(null);
    }

    public static List<User> getAllUsers() {
        return new ArrayList<>(users);
    }

    public static User registerUser(User user) throws Exception {
        if (getUserByUsername(user.getUsername()) != null) {
            throw new Exception("Username already exists.");
        }
        user.setId("usr-" + UUID.randomUUID().toString().substring(0, 8));
        user.setRole("USER"); // default registration role
        users.add(user);
        return user;
    }

    public static boolean deleteUser(String id) {
        // Prevent deleting admin in-memory
        if ("usr-admin".equals(id)) {
            return false;
        }
        boolean removed = users.removeIf(u -> u.getId().equals(id));
        if (removed) {
            // Cascade delete user's trips
            trips.removeIf(t -> t.getUserId().equals(id));
        }
        return removed;
    }

    // --- Destination CRUD ---
    public static List<Destination> getAllDestinations() {
        return new ArrayList<>(destinations);
    }

    public static Destination getDestinationById(String id) {
        return destinations.stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
    }

    public static Destination addDestination(Destination destination) {
        destination.setId("dest-" + UUID.randomUUID().toString().substring(0, 8));
        destinations.add(destination);
        return destination;
    }

    public static boolean deleteDestination(String id) {
        return destinations.removeIf(d -> d.getId().equals(id));
    }

    // --- Trip CRUD ---
    public static List<Trip> getAllTrips() {
        return new ArrayList<>(trips);
    }

    public static List<Trip> getTripsByUserId(String userId) {
        List<Trip> userTrips = new ArrayList<>();
        for (Trip t : trips) {
            if (t.getUserId().equals(userId)) {
                userTrips.add(t);
            }
        }
        return userTrips;
    }

    public static Trip getTripById(String id) {
        return trips.stream().filter(t -> t.getId().equals(id)).findFirst().orElse(null);
    }

    public static Trip createTrip(Trip trip) {
        trip.setId("trip-" + UUID.randomUUID().toString().substring(0, 8));
        if (trip.getExpenses() == null) {
            trip.setExpenses(new ArrayList<>());
        }
        if (trip.getItinerary() == null) {
            trip.setItinerary(new ArrayList<>());
        }
        trips.add(trip);
        return trip;
    }

    public static boolean updateTrip(Trip updatedTrip) {
        for (int i = 0; i < trips.size(); i++) {
            if (trips.get(i).getId().equals(updatedTrip.getId())) {
                trips.set(i, updatedTrip);
                return true;
            }
        }
        return false;
    }

    public static boolean deleteTrip(String id) {
        return trips.removeIf(t -> t.getId().equals(id));
    }
}
