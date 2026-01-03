// src/utils/geolocation.js

// ============================================
// GEOCODING UTILITIES
// ============================================

/* ===========================
   Helper: calculations
   =========================== */

export const toRad = (deg) => deg * Math.PI / 180;

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null || lon1 == null ||
    lat2 == null || lon2 == null ||
    Number.isNaN(lat1) || Number.isNaN(lon1) ||
    Number.isNaN(lat2) || Number.isNaN(lon2)
  ) return 0;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371.0088; // km
  const km = R * c;
  return Math.round(km * 1000) / 1000;
};

// ADD THIS MISSING FUNCTION
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  if (!lat1 && !lon1 && !lat2 && !lon2) return 0;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  return Math.round(bearing);
};

// ADD THIS MISSING FUNCTION
export const getCompassDirection = (bearing) => {
  if (bearing == null || Number.isNaN(bearing)) return 'N';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(bearing / 45) % 8;
  return directions[idx];
};

export const formatCoordinates = (lat, lon, precision = 4) => {
  if (lat == null || lon == null) return { lat: null, lon: null, dms: null };
  return {
    lat: lat.toFixed(precision),
    lon: lon.toFixed(precision),
    dms: convertToDMS(lat, lon)
  };
};

const convertToDMS = (lat, lon) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  const latAbs = Math.abs(lat);
  const lonAbs = Math.abs(lon);

  const latDeg = Math.floor(latAbs);
  const latMin = Math.floor((latAbs - latDeg) * 60);
  const latSec = ((latAbs - latDeg - latMin / 60) * 3600).toFixed(1);

  const lonDeg = Math.floor(lonAbs);
  const lonMin = Math.floor((lonAbs - lonDeg) * 60);
  const lonSec = ((lonAbs - lonDeg - lonMin / 60) * 3600).toFixed(1);

  return {
    lat: `${latDeg}°${latMin}'${latSec}"${latDir}`,
    lon: `${lonDeg}°${lonMin}'${lonSec}"${lonDir}`
  };
};

export const calculateETA = (distanceKm, speedKmh) => {
  if (!distanceKm || !speedKmh || speedKmh <= 0) return null;
  const hours = distanceKm / speedKmh;
  if (hours >= 1) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  } else {
    const minutes = Math.round(hours * 60);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
  }
};

/* ===========================
   Indian Cities DB
   =========================== */

export const indianCities = {
  Erode: { latitude: 11.3410, longitude: 77.7172, accuracy: 50, state: 'Tamil Nadu' },
  Salem: { latitude: 11.6643, longitude: 78.1460, accuracy: 50, state: 'Tamil Nadu' },
  Coimbatore: { latitude: 11.0168, longitude: 76.9558, accuracy: 50, state: 'Tamil Nadu' },
  Chennai: { latitude: 13.0827, longitude: 80.2707, accuracy: 50, state: 'Tamil Nadu' },
  Madurai: { latitude: 9.9252, longitude: 78.1198, accuracy: 50, state: 'Tamil Nadu' },
  Mumbai: { latitude: 19.0760, longitude: 72.8777, accuracy: 50, state: 'Maharashtra' },
  Delhi: { latitude: 28.7041, longitude: 77.1025, accuracy: 50, state: 'Delhi' },
  Bangalore: { latitude: 12.9716, longitude: 77.5946, accuracy: 50, state: 'Karnataka' },
};

export const getCoordsFromCity = (cityName) => {
  if (!cityName) return null;
  const clean = cityName.trim();
  if (indianCities[clean]) return indianCities[clean];

  const lower = clean.toLowerCase();
  for (const [city, coords] of Object.entries(indianCities)) {
    if (city.toLowerCase() === lower || city.toLowerCase().includes(lower) || lower.includes(city.toLowerCase())) {
      return coords;
    }
  }

  const hash = clean.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    latitude: 11.0 + (hash % 100) / 1000,
    longitude: 77.5 + ((hash * 3) % 100) / 1000,
    accuracy: 10000,
    isFallback: true,
    estimatedCity: clean
  };
};

/* ===========================
   Reverse Geocoding (OSM Nominatim)
   =========================== */

export const reverseGeocode = async (latitude, longitude) => {
  try {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Invalid coordinates');
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TruckWala/1.0 (truckwala@example.com)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const address = data.address || {};

    const locationName =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      address.state_district ||
      address.state ||
      'Near You';

    const fullAddressParts = [];
    if (address.road) fullAddressParts.push(address.road);
    if (address.suburb) fullAddressParts.push(address.suburb);
    if (address.city || address.town || address.village) fullAddressParts.push(address.city || address.town || address.village);
    if (address.state) fullAddressParts.push(address.state);
    if (address.country) fullAddressParts.push(address.country);

    return {
      name: locationName,
      fullAddress: fullAddressParts.join(', '),
      city: address.city || address.town || address.village || null,
      state: address.state || null,
      country: address.country || null,
      postcode: address.postcode || null,
      road: address.road || null,
      suburb: address.suburb || null,
      raw: address
    };
  } catch (err) {
    const tamilNaduCities = {
      Erode: { lat: 11.3410, lon: 77.7172, radius: 15 },
      Salem: { lat: 11.6643, lon: 78.1460, radius: 20 },
      Coimbatore: { lat: 11.0168, lon: 76.9558, radius: 25 },
      Tiruppur: { lat: 11.1085, lon: 77.3411, radius: 15 },
      Chennai: { lat: 13.0827, lon: 80.2707, radius: 30 },
      Madurai: { lat: 9.9252, lon: 78.1198, radius: 25 }
    };

    for (const [city, info] of Object.entries(tamilNaduCities)) {
      const d = calculateDistance(latitude, longitude, info.lat, info.lon);
      if (d <= info.radius) {
        return {
          name: city,
          fullAddress: `${city}, Tamil Nadu, India`,
          city,
          state: 'Tamil Nadu',
          country: 'India',
          isFallback: true
        };
      }
    }

    return {
      name: 'Your Location',
      fullAddress: `Lat: ${Number(latitude).toFixed(4)}, Lon: ${Number(longitude).toFixed(4)}`,
      city: null,
      state: null,
      country: null,
      isFallback: true
    };
  }
};