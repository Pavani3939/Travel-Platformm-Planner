// Simulate a fake backend using localStorage
const initDB = () => {
  if (!localStorage.getItem('db_users')) {
    localStorage.setItem('db_users', JSON.stringify([
      { id: '1', username: 'admin', password: 'admin123', role: 'ADMIN' },
      { id: '2', username: 'user', password: 'user123', role: 'USER' }
    ]));
  }
  if (!localStorage.getItem('db_destinations')) {
    localStorage.setItem('db_destinations', JSON.stringify([
      { id: '1', name: 'Paris', country: 'France', description: 'City of light', imageUrl: 'https://images.unsplash.com/photo-1502602881460-a2be855424df?auto=format&fit=crop&q=80', estimatedDailyCost: 200 },
      { id: '2', name: 'Tokyo', country: 'Japan', description: 'Neon lights and temples', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80', estimatedDailyCost: 150 },
      { id: '3', name: 'Bali', country: 'Indonesia', description: 'Tropical paradise', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80', estimatedDailyCost: 80 }
    ]));
  }
  if (!localStorage.getItem('db_trips')) {
    localStorage.setItem('db_trips', JSON.stringify([
      {
        id: '1', userId: '2', title: 'Paris Getaway', startDate: '2024-05-01', endDate: '2024-05-07',
        destinations: [], itinerary: [], budgetCategories: [
          { name: 'Flights', allocated: 800, spent: 850 },
          { name: 'Hotels', allocated: 600, spent: 500 }
        ], totalBudget: 2000
      }
    ]));
  }
};
initDB();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseQuery = (url) => {
  const [path, query] = url.split('?');
  const params = new URLSearchParams(query || '');
  return { path, params };
};

const fakeFetch = async (method, endpoint, body = null) => {
  await delay(400); // Simulate network latency

  const { path, params } = parseQuery(endpoint);
  
  const getUsers = () => JSON.parse(localStorage.getItem('db_users'));
  const setUsers = (d) => localStorage.setItem('db_users', JSON.stringify(d));
  const getTrips = () => JSON.parse(localStorage.getItem('db_trips'));
  const setTrips = (d) => localStorage.setItem('db_trips', JSON.stringify(d));
  const getDestinations = () => JSON.parse(localStorage.getItem('db_destinations'));
  const setDestinations = (d) => localStorage.setItem('db_destinations', JSON.stringify(d));
  
  const session = JSON.parse(localStorage.getItem('db_session'));
  const currentUser = session ? getUsers().find(u => u.id === session.userId) : null;

  try {
    // --- Auth Endpoints ---
    if (path === '/auth/login' && method === 'POST') {
      const user = getUsers().find(u => u.username === body.username && u.password === body.password);
      if (!user) throw new Error('Invalid credentials');
      localStorage.setItem('db_session', JSON.stringify({ userId: user.id }));
      return { ...user, password: '' };
    }
    
    if (path === '/auth/register' && method === 'POST') {
      const users = getUsers();
      if (users.find(u => u.username === body.username)) throw new Error('Username already exists');
      const newUser = { id: Date.now().toString(), username: body.username, password: body.password, role: 'USER' };
      setUsers([...users, newUser]);
      localStorage.setItem('db_session', JSON.stringify({ userId: newUser.id }));
      return { ...newUser, password: '' };
    }
    
    if (path === '/auth/me' && method === 'GET') {
      if (!currentUser) throw new Error('Not logged in');
      return { ...currentUser, password: '' };
    }
    
    if (path === '/auth/logout' && method === 'POST') {
      localStorage.removeItem('db_session');
      return { message: 'Logged out' };
    }

    // --- Require Authentication ---
    if (!currentUser) throw new Error('Unauthorized');

    // --- Trips Endpoints ---
    if (path === '/trips') {
      if (method === 'GET') {
        const id = params.get('id');
        if (id) {
          const trip = getTrips().find(t => t.id === id && t.userId === currentUser.id);
          if (!trip) throw new Error('Trip not found');
          return trip;
        }
        return getTrips().filter(t => t.userId === currentUser.id);
      }
      if (method === 'POST') {
        const trips = getTrips();
        const newTrip = { ...body, id: Date.now().toString(), userId: currentUser.id };
        setTrips([...trips, newTrip]);
        return newTrip;
      }
      if (method === 'PUT') {
        const id = params.get('id');
        const trips = getTrips();
        const index = trips.findIndex(t => t.id === id && t.userId === currentUser.id);
        if (index === -1) throw new Error('Trip not found');
        trips[index] = { ...trips[index], ...body };
        setTrips(trips);
        return trips[index];
      }
      if (method === 'DELETE') {
        const id = params.get('id');
        const trips = getTrips().filter(t => t.id !== id || t.userId !== currentUser.id);
        setTrips(trips);
        return { message: 'Deleted' };
      }
    }

    // --- Destinations Endpoints ---
    if (path === '/destinations' && method === 'GET') {
      return getDestinations();
    }

    // --- Admin Endpoints ---
    if (currentUser.role !== 'ADMIN') throw new Error('Forbidden');

    if (path === '/admin/stats' && method === 'GET') {
      return {
        totalUsers: getUsers().length,
        totalTrips: getTrips().length,
        totalDestinations: getDestinations().length
      };
    }
    
    if (path === '/admin/users') {
      if (method === 'GET') return getUsers().map(u => ({ ...u, password: '' }));
      if (method === 'DELETE') {
        const id = params.get('id');
        setUsers(getUsers().filter(u => u.id !== id));
        return { message: 'Deleted' };
      }
    }
    
    if (path === '/admin/destinations') {
      if (method === 'POST') {
        const dests = getDestinations();
        const newDest = { ...body, id: Date.now().toString() };
        setDestinations([...dests, newDest]);
        return newDest;
      }
      if (method === 'DELETE') {
        const id = params.get('id');
        setDestinations(getDestinations().filter(d => d.id !== id));
        return { message: 'Deleted' };
      }
    }

    throw new Error('Endpoint not found: ' + endpoint);

  } catch (error) {
    console.error(`Fake API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => fakeFetch('GET', endpoint),
  post: (endpoint, body) => fakeFetch('POST', endpoint, body),
  put: (endpoint, body) => fakeFetch('PUT', endpoint, body),
  delete: (endpoint) => fakeFetch('DELETE', endpoint),
};
