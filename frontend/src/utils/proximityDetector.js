// src/utils/proximityDetector.js
// COMPLETE STANDALONE VERSION - No external dependencies needed

// Configuration constants
const PROXIMITY_CONFIG = {
  NEARBY_DISTANCE: 10,       // 10 km
  VERY_CLOSE_DISTANCE: 2,    // 2 km
  AT_LOCATION_DISTANCE: 0.5, // 500 meters
  CHECK_INTERVAL: 15000,     // 15 seconds
  MIN_ACCURACY: 100,         // meters
};

/* ===========================
   MATH UTILITIES (Self-contained)
   =========================== */

const toRad = (deg) => deg * Math.PI / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

const calculateBearing = (lat1, lon1, lat2, lon2) => {
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

const getCompassDirection = (bearing) => {
  if (bearing == null || Number.isNaN(bearing)) return 'N';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(bearing / 45) % 8;
  return directions[idx];
};

/* ===========================
   PROXIMITY DETECTION FUNCTIONS
   =========================== */

const extractShipmentLocation = (shipment) => {
  if (!shipment) return null;

  // Try different possible location data structures
  if (shipment.currentLocation) {
    if (shipment.currentLocation.latitude && shipment.currentLocation.longitude) {
      return shipment.currentLocation;
    }
  }

  if (shipment.location) {
    if (typeof shipment.location === 'object') {
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
  }

  if (shipment.destinationCoordinates) {
    if (shipment.destinationCoordinates.latitude && shipment.destinationCoordinates.longitude) {
      return shipment.destinationCoordinates;
    }
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

const getProximityLevel = (distance, thresholds) => {
  if (distance <= thresholds.atLocationDistance) return 'AT_LOCATION';
  if (distance <= thresholds.veryCloseDistance) return 'VERY_CLOSE';
  if (distance <= thresholds.nearbyDistance) return 'NEARBY';
  return 'FAR';
};

/**
 * Main function to check proximity between current location and shipments
 */
export const checkProximity = (currentLocation, shipments, options = {}) => {
  const {
    nearbyDistance = PROXIMITY_CONFIG.NEARBY_DISTANCE,
    veryCloseDistance = PROXIMITY_CONFIG.VERY_CLOSE_DISTANCE,
    atLocationDistance = PROXIMITY_CONFIG.AT_LOCATION_DISTANCE,
    minAccuracy = PROXIMITY_CONFIG.MIN_ACCURACY,
  } = options;

  // Validate input
  if (!currentLocation || !shipments || !Array.isArray(shipments)) {
    return {
      nearbyShipments: [],
      veryCloseShipments: [],
      atLocationShipments: [],
      allProximityResults: [],
      isValid: false,
      error: 'Invalid input parameters'
    };
  }

  const { latitude, longitude, accuracy } = currentLocation;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
      isNaN(latitude) || isNaN(longitude)) {
    return {
      nearbyShipments: [],
      veryCloseShipments: [],
      atLocationShipments: [],
      allProximityResults: [],
      isValid: false,
      error: 'Invalid current location coordinates'
    };
  }

  if (accuracy && accuracy > minAccuracy) {
    console.warn(`Location accuracy is low (${accuracy}m). Proximity detection may be unreliable.`);
  }

  const results = {
    nearbyShipments: [],
    veryCloseShipments: [],
    atLocationShipments: [],
    allProximityResults: [],
    currentLocation: {
      lat: latitude,
      lon: longitude,
      accuracy: accuracy || null
    },
    timestamp: Date.now(),
    isValid: true
  };

  // Process each shipment
  shipments.forEach(shipment => {
    const shipmentLocation = extractShipmentLocation(shipment);
    
    if (!shipmentLocation || !shipmentLocation.latitude || !shipmentLocation.longitude) {
      console.warn(`Shipment ${shipment.id || 'unknown'} has invalid location data`);
      return;
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      shipmentLocation.latitude,
      shipmentLocation.longitude
    );

    const bearing = calculateBearing(
      latitude,
      longitude,
      shipmentLocation.latitude,
      shipmentLocation.longitude
    );

    const proximityResult = {
      shipmentId: shipment.id,
      shipmentNumber: shipment.shipmentNumber || shipment.id,
      status: shipment.status,
      distance: parseFloat(distance.toFixed(2)),
      destination: shipment.destination || shipment.destinationCity,
      origin: shipment.origin || shipment.originCity,
      coordinates: {
        shipmentLat: shipmentLocation.latitude,
        shipmentLon: shipmentLocation.longitude,
        currentLat: latitude,
        currentLon: longitude
      },
      bearing: bearing,
      direction: getCompassDirection(bearing),
      proximityLevel: getProximityLevel(distance, {
        nearbyDistance,
        veryCloseDistance,
        atLocationDistance
      }),
      lastUpdated: shipment.updatedAt || shipment.createdAt,
      shipmentData: shipment
    };

    // Categorize based on distance
    if (distance <= atLocationDistance) {
      results.atLocationShipments.push(proximityResult);
      proximityResult.proximityStatus = 'ARRIVED';
    } else if (distance <= veryCloseDistance) {
      results.veryCloseShipments.push(proximityResult);
      proximityResult.proximityStatus = 'VERY_CLOSE';
    } else if (distance <= nearbyDistance) {
      results.nearbyShipments.push(proximityResult);
      proximityResult.proximityStatus = 'NEARBY';
    }

    results.allProximityResults.push(proximityResult);
  });

  // Sort results by distance (closest first)
  results.nearbyShipments.sort((a, b) => a.distance - b.distance);
  results.veryCloseShipments.sort((a, b) => a.distance - b.distance);
  results.atLocationShipments.sort((a, b) => a.distance - b.distance);
  results.allProximityResults.sort((a, b) => a.distance - b.distance);

  return results;
};

/**
 * React hook for continuous proximity monitoring
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export const useProximityDetection = (shipments, geolocation, options = {}) => {
  const [proximityResults, setProximityResults] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const checkInterval = useRef(null);
  const previousResults = useRef(null);

  // Start proximity monitoring
  const startMonitoring = useCallback(() => {
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }

    const checkProximityNow = () => {
      if (!geolocation?.location || !shipments?.length) return;

      const results = checkProximity(geolocation.location, shipments, options);
      setProximityResults(results);

      // Detect new alerts
      if (previousResults.current) {
        const newAlerts = detectNewAlerts(results, previousResults.current);
        if (newAlerts.length > 0) {
          setNearbyAlerts(prev => [...newAlerts, ...prev.slice(0, 10)]);
        }
      }

      previousResults.current = results;
    };

    checkProximityNow();
    
    checkInterval.current = setInterval(
      checkProximityNow,
      options.checkInterval || PROXIMITY_CONFIG.CHECK_INTERVAL
    );

    setIsMonitoring(true);
  }, [shipments, geolocation, options]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
      checkInterval.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring
  useEffect(() => {
    if (geolocation?.location && shipments?.length > 0 && !isMonitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [geolocation?.location, shipments, startMonitoring, stopMonitoring, isMonitoring]);

  return {
    proximityResults,
    nearbyAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts: () => setNearbyAlerts([])
  };
};

/**
 * Detect new proximity alerts
 */
const detectNewAlerts = (currentResults, previousResults) => {
  const newAlerts = [];

  // Check for new nearby shipments
  currentResults.nearbyShipments.forEach(currentShipment => {
    const previousMatch = previousResults.nearbyShipments.find(
      s => s.shipmentId === currentShipment.shipmentId
    );

    if (!previousMatch) {
      newAlerts.push({
        type: 'NEARBY_SHIPMENT',
        shipmentId: currentShipment.shipmentId,
        shipmentNumber: currentShipment.shipmentNumber,
        distance: currentShipment.distance,
        direction: currentShipment.direction,
        timestamp: Date.now(),
        message: `Nearby shipment ${currentShipment.shipmentNumber} is ${currentShipment.distance}km away`
      });
    } else if (currentShipment.distance < previousMatch.distance) {
      const distanceDiff = previousMatch.distance - currentShipment.distance;
      if (distanceDiff > 0.5) {
        newAlerts.push({
          type: 'APPROACHING_SHIPMENT',
          shipmentId: currentShipment.shipmentId,
          shipmentNumber: currentShipment.shipmentNumber,
          distance: currentShipment.distance,
          previousDistance: previousMatch.distance,
          timestamp: Date.now(),
          message: `Shipment ${currentShipment.shipmentNumber} is now ${currentShipment.distance}km away (getting closer)`
        });
      }
    }
  });

  return newAlerts;
};

/**
 * Filter shipments by proximity for display
 */
export const filterShipmentsByProximity = (shipments, currentLocation, maxDistance = 10) => {
  if (!currentLocation || !shipments?.length) return [];

  return shipments.filter(shipment => {
    const shipmentLocation = extractShipmentLocation(shipment);
    if (!shipmentLocation || !shipmentLocation.latitude || !shipmentLocation.longitude) return false;

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      shipmentLocation.latitude,
      shipmentLocation.longitude
    );

    return distance <= maxDistance;
  });
};

/**
 * Get nearest shipment to current location
 */
export const getNearestShipment = (shipments, currentLocation) => {
  if (!currentLocation || !shipments?.length) return null;

  let nearest = null;
  let minDistance = Infinity;

  shipments.forEach(shipment => {
    const shipmentLocation = extractShipmentLocation(shipment);
    if (!shipmentLocation || !shipmentLocation.latitude || !shipmentLocation.longitude) return;

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      shipmentLocation.latitude,
      shipmentLocation.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        ...shipment,
        distance,
        direction: getCompassDirection(
          calculateBearing(
            currentLocation.latitude,
            currentLocation.longitude,
            shipmentLocation.latitude,
            shipmentLocation.longitude
          )
        )
      };
    }
  });

  return nearest;
};

/**
 * Format proximity message for display
 */
export const formatProximityMessage = (proximityResult) => {
  if (!proximityResult) return '';

  const { distance, direction, shipmentNumber, proximityLevel } = proximityResult;

  const messages = {
    AT_LOCATION: `You have arrived at shipment ${shipmentNumber}`,
    VERY_CLOSE: `Shipment ${shipmentNumber} is very close (${distance}km ${direction})`,
    NEARBY: `Shipment ${shipmentNumber} is nearby (${distance}km ${direction})`,
    FAR: `Shipment ${shipmentNumber} is ${distance}km away ${direction}`
  };

  return messages[proximityLevel] || `Shipment ${shipmentNumber}: ${distance}km ${direction}`;
};

// Export utility functions for other modules to use
export const geoUtils = {
  calculateDistance,
  calculateBearing,
  getCompassDirection
};

// Export constants
export const PROXIMITY_THRESHOLDS = PROXIMITY_CONFIG;