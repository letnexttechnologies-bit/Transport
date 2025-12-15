import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./dashboard.css";
import "./user-dashboard.css";

// =========================
// PUSH NOTIFICATION HANDLER
// =========================
export const requestPushNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support push notifications.");
    return false;
  }

  let permission = Notification.permission;

  if (permission === "granted") {
    return true;
  }

  if (permission === "denied") {
    console.log("Please enable notifications manually in your browser settings.");
    return false;
  }

  const result = await Notification.requestPermission();
  
  if (result === "granted") {
    new Notification("🚀 Notifications Enabled!", {
      body: "You will receive shipment alerts instantly.",
      icon: "https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
    });
    localStorage.setItem("push_notifications_enabled", "true");
    return true;
  } else {
    console.log("Notifications were denied.");
    return false;
  }
};

// SEND A PUSH NOTIFICATION
export const sendPushNotification = (title, message) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "https://cdn-icons-png.flaticon.com/512/3602/3602145.png"
    });
  }
};

// =========================
// GEOLOCATION UTILITIES
// =========================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    console.log("Missing coordinates for distance calculation");
    return Infinity;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

// Indian Cities Database
const indianCities = {
  // Tamil Nadu
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  Madurai: { latitude: 9.9252, longitude: 78.1198 },
  Tiruchirappalli: { latitude: 10.7905, longitude: 78.7047 },
  Salem: { latitude: 11.6643, longitude: 78.1460 },
  Tirunelveli: { latitude: 8.7139, longitude: 77.7567 },
  Tiruppur: { latitude: 11.1085, longitude: 77.3411 },
  Erode: { latitude: 11.3410, longitude: 77.7172 },
  Vellore: { latitude: 12.9165, longitude: 79.1325 },
  Thoothukudi: { latitude: 8.7642, longitude: 78.1348 },
  Dindigul: { latitude: 10.3629, longitude: 77.9757 },
  Thanjavur: { latitude: 10.7869, longitude: 79.1378 },
  Kanchipuram: { latitude: 12.8392, longitude: 79.7015 },
  Nagercoil: { latitude: 8.1773, longitude: 77.4342 },
  Karur: { latitude: 10.9601, longitude: 78.0766 },
  
  // Karnataka
  Bangalore: { latitude: 12.9716, longitude: 77.5946 },
  Mysore: { latitude: 12.2958, longitude: 76.6394 },
  Hubli: { latitude: 15.3647, longitude: 75.1240 },
  Mangalore: { latitude: 12.9141, longitude: 74.8560 },
  Belgaum: { latitude: 15.8497, longitude: 74.4977 },
  Gulbarga: { latitude: 17.3297, longitude: 76.8343 },
  Davanagere: { latitude: 14.4669, longitude: 75.9261 },
  Bellary: { latitude: 15.1394, longitude: 76.9214 },
  Bijapur: { latitude: 16.8302, longitude: 75.7100 },
  Shimoga: { latitude: 13.9299, longitude: 75.5681 },
  Tumkur: { latitude: 13.3422, longitude: 77.1016 },
  Raichur: { latitude: 16.2076, longitude: 77.3463 },
  
  // Maharashtra
  Mumbai: { latitude: 19.0760, longitude: 72.8777 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
  Nagpur: { latitude: 21.1458, longitude: 79.0882 },
  Nashik: { latitude: 19.9975, longitude: 73.7898 },
  Aurangabad: { latitude: 19.8762, longitude: 75.3433 },
  Solapur: { latitude: 17.6599, longitude: 75.9064 },
  Amravati: { latitude: 20.9374, longitude: 77.7796 },
  Kolhapur: { latitude: 16.7050, longitude: 74.2433 },
  Sangli: { latitude: 16.8524, longitude: 74.5815 },
  Jalgaon: { latitude: 21.0077, longitude: 75.5626 },
  Nanded: { latitude: 19.1383, longitude: 77.3210 },
  Akola: { latitude: 20.7081, longitude: 77.0025 },
  Latur: { latitude: 18.4088, longitude: 76.5604 },
  Ahmednagar: { latitude: 19.0952, longitude: 74.7496 },
  
  // Delhi NCR
  Delhi: { latitude: 28.7041, longitude: 77.1025 },
  NewDelhi: { latitude: 28.6139, longitude: 77.2090 },
  Gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  Noida: { latitude: 28.5355, longitude: 77.3910 },
  Faridabad: { latitude: 28.4089, longitude: 77.3178 },
  Ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  
  // Telangana
  Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  Warangal: { latitude: 17.9689, longitude: 79.5941 },
  Nizamabad: { latitude: 18.6725, longitude: 78.0941 },
  Karimnagar: { latitude: 18.4386, longitude: 79.1288 },
  Khammam: { latitude: 17.2473, longitude: 80.1514 },
  
  // Andhra Pradesh
  Visakhapatnam: { latitude: 17.6868, longitude: 83.2185 },
  Vijayawada: { latitude: 16.5062, longitude: 80.6480 },
  Guntur: { latitude: 16.3067, longitude: 80.4365 },
  Nellore: { latitude: 14.4426, longitude: 79.9865 },
  Kurnool: { latitude: 15.8281, longitude: 78.0373 },
  Rajahmundry: { latitude: 16.9848, longitude: 81.7878 },
  Tirupati: { latitude: 13.6288, longitude: 79.4192 },
  Kadapa: { latitude: 14.4742, longitude: 78.8192 },
  Anantapur: { latitude: 14.6819, longitude: 77.6006 },
  Kakinada: { latitude: 16.9891, longitude: 82.2475 },
  
  // West Bengal
  Kolkata: { latitude: 22.5726, longitude: 88.3639 },
  Howrah: { latitude: 22.5958, longitude: 88.2636 },
  Durgapur: { latitude: 23.5204, longitude: 87.3119 },
  Asansol: { latitude: 23.6739, longitude: 86.9524 },
  Siliguri: { latitude: 26.7271, longitude: 88.3953 },
  Bardhaman: { latitude: 23.2325, longitude: 87.8616 },
  Malda: { latitude: 25.0112, longitude: 88.1413 },
  
  // Gujarat
  Ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  Surat: { latitude: 21.1702, longitude: 72.8311 },
  Vadodara: { latitude: 22.3072, longitude: 73.1812 },
  Rajkot: { latitude: 22.3039, longitude: 70.8022 },
  Bhavnagar: { latitude: 21.7645, longitude: 72.1519 },
  Jamnagar: { latitude: 22.4707, longitude: 70.0577 },
  Junagadh: { latitude: 21.5222, longitude: 70.4579 },
  Gandhinagar: { latitude: 23.2156, longitude: 72.6369 },
  Anand: { latitude: 22.5565, longitude: 72.9475 },
  Nadiad: { latitude: 22.6940, longitude: 72.8573 },
  
  // Rajasthan
  Jaipur: { latitude: 26.9124, longitude: 75.7873 },
  Jodhpur: { latitude: 26.2389, longitude: 73.0243 },
  Kota: { latitude: 25.2138, longitude: 75.8648 },
  Bikaner: { latitude: 28.0229, longitude: 73.3119 },
  Ajmer: { latitude: 26.4499, longitude: 74.6399 },
  Udaipur: { latitude: 24.5854, longitude: 73.7125 },
  Bhilwara: { latitude: 25.3463, longitude: 74.6364 },
  Alwar: { latitude: 27.5535, longitude: 76.6346 },
  Bharatpur: { latitude: 27.2153, longitude: 77.4928 },
  Sikar: { latitude: 27.6148, longitude: 75.1385 },
  
  // Uttar Pradesh
  Lucknow: { latitude: 26.8467, longitude: 80.9462 },
  Kanpur: { latitude: 26.4499, longitude: 80.3319 },
  Ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  Agra: { latitude: 27.1767, longitude: 78.0081 },
  Varanasi: { latitude: 25.3176, longitude: 82.9739 },
  Meerut: { latitude: 28.9845, longitude: 77.7064 },
  Allahabad: { latitude: 25.4358, longitude: 81.8463 },
  Bareilly: { latitude: 28.3670, longitude: 79.4304 },
  Aligarh: { latitude: 27.8974, longitude: 78.0880 },
  Moradabad: { latitude: 28.8381, longitude: 78.7769 },
  Saharanpur: { latitude: 29.9675, longitude: 77.5451 },
  Gorakhpur: { latitude: 26.7606, longitude: 83.3732 },
  Faizabad: { latitude: 26.7732, longitude: 82.1502 },
  
  // Kerala
  Thiruvananthapuram: { latitude: 8.5241, longitude: 76.9366 },
  Kochi: { latitude: 9.9312, longitude: 76.2673 },
  Kozhikode: { latitude: 11.2588, longitude: 75.7804 },
  Kollam: { latitude: 8.8932, longitude: 76.6141 },
  Thrissur: { latitude: 10.5276, longitude: 76.2144 },
  Kannur: { latitude: 11.8745, longitude: 75.3704 },
  Alappuzha: { latitude: 9.4981, longitude: 76.3388 },
  Palakkad: { latitude: 10.7867, longitude: 76.6548 },
  Kottayam: { latitude: 9.5916, longitude: 76.5222 },
  
  // Punjab
  Chandigarh: { latitude: 30.7333, longitude: 76.7794 },
  Ludhiana: { latitude: 30.9010, longitude: 75.8573 },
  Amritsar: { latitude: 31.6340, longitude: 74.8723 },
  Jalandhar: { latitude: 31.3260, longitude: 75.5762 },
  Patiala: { latitude: 30.3398, longitude: 76.3869 },
  Bathinda: { latitude: 30.2070, longitude: 74.9455 },
  Mohali: { latitude: 30.7046, longitude: 76.7179 },
  
  // Haryana
  Faridabad: { latitude: 28.4089, longitude: 77.3178 },
  Gurugram: { latitude: 28.4595, longitude: 77.0266 },
  Panipat: { latitude: 29.3909, longitude: 76.9635 },
  Ambala: { latitude: 30.3753, longitude: 76.7821 },
  Yamunanagar: { latitude: 30.1290, longitude: 77.2674 },
  Rohtak: { latitude: 28.8955, longitude: 76.6066 },
  Hisar: { latitude: 29.1492, longitude: 75.7217 },
  Karnal: { latitude: 29.6857, longitude: 76.9905 },
  
  // Madhya Pradesh
  Bhopal: { latitude: 23.2599, longitude: 77.4126 },
  Indore: { latitude: 22.7196, longitude: 75.8577 },
  Jabalpur: { latitude: 23.1815, longitude: 79.9864 },
  Gwalior: { latitude: 26.2183, longitude: 78.1828 },
  Ujjain: { latitude: 23.1793, longitude: 75.7849 },
  Sagar: { latitude: 23.8388, longitude: 78.7378 },
  Dewas: { latitude: 22.9660, longitude: 76.0555 },
  Satna: { latitude: 24.5780, longitude: 80.8305 },
  Ratlam: { latitude: 23.3340, longitude: 75.0376 },
  Rewa: { latitude: 24.5373, longitude: 81.3042 },
  
  // Bihar
  Patna: { latitude: 25.5941, longitude: 85.1376 },
  Gaya: { latitude: 24.7955, longitude: 84.9994 },
  Bhagalpur: { latitude: 25.2445, longitude: 86.9718 },
  Muzaffarpur: { latitude: 26.1209, longitude: 85.3647 },
  Darbhanga: { latitude: 26.1522, longitude: 85.8970 },
  Arrah: { latitude: 25.5560, longitude: 84.6634 },
  Begusarai: { latitude: 25.4170, longitude: 86.1301 },
  Katihar: { latitude: 25.5335, longitude: 87.5837 },
  Munger: { latitude: 25.3740, longitude: 86.4725 },
  Chapra: { latitude: 25.7805, longitude: 84.7494 },
  
  // Odisha
  Bhubaneswar: { latitude: 20.2961, longitude: 85.8245 },
  Cuttack: { latitude: 20.4625, longitude: 85.8830 },
  Rourkela: { latitude: 22.2492, longitude: 84.8828 },
  Berhampur: { latitude: 19.3149, longitude: 84.7941 },
  Sambalpur: { latitude: 21.4669, longitude: 83.9753 },
  Puri: { latitude: 19.8135, longitude: 85.8312 },
  Balasore: { latitude: 21.4927, longitude: 86.9335 },
  Baripada: { latitude: 21.9341, longitude: 86.7225 },
  
  // Assam
  Guwahati: { latitude: 26.1445, longitude: 91.7362 },
  Silchar: { latitude: 24.8333, longitude: 92.7789 },
  Dibrugarh: { latitude: 27.4728, longitude: 94.9120 },
  Jorhat: { latitude: 26.7509, longitude: 94.2037 },
  Nagaon: { latitude: 26.3506, longitude: 92.6921 },
  Tinsukia: { latitude: 27.4900, longitude: 95.3600 },
  Tezpur: { latitude: 26.6333, longitude: 92.8000 },
  
  // Jammu & Kashmir
  Srinagar: { latitude: 34.0836, longitude: 74.7973 },
  Jammu: { latitude: 32.7266, longitude: 74.8570 },
  Anantnag: { latitude: 33.7311, longitude: 75.1547 },
  Baramulla: { latitude: 34.2090, longitude: 74.3425 },
  Udhampur: { latitude: 32.9240, longitude: 75.1390 },
  
  // Uttarakhand
  Dehradun: { latitude: 30.3165, longitude: 78.0322 },
  Haridwar: { latitude: 29.9457, longitude: 78.1642 },
  Roorkee: { latitude: 29.8543, longitude: 77.8880 },
  Haldwani: { latitude: 29.2183, longitude: 79.5132 },
  Rudrapur: { latitude: 28.9831, longitude: 79.4094 },
  
  // Chhattisgarh
  Raipur: { latitude: 21.2514, longitude: 81.6296 },
  Bilaspur: { latitude: 22.0800, longitude: 82.1500 },
  Durg: { latitude: 21.1900, longitude: 81.2800 },
  Bhilai: { latitude: 21.2167, longitude: 81.4333 },
  Korba: { latitude: 22.3500, longitude: 82.6800 },
  Raigarh: { latitude: 21.9000, longitude: 83.4000 },
  
  // Jharkhand
  Ranchi: { latitude: 23.3441, longitude: 85.3096 },
  Jamshedpur: { latitude: 22.8046, longitude: 86.2029 },
  Dhanbad: { latitude: 23.7957, longitude: 86.4304 },
  Bokaro: { latitude: 23.6693, longitude: 86.1511 },
  Hazaribagh: { latitude: 23.9928, longitude: 85.3686 },
  Deoghar: { latitude: 24.4815, longitude: 86.7038 },
  
  // Goa
  Panaji: { latitude: 15.4909, longitude: 73.8278 },
  Margao: { latitude: 15.2721, longitude: 73.9582 },
  Vasco: { latitude: 15.3983, longitude: 73.8115 },
  Mapusa: { latitude: 15.5922, longitude: 73.8086 },
  
  // Himachal Pradesh
  Shimla: { latitude: 31.1048, longitude: 77.1734 },
  Solan: { latitude: 30.9045, longitude: 77.0967 },
  Dharamshala: { latitude: 32.2190, longitude: 76.3234 },
  Mandi: { latitude: 31.7086, longitude: 76.9320 },
  Kullu: { latitude: 31.9566, longitude: 77.1095 },
  
  // Tripura
  Agartala: { latitude: 23.8315, longitude: 91.2868 },
  
  // Manipur
  Imphal: { latitude: 24.8170, longitude: 93.9368 },
  
  // Meghalaya
  Shillong: { latitude: 25.5788, longitude: 91.8933 },
  
  // Nagaland
  Kohima: { latitude: 25.6747, longitude: 94.1100 },
  Dimapur: { latitude: 25.9000, longitude: 93.7333 },
  
  // Arunachal Pradesh
  Itanagar: { latitude: 27.0844, longitude: 93.6053 },
  
  // Mizoram
  Aizawl: { latitude: 23.7271, longitude: 92.7176 },
  
  // Sikkim
  Gangtok: { latitude: 27.3389, longitude: 88.6065 },
  
  // Puducherry
  Puducherry: { latitude: 11.9416, longitude: 79.8083 },
  
  // Andaman & Nicobar
  PortBlair: { latitude: 11.6234, longitude: 92.7265 },
  
  // Lakshadweep
  Kavaratti: { latitude: 10.5667, longitude: 72.6167 },
  
  // Dadra & Nagar Haveli and Daman & Diu
  Daman: { latitude: 20.3974, longitude: 72.8328 },
  Silvassa: { latitude: 20.2736, longitude: 73.0193 },
  
  // Ladakh
  Leh: { latitude: 34.1526, longitude: 77.5771 },
  Kargil: { latitude: 34.5573, longitude: 76.1262 }
};

// Get coordinates for a city
const getCityCoordinates = (cityName) => {
  if (!cityName || typeof cityName !== 'string') {
    console.log('Invalid city name:', cityName);
    return null;
  }
  
  const city = cityName.trim();
  if (!city) return null;
  
  // Direct match
  if (indianCities[city]) return indianCities[city];
  
  // Case-insensitive match
  const cityLower = city.toLowerCase();
  for (const [key, coords] of Object.entries(indianCities)) {
    if (key.toLowerCase() === cityLower) return coords;
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(indianCities)) {
    if (cityLower.includes(key.toLowerCase()) || key.toLowerCase().includes(cityLower)) {
      console.log(`Partial match found: ${city} -> ${key}`);
      return coords;
    }
  }
  
  // Try to extract city name from longer strings
  for (const [key, coords] of Object.entries(indianCities)) {
    const cityWords = cityLower.split(' ');
    for (const word of cityWords) {
      if (word.length > 3 && key.toLowerCase().includes(word)) {
        console.log(`Word match found: ${word} in ${city} -> ${key}`);
        return coords;
      }
    }
  }
  
  console.log(`No coordinates found for city: ${city}`);
  return null;
};

// Placeholder image (fallback)
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1609281715174-0e8f0b2d0b44?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b4ea3e0f9b3a6b8d0f5b01a2a3d4c9a";

// =========================
// MAIN USER DASHBOARD COMPONENT
// =========================
export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "user";

  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [nearbyShipmentsCount, setNearbyShipmentsCount] = useState(0);

  // Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    const saved = localStorage.getItem(`notificationPrefs`);
    return saved ? JSON.parse(saved) : {
      pushNotifications: true,
      proximityAlerts: true,
      bookingUpdates: true,
      soundEnabled: true,
      distanceThreshold: 10
    };
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = currentUser.id || "user";
  const userName = currentUser.name || "Unknown User";

  // Load shipments safely (defensive)
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem("shipments");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error("Error parsing shipments from storage:", err);
      return [];
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("bookings");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error("Error parsing bookings from storage:", err);
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("shipments", JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(`notificationPrefs`, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);


  // Load user notifications
  useEffect(() => {
    const userNotifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]');
    setNotifications(userNotifications);
    
    const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]')
      .filter(notif => notif.userId === userId);
    
    if (adminNotifications.length > 0) {
      setNotifications(prev => [...adminNotifications, ...prev]);
      localStorage.setItem('admin_notifications', JSON.stringify([]));
    }
  }, [userId]);

  // Save notifications
  useEffect(() => {
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);

  // Auto-close notifications dropdown
  useEffect(() => {
    if (showNotifications) {
      const timer = setTimeout(() => {
        setShowNotifications(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotifications]);

  // Auto-close filter options
  useEffect(() => {
    if (showFilterOptions) {
      const timer = setTimeout(() => {
        setShowFilterOptions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFilterOptions]);

  // Get user's current location (one-time)
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      addNotification("Geolocation is not supported by your browser", "warning");
      reject(new Error("Geolocation not supported"));
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        };
        
        console.log("Got location:", location);
        setUserLocation(location);
        setLocationAccuracy(position.coords.accuracy);
        setIsGettingLocation(false);
        
        // Find and set nearest city
        const nearestCity = findNearestCity(location.latitude, location.longitude);
        setUserLocationName(nearestCity);
        console.log("Nearest city:", nearestCity);
        
        // Immediately check for nearby shipments
        setTimeout(() => {
          checkNearbyShipments(location);
        }, 500);
        
        resolve(location);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get location";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        addNotification(errorMessage, "warning");
        console.error("Geolocation error:", error);
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
};

  // Find nearest city name
const findNearestCity = (lat, lon) => {
  let nearestCity = "Your Location";
  let minDistance = Infinity;
  
  for (const [city, coords] of Object.entries(indianCities)) {
    const distance = calculateDistance(lat, lon, coords.latitude, coords.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  // If within 50km of a city, show city name
  if (minDistance < 50) {
    return `${nearestCity} (${minDistance.toFixed(1)}km)`;
  }
  
  return "Your Location";
};

  // Check for nearby shipments - ONLY NOTIFICATIONS, NO ALERT POPUPS
const checkNearbyShipments = (location) => {
  if (!location || !location.latitude || !location.longitude) {
    console.log("No valid location provided");
    return;
  }
  
  const availableShipments = shipments.filter(s => 
    s.status !== "Delivered" && s.status !== "Cancelled" && s.origin
  );
  
  let foundShipments = 0;
  const nearbyShipmentDetails = [];
  
  availableShipments.forEach(shipment => {
    const cityCoords = getCityCoordinates(shipment.origin);
    if (!cityCoords) {
      console.log(`No coordinates found for ${shipment.origin}`);
      return;
    }
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      cityCoords.latitude,
      cityCoords.longitude
    );
    
    console.log(`Shipment ${shipment.id}: ${shipment.origin}, Distance: ${distance}km`);
    
    if (distance <= notificationPreferences.distanceThreshold) {
      foundShipments++;
      nearbyShipmentDetails.push({
        id: shipment.id,
        origin: shipment.origin,
        distance: distance
      });
    }
  });
  
  setNearbyShipmentsCount(foundShipments);
  console.log(`Found ${foundShipments} nearby shipments`);
  
  if (foundShipments > 0 && notificationPreferences.proximityAlerts) {
    // Send summary notification
    const summaryMessage = `📍 Found ${foundShipments} nearby shipment${foundShipments > 1 ? 's' : ''} within ${notificationPreferences.distanceThreshold}km!`;
    addNotification(summaryMessage, "success");
    
    // Send individual notifications for each nearby shipment
    nearbyShipmentDetails.forEach(shipment => {
      addNotification(
        `🚚 Shipment ${shipment.id} from ${shipment.origin} is ${shipment.distance.toFixed(1)}km away!`,
        "success"
      );
    });
    
    // Push notification
    if (notificationPreferences.pushNotifications && Notification.permission === "granted") {
      try {
        sendPushNotification(
          "Nearby Shipments Found!",
          `${foundShipments} shipment${foundShipments > 1 ? 's' : ''} within ${notificationPreferences.distanceThreshold}km of your location.`
        );
      } catch (error) {
        console.log("Push notification error:", error);
      }
    }
  }
};

  // Notification functions
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setShowNotifications(true);

    if (notificationPreferences.pushNotifications && Notification.permission === "granted") {
      try {
        new Notification("Truck Wala Update", {
          body: message,
          icon: "https://cdn-icons-png.flaticon.com/512/2045/2045898.png"
        });
      } catch (error) {
        console.log("Browser notification error:", error);
      }
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle preference change
  const handlePreferenceChange = (key, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'pushNotifications' && value) {
      requestPushNotificationPermission();
      addNotification("Push notifications enabled!", "success");
    }
  };

  // User stats
  const userBookings = bookings.filter((b) => b.userId === userId);
  const pendingCount = userBookings.filter((b) => b.status === "Pending").length;
  const confirmedCount = userBookings.filter((b) => b.status === "Confirmed").length;
  const cancelledCount = userBookings.filter((b) => b.status === "Cancelled").length;

  // Available shipments with proximity info
const availableShipments = shipments
  .filter((s) => s.status !== "Delivered" && s.status !== "Cancelled")
  .map(shipment => {
    let distance = null;
    let isNearby = false;
    let proximityLevel = null;
    
    if (userLocation && shipment.origin) {
      const cityCoords = getCityCoordinates(shipment.origin);
      if (cityCoords) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          cityCoords.latitude,
          cityCoords.longitude
        );
        isNearby = distance <= notificationPreferences.distanceThreshold;
        proximityLevel = distance <= 0.5 ? 'AT_LOCATION' : 
                        distance <= 2 ? 'VERY_CLOSE' : 
                        distance <= 10 ? 'NEARBY' : null;
        
        console.log(`Shipment ${shipment.id}: ${shipment.origin}, Distance: ${distance?.toFixed(1)}km, Nearby: ${isNearby}`);
      } else {
        console.log(`No coordinates for shipment origin: ${shipment.origin}`);
      }
    }
    
    return {
      ...shipment,
      distance,
      isNearby,
      proximityLevel
    };
  });

  // Actions
  const handleBookShipment = (shipmentId) => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) return;

    const newBooking = {
      id: `BK${Date.now()}`,
      shipmentId,
      userId,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      status: "Pending",
      bookedAt: new Date().toISOString(),
      shipmentDetails: shipment,
    };

    setBookings((prev) => [...prev, newBooking]);
    
    addNotification(`✅ Booking request sent for shipment ${shipmentId}! Admin will review soon.`, "success");

    const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    adminNotifications.unshift({
      id: Date.now(),
      userId: userId,
      userName: currentUser.name,
      message: `User ${currentUser.name} booked shipment ${shipmentId}`,
      type: 'booking_request',
      timestamp: new Date().toISOString(),
      read: false,
      shipmentId: shipmentId,
      bookingId: newBooking.id
    });
    localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updatedBookings = bookings.map((b) => 
        b.id === bookingId ? { ...b, status: "Cancelled" } : b
      );
      setBookings(updatedBookings);
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        addNotification(`Booking ${bookingId} cancelled successfully`, 'info');
        
        const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        adminNotifications.unshift({
          id: Date.now(),
          userId: userId,
          userName: currentUser.name,
          message: `User ${currentUser.name} cancelled booking ${bookingId}`,
          type: 'booking_cancelled',
          timestamp: new Date().toISOString(),
          read: false,
          bookingId: bookingId
        });
        localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
      }
    }
  };

  const handleViewDetails = (shipmentId) => {
    navigate(`/shipment-details/${shipmentId}?userId=${userId}&role=${role}`);
  };

  // Filtered & sorted shipments
  const filteredShipments = availableShipments
    .filter((s) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.origin.toLowerCase().includes(term) ||
        s.destination.toLowerCase().includes(term) ||
        (s.vehicleType && s.vehicleType.toLowerCase().includes(term)) ||
        s.status.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (a.isNearby && !b.isNearby) return -1;
      if (!a.isNearby && b.isNearby) return 1;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  // Check for admin updates periodically
  useEffect(() => {
    const checkAdminUpdates = () => {
      userBookings.forEach(booking => {
        const originalBooking = JSON.parse(localStorage.getItem('bookings_backup') || '[]')
          .find(b => b.id === booking.id);
        
        if (originalBooking && originalBooking.status !== booking.status) {
          let message = "";
          switch(booking.status) {
            case "Confirmed":
              message = `🎉 Your booking ${booking.id} has been CONFIRMED!`;
              break;
            case "Cancelled":
              message = `❌ Your booking ${booking.id} was CANCELLED by admin.`;
              break;
            case "In Transit":
              message = `🚚 Your booked shipment ${booking.shipmentId} is now IN TRANSIT!`;
              break;
            case "Delivered":
              message = `✅ Your booked shipment ${booking.shipmentId} has been DELIVERED!`;
              break;
          }
          
          if (message) {
            addNotification(message, booking.status === "Cancelled" ? "warning" : "success");
          }
        }
      });
      
      localStorage.setItem('bookings_backup', JSON.stringify(bookings));
    };

    const interval = setInterval(checkAdminUpdates, 10000);
    return () => clearInterval(interval);
  }, [userBookings, bookings]);

  // Helper: return best image for a shipment (dataURL, url, or fallback)
  const getShipmentImage = (shipment) => {
    if (!shipment) return PLACEHOLDER_IMG;

    // common field names: image, imageUrl, photo, picture
    const candidates = [
      shipment.image,
      shipment.imageUrl,
      shipment.photo,
      shipment.picture,
      shipment.thumbnail,
      shipment.img
    ];

    for (const c of candidates) {
      if (!c) continue;
      // If it's a valid data URL or http(s) url, return it
      if (typeof c === "string" && (c.startsWith("data:") || c.startsWith("http") || c.startsWith("//"))) {
        return c;
      }
    }

    // nested object case: shipment.image?.url
    if (shipment.image && typeof shipment.image === "object" && shipment.image.url) {
      return shipment.image.url;
    }

    return PLACEHOLDER_IMG;
  };

  // =========================
  // COMPONENTS
  // =========================

  // Notification Settings Modal
  const NotificationSettingsModal = () => {
    const [showModal, setShowModal] = useState(false);

    return (
      <>
<button 
  className="notification-settings-btn" 
  onClick={() => setShowModal(true)}
  title="Location Settings"
>
  <svg 
    width="26" 
    height="26" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 3C8.7 3 6 5.7 6 9C6 13.2 11 18.5 12 19.5C13 18.5 18 13.2 18 9C18 5.7 15.3 3 12 3Z" 
      stroke="#ffffffff" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    <circle 
      cx="12" 
      cy="9" 
      r="2.2" 
      stroke="#ffffffff"
      strokeWidth="2"
    />

  </svg>
</button>


        {showModal && (
          <div className="notification-settings-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="notification-settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-bell"></i> Notification Preferences</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="notification-section">
                  <h4>Notification Types</h4>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.pushNotifications}
                        onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                      />
                      <div className="preference-content">
                        <strong>Push Notifications</strong>
                        <small>Enable browser push notifications</small>
                      </div>
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.proximityAlerts}
                        onChange={(e) => handlePreferenceChange('proximityAlerts', e.target.checked)}
                      />
                      <div className="preference-content">
                        <strong>Proximity Alerts</strong>
                        <small>Get notified when shipments are nearby</small>
                      </div>
                    </label>
                  </div>
                  
                  <div className="preference-item">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.bookingUpdates}
                        onChange={(e) => handlePreferenceChange('bookingUpdates', e.target.checked)}
                      />
                      <div className="preference-content">
                        <strong>Booking Updates</strong>
                        <small>Updates on your booking status</small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="notification-section">
                  <h4>Proximity Settings</h4>
                  
                  <div className="preference-item">
                    <div className="preference-label">
                      <div className="preference-content">
                        <strong>Distance Threshold</strong>
                        <small>Alert me when within {notificationPreferences.distanceThreshold}km of shipments</small>
                      </div>
                      <select 
                        value={notificationPreferences.distanceThreshold}
                        onChange={(e) => handlePreferenceChange('distanceThreshold', parseInt(e.target.value))}
                        className="distance-select"
                      >
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={15}>15 km</option>
                        <option value={20}>20 km</option>
                        <option value={25}>25 km</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setShowModal(false);
                      addNotification("Notification preferences saved!", "success");
                    }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Truck wala</h1>
          <p className="header-subtitle">
            User Dashboard
            {/* {userLocation && (
              <span className="location-status-text">
                <i className="fas fa-location-dot"></i> Location: {userLocationName}
                {nearbyShipmentsCount > 0 && (
                  <span className="nearby-count-badge">
                    <i className="fas fa-bell"></i> {nearbyShipmentsCount} nearby
                  </span>
                )}
              </span>
            )} */}
          </p>
        </div>
        
        <div className="header-actions">
          {/* Location Status */}
         
          <div className="location-status-indicator">
            {isGettingLocation && (
              <span className="location-loading" title="Getting location">
                <i className="fas fa-spinner fa-spin"></i>
                <span className="status-text">Getting Location...</span>
              </span>
            )}
            
            {!userLocation && !isGettingLocation && (
              <button 
                className="location-enable-btn" 
                onClick={() => {
                  getUserLocation();
                  if (notificationPreferences.pushNotifications) {
                    requestPushNotificationPermission();
                  }
                }}
                title="Enable Location & Notifications"
              >
                <i className="fas fa-location-crosshairs"></i>
                <span className="status-text">Enable Location</span>
              </button>
            )}
            
            {userLocation && !isGettingLocation && (
              <span className="location-active" title={`${userLocationName} (Accuracy: ±${locationAccuracy}m)`}>
                <i className="fas fa-check-circle"></i>
                <span className="status-text">{userLocationName}</span>
                {nearbyShipmentsCount > 0 && (
                  <span className="nearby-count-badge">
                    <i className="fas fa-bell"></i> {nearbyShipmentsCount} nearby
                  </span>
                )}
                <button 
                  className="location-update-btn"
                  onClick={getUserLocation}
                  title="Update Location"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </span>
            )}
          </div>

          {/* Notification Settings */}
          <NotificationSettingsModal />

          {/* Notification Badge */}
          <div className="user-notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
            <div className="user-notification-symbol">
              <img src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png" alt="notifications" className="user-notification-image" />
              {unreadCount > 0 && (
                <span className="user-notification-count">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {showNotifications && (
              <div className="user-notification-dropdown">
                <div className="user-notification-dropdown-content">
                  <div className="user-notification-header">
                    <h4>Notifications</h4>
                    <div className="user-notification-header-actions">
                      <button className="user-notification-close" onClick={() => setShowNotifications(false)}>×</button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="user-notification-section">
                    <div className="user-section-title">
                      <i className="fas fa-bell"></i>
                      <span>Recent Activity</span>
                      {notifications.length > 0 && (
                        <button 
                          className="user-btn-clear-all" 
                          onClick={() => {
                            setNotifications([]);
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="user-empty-activity">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map(notification => (
                        <div key={notification.id} className="user-notification-item">
                          <div className={`user-notification-icon user-notification-${notification.type}`}>
                            {notification.type === 'success' ? '✓' : 
                             notification.type === 'warning' ? '⚠' : 'ℹ'}
                          </div>
                          <div className="user-notification-content">
                            <div className="user-notification-message">{notification.message}</div>
                            <div className="user-notification-time">
                              {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          {!notification.read && (
                            <button className="user-mark-read" onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}>
                              ✓
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">{String(userId).charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-role">{role}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button onClick={() => navigate("/")} className="user-btn user-logout-btn">
            <img src="https://cdn-icons-png.flaticon.com/512/126/126467.png" alt="logout" className="user-logout-icon" />
            Logout
          </button>
        </div>
      </header>

      {/* Statistics Section */}
      <div className="statistics-grid">
        <div className={`stat-card total ${userLocation ? 'location-active' : ''}`}>
          <div className="stat-header">
            <div className="stat-title">
              Available Shipments
              {userLocation && nearbyShipmentsCount > 0 && (
                <span className="nearby-highlight">
                  <i className="fas fa-bell"></i> {nearbyShipmentsCount} nearby
                </span>
              )}
            </div>
          </div>
          <div className="stat-value">{availableShipments.length}</div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-header">
            <div className="stat-title">My Bookings</div>
          </div>
          <div className="stat-value">{userBookings.length}</div>
          <div className="stat-subtitle">Total bookings</div>
        </div>
        
        <div className="stat-card transit">
          <div className="stat-header">
            <div className="stat-title">Confirmed</div>
          </div>
          <div className="stat-value">{confirmedCount}</div>
          <div className="stat-subtitle">Approved bookings</div>
        </div>
        
        <div className="stat-card delivered">
          <div className="stat-header">
            <div className="stat-title">Pending</div>
          </div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-subtitle">Waiting approval</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="dashboard-actions">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-bar"
            placeholder={
              userLocation && nearbyShipmentsCount > 0
                ? `Search ${nearbyShipmentsCount} nearby shipments...`
                : userLocation
                ? `Search shipments near ${userLocationName}...`
                : "Search shipment ID, origin, destination..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="action-buttons">
          <div className="filter-dropdown">
            <button className="filter" onClick={() => setShowFilterOptions(!showFilterOptions)}>
              <img src="https://cdn-icons-png.flaticon.com/512/566/566737.png" alt="filter" className="filter-icon" />
            </button>

            {showFilterOptions && (
              <div className="filter-options">
                <div onClick={() => { setSearchTerm(""); setShowFilterOptions(false); }}>All</div>
                <div onClick={() => { setSearchTerm("In Transit"); setShowFilterOptions(false); }}>In Transit</div>
                <div onClick={() => { setSearchTerm("At Warehouse"); setShowFilterOptions(false); }}>At Warehouse</div>
                <div onClick={() => { setSearchTerm("Pending"); setShowFilterOptions(false); }}>Pending</div>
                {userLocation && nearbyShipmentsCount > 0 && (
                  <div className="filter-option-nearby" onClick={() => {
                    const nearbyIds = availableShipments
                      .filter(s => s.isNearby)
                      .map(s => s.id);
                    if (nearbyIds.length > 0) {
                      setSearchTerm(nearbyIds[0]);
                    }
                    setShowFilterOptions(false);
                  }}>
                    <i className="fas fa-map-marker-alt"></i> Near Me ({nearbyShipmentsCount})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Shipments Section */}
      <div className="shipments-section">
        <div className="section-header">
          <h2 className="section-title">
            Available Shipments ({filteredShipments.length})
          </h2>
          <div className="section-actions">
            {userLocation && (
              <span className="location-indicator">
                <i className="fas fa-map-marker-alt"></i>
                {nearbyShipmentsCount > 0 
                  ? `${nearbyShipmentsCount} nearby shipment${nearbyShipmentsCount > 1 ? 's' : ''} in ${userLocationName}`
                  : `Showing shipments near ${userLocationName}`
                }
              </span>
            )}
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={getUserLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Getting Location...
                </>
              ) : (
                <>
                  <i className="fas fa-location-arrow"></i>
                  {userLocation ? 'Update Location' : 'Get Location'}
                </>
              )}
            </button>
          </div>
        </div>

        {filteredShipments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-truck"></i></div>
            <h3>No shipments available</h3>
            <p>No shipments available at the moment. Please check back later!</p>
            {!userLocation && (
              <div className="location-hint">
                <i className="fas fa-info-circle"></i>
                <p>Get your location to see nearby shipments!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="shipments-grid">
            {filteredShipments.map((shipment) => (
              <div 
                key={shipment.id} 
                className={`shipment-card ${shipment.isNearby ? 'proximity-highlight' : ''}`}
                data-shipment-id={shipment.id}
              >
                {shipment.isNearby && shipment.distance && (
                  <div className="proximity-badge">
                    <i className="fas fa-bell"></i>
                    <div>
                      <div className="distance-value">{shipment.distance.toFixed(1)}km</div>
                      <div className="distance-label">
                        {shipment.proximityLevel === 'AT_LOCATION' ? 'At Location' : 
                         shipment.proximityLevel === 'VERY_CLOSE' ? 'Very Close' : 
                         'Nearby'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="shipment-header">
                  <div className="shipment-left">
                    <div className="shipment-id">{shipment.id}</div>
                    <div className="shipment-type">{shipment.vehicleType || "Truck"}</div>
                  </div>
                  <span className={`status-badge ${
                    shipment.status === "In Transit" ? "status-transit" :
                    shipment.status === "At Warehouse" ? "status-warehouse" :
                    shipment.status === "Delivered" ? "status-delivered" :
                    "status-scheduled"
                  }`}>
                    {shipment.status}
                  </span>
                </div>

                {shipment.isNearby && (
                  <div className="proximity-ribbon">
                    <i className="fas fa-map-marker-alt"></i> {shipment.distance.toFixed(1)}km from you!
                  </div>
                )}

                {/* IMAGE SECTION - ADDED */}
                <div className="shipment-image-section">
                  <img
                    src={getShipmentImage(shipment)}
                    alt={`Shipment ${shipment.id}`}
                    className="shipment-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                  />
                </div>

                <div className="shipment-content">
                  <div className="route-info">
                    <div className="origin">
                      <div className="location-label">Origin</div>
                      <div className="location-value">{shipment.origin}</div>
                      {shipment.isNearby && shipment.distance && (
                        <div className="proximity-info">
                          <i className="fas fa-location-dot"></i>
                          <span>{shipment.distance.toFixed(1)}km away</span>
                        </div>
                      )}
                    </div>
                    <div className="route-arrow"><i className="fas fa-arrow-right"></i></div>
                    <div className="destination">
                      <div className="location-label">Destination</div>
                      <div className="location-value">{shipment.destination}</div>
                    </div>
                  </div>

                  <div className="shipment-details">
                    <div className="detail-item">
                      <div className="detail-label">Items</div>
                      <div className="detail-value">{shipment.load || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Weight</div>
                      <div className="detail-value">{shipment.weight || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Vehicle</div>
                      <div className="detail-value">{shipment.truck || shipment.vehicleType || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">ETA</div>
                      <div className="detail-value">{shipment.eta || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="shipment-actions">
                    <button className={`action-btn primary ${shipment.isNearby ? 'proximity-primary' : ''}`} 
                      onClick={() => handleViewDetails(shipment.id)}>
                      <i className="fas fa-info-circle"></i> Details
                    </button>
                    <button className={`action-btn secondary ${shipment.isNearby ? 'proximity-secondary' : ''}`} 
                      onClick={() => handleBookShipment(shipment.id)}>
                      <i className={shipment.isNearby ? 'fas fa-bell' : 'fas fa-bookmark'}></i>
                      {shipment.isNearby && shipment.distance ? `Book Now (${shipment.distance.toFixed(1)}km)` : 'Book Shipment'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      

      {/* My Bookings Section (unchanged) */}
      <div className="bookings-section">
        <div className="section-header">
          <h2 className="section-title">My Bookings ({userBookings.length})</h2>
          <div className="booking-stats">
            <span className="stat-confirmed">Confirmed: {confirmedCount}</span>
            <span className="stat-pending">Pending: {pendingCount}</span>
            <span className="stat-cancelled">Cancelled: {cancelledCount}</span>
          </div>
        </div>

        {userBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-clipboard-list"></i></div>
            <h3>No bookings yet</h3>
            <p>Book a shipment to see your bookings here!</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {userBookings.map(booking => (
              <div key={booking.id} className={`booking-card status-${booking.status.toLowerCase()}`}>
                <div className="booking-header">
                  <h3>Booking #{booking.id}</h3>
                  <span className={`status-badge ${
                    booking.status === "Pending" ? "status-scheduled" :
                    booking.status === "Confirmed" ? "status-confirmed" :
                    booking.status === "Cancelled" ? "status-cancelled" :
                    booking.status === "In Transit" ? "status-transit" :
                    "status-scheduled"
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-info">
                  <div className="booking-vehicle">
                    <strong>Shipment:</strong> {booking.shipmentDetails?.vehicleType || "N/A"}
                  </div>
                  <div className="booking-route">
                    <span className="origin">{booking.shipmentDetails?.origin || "N/A"}</span>
                    <span className="arrow">→</span>
                    <span className="destination">{booking.shipmentDetails?.destination || "N/A"}</span>
                  </div>
                  <div className="booking-date">
                    <strong>Booked:</strong> {new Date(booking.bookedAt).toLocaleDateString()}
                  </div>
                  {booking.status === "In Transit" && booking.shipmentDetails?.driver && (
                    <div className="driver-info">
                      <strong>Driver:</strong> {booking.shipmentDetails.driver.name} ({booking.shipmentDetails.driver.phone})
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {(booking.status === "Pending" || booking.status === "Confirmed") && (
                    <button className="btn-cancel" onClick={() => handleCancelBooking(booking.id)}>
                      <i className="fas fa-times"></i> Cancel Booking
                    </button>
                  )}
                  {booking.status === "Pending" && (
                    <span className="status-note">
                      <i className="fas fa-clock"></i> Waiting for admin approval
                    </span>
                  )}
                  {booking.status === "Confirmed" && (
                    <span className="status-note success">
                      <i className="fas fa-check-circle"></i> Booking confirmed by admin
                    </span>
                  )}
                  {booking.status === "Cancelled" && (
                    <span className="status-note warning">
                      <i className="fas fa-exclamation-triangle"></i> Booking cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
