// src/utils/proximityDetector.js
// COMPLETE STANDALONE VERSION - No external dependencies needed

/* ===========================
   CONFIGURATION
=========================== */

const PROXIMITY_CONFIG = {
  NEARBY_DISTANCE: 10,        // 10 km
  VERY_CLOSE_DISTANCE: 2,     // 2 km
  AT_LOCATION_DISTANCE: 0.5,  // 500 meters
  CHECK_INTERVAL: 15000,      // 15 seconds
  MIN_ACCURACY: 100           // meters
};

/* ===========================
   MATH UTILITIES
=========================== */

const toRad = (deg) => (deg * Math.PI) / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null || lon1 == null ||
    lat2 == null || lon2 == null ||
    Number.isNaN(lat1) || Number.isNaN(lon1) ||
    Number.isNaN(lat2) || Number.isNaN(lon2)
  ) {
    return 0;
  }

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371.0088; // km

  return Math.round(R * c * 1000) / 1000;
};

const calculateBearing = (lat1, lon1, lat2, lon2) => {
  if (!lat1 && !lon1 && !lat2 && !lon2) return 0;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

  const θ = Math.atan2(y, x);
  return Math.round((θ * 180) / Math.PI + 360) % 360;
};

const getCompassDirection = (bearing) => {
  if (bearing == null || Number.isNaN(bearing)) return "N";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(bearing / 45) % 8];
};

/* ===========================
   LOCATION EXTRACTION
=========================== */

const extractShipmentLocation = (shipment) => {
  if (!shipment) return null;

  if (shipment.currentLocation?.latitude && shipment.currentLocation?.longitude) {
    return shipment.currentLocation;
  }

  if (shipment.location) {
    if (shipment.location.latitude && shipment.location.longitude) {
      return shipment.location;
    }
    if (shipment.location.lat && shipment.location.lng) {
      return {
        latitude: shipment.location.lat,
        longitude: shipment.location.lng
      };
    }
  }

  if (
    shipment.destinationCoordinates?.latitude &&
    shipment.destinationCoordinates?.longitude
  ) {
    return shipment.destinationCoordinates;
  }

  if (shipment.destinationLat && shipment.destinationLon) {
    return {
      latitude: shipment.destinationLat,
      longitude: shipment.destinationLon
    };
  }

  return {
    latitude: null,
    longitude: null,
    city: shipment.origin || shipment.destination,
    needsGeocoding: true
  };
};

const getProximityLevel = (distance, t) => {
  if (distance <= t.atLocationDistance) return "AT_LOCATION";
  if (distance <= t.veryCloseDistance) return "VERY_CLOSE";
  if (distance <= t.nearbyDistance) return "NEARBY";
  return "FAR";
};

/* ===========================
   CORE PROXIMITY CHECK
=========================== */

export const checkProximity = (currentLocation, shipments, options = {}) => {
  const {
    nearbyDistance = PROXIMITY_CONFIG.NEARBY_DISTANCE,
    veryCloseDistance = PROXIMITY_CONFIG.VERY_CLOSE_DISTANCE,
    atLocationDistance = PROXIMITY_CONFIG.AT_LOCATION_DISTANCE,
    minAccuracy = PROXIMITY_CONFIG.MIN_ACCURACY
  } = options;

  if (!currentLocation || !Array.isArray(shipments)) {
    return {
      nearbyShipments: [],
      veryCloseShipments: [],
      atLocationShipments: [],
      allProximityResults: [],
      isValid: false,
      error: "Invalid input"
    };
  }

  const { latitude, longitude, accuracy } = currentLocation;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return {
      nearbyShipments: [],
      veryCloseShipments: [],
      atLocationShipments: [],
      allProximityResults: [],
      isValid: false,
      error: "Invalid coordinates"
    };
  }

  if (accuracy && accuracy > minAccuracy) {
    console.warn(
      `Location accuracy is low (${accuracy}m). Results may be unreliable.`
    );
  }

  const results = {
    nearbyShipments: [],
    veryCloseShipments: [],
    atLocationShipments: [],
    allProximityResults: [],
    isValid: true,
    timestamp: Date.now()
  };

  shipments.forEach((shipment) => {
    const loc = extractShipmentLocation(shipment);
    if (!loc?.latitude || !loc?.longitude) return;

    const distance = calculateDistance(
      latitude,
      longitude,
      loc.latitude,
      loc.longitude
    );

    const bearing = calculateBearing(
      latitude,
      longitude,
      loc.latitude,
      loc.longitude
    );

    const item = {
      shipmentId: shipment.id,
      shipmentNumber: shipment.shipmentNumber || shipment.id,
      distance: Number(distance.toFixed(2)),
      direction: getCompassDirection(bearing),
      proximityLevel: getProximityLevel(distance, {
        nearbyDistance,
        veryCloseDistance,
        atLocationDistance
      }),
      shipmentData: shipment
    };

    if (distance <= atLocationDistance) results.atLocationShipments.push(item);
    else if (distance <= veryCloseDistance) results.veryCloseShipments.push(item);
    else if (distance <= nearbyDistance) results.nearbyShipments.push(item);

    results.allProximityResults.push(item);
  });

  results.allProximityResults.sort((a, b) => a.distance - b.distance);
  return results;
};

/* ===========================
   EXPORTS
=========================== */

export const geoUtils = {
  calculateDistance,
  calculateBearing,
  getCompassDirection
};

export const PROXIMITY_THRESHOLDS = PROXIMITY_CONFIG;
