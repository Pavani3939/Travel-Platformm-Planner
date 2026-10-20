import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CloudSun, MapPin, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const destinations = await api.get('/destinations');
        const place = destinations.find(item => item.id === id);
        if (!place) throw new Error('Destination not found.');
        if (cancelled) return;
        setDestination(place);
        const query = encodeURIComponent(`${place.name}, ${place.country}`);
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, { headers: { Accept: 'application/json' } });
        if (!geoResponse.ok) throw new Error('Location details are temporarily unavailable.');
        const [location] = await geoResponse.json();
        if (!location) throw new Error('Could not find map coordinates for this destination.');
        const point = { lat: Number(location.lat), lon: Number(location.lon), label: location.display_name };
        if (cancelled) return;
        setCoordinates(point);
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`);
        if (weatherResponse.ok && !cancelled) setWeather(await weatherResponse.json());
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load destination details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="glass-card" style={{ textAlign: 'center', marginTop: '2rem' }}><Loader2 className="animate-spin" /> Loading destination…</div>;
  if (error || !destination) return <div className="glass-card"><p className="alert alert-error">{error || 'Destination unavailable.'}</p><Link to="/destinations" className="btn btn-secondary"><ArrowLeft size={16} /> Destinations</Link></div>;

  const current = weather?.current;
  const daily = weather?.daily;
  const map = coordinates && `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.12}%2C${coordinates.lat - 0.08}%2C${coordinates.lon + 0.12}%2C${coordinates.lat + 0.08}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lon}`;

  return <div className="animate-fade-in">
    <Link to="/destinations" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> All destinations</Link>
    <section className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
      <img src={destination.imageUrl} alt={`${destination.name}, ${destination.country}`} style={{ width: '100%', height: 'min(42vw, 380px)', minHeight: '220px', objectFit: 'cover' }} />
      <div style={{ padding: '1.5rem 2rem' }}><span className="gradient-text">{destination.country}</span><h1>{destination.name}</h1><p style={{ color: '#9ca3af', maxWidth: '70ch', margin: '0.5rem 0 1.25rem' }}>{destination.description}</p><p style={{ color: '#9ca3af', marginBottom: '1rem' }}>Typical estimate: <strong style={{ color: '#14b8a6' }}>₹{Number(destination.budgetPerDay).toLocaleString()}/day</strong></p><button className="btn btn-primary" onClick={() => navigate(`/destinations?plan=${encodeURIComponent(destination.id)}`)}><CalendarDays size={17} /> Add to a trip</button></div>
    </section>
    <div className="grid-2">
      <section className="glass-card"><h2 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}><MapPin size={20} /> Location</h2>{map ? <><iframe title={`Map of ${destination.name}`} src={map} style={{ border: 0, width: '100%', height: '300px', borderRadius: '10px' }} loading="lazy" /><a href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=12/${coordinates.lat}/${coordinates.lon}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Open map and route directions ↗</a></> : <p>Finding this destination on the map…</p>}</section>
      <section className="glass-card"><h2 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}><CloudSun size={20} /> Local weather</h2>{current ? <><p style={{ fontSize: '1.25rem' }}>{Math.round(current.temperature_2m)}°C <span style={{ color: '#9ca3af', fontSize: '.95rem' }}>feels like {Math.round(current.apparent_temperature)}°C</span></p><p style={{ color: '#9ca3af', margin: '.4rem 0 1rem' }}>Humidity {current.relative_humidity_2m}% · Wind {current.wind_speed_10m} km/h</p><div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{daily.time.map((day, i) => <div key={day} style={{ background: 'rgba(255,255,255,.04)', padding: '.8rem', borderRadius: '8px' }}><strong>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</strong><p>{Math.round(daily.temperature_2m_max[i])}° / {Math.round(daily.temperature_2m_min[i])}°</p><small style={{ color: '#9ca3af' }}>Rain {daily.precipitation_probability_max[i] ?? 0}%</small></div>)}</div><small style={{ color: '#6b7280', display: 'block', marginTop: '1rem' }}>Live forecast from Open-Meteo</small></> : <p style={{ color: '#9ca3af' }}>Weather forecast is unavailable right now.</p>}</section>
    </div>
  </div>;
}
