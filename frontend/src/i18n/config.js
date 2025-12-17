import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations directly (no JSON imports needed)
const resources = {
  en: {    
    translation: {
      // Dashboard
      "dashboard.title": "Truck Wala",
      "dashboard.subtitle": "Admin Dashboard",
      "dashboard.userDashboard": "User Dashboard",
      "dashboard.logout": "Logout",
      "dashboard.newShipment": "+ New Shipment",
      "dashboard.searchPlaceholder": "Search shipment ID, origin, destination...",
      
      // Statistics
      "stats.totalShipments": "Total Shipments",
      "stats.activeShipments": "Active Shipments",
      "stats.inTransit": "In Transit",
      "stats.pendingBookings": "Pending Bookings",
      "stats.acrossAllLocations": "Across all locations",
      "stats.currentlyActive": "Currently active",
      "stats.onTheMove": "On the move",
      "stats.needApproval": "Need approval",
      
      // Tabs
      "tabs.shipments": "Shipments",
      "tabs.bookings": "Bookings",
      
      // Shipments
      "shipments.allShipments": "All Shipments",
      "shipments.refresh": "Refresh",
      "shipments.noShipments": "No shipments found. Create your first shipment to get started!",
      "shipments.origin": "Origin",
      "shipments.destination": "Destination",
      "shipments.deliveryProgress": "Delivery Progress",
      "shipments.items": "Items",
      "shipments.weight": "Weight",
      "shipments.vehicle": "Vehicle",
      "shipments.eta": "ETA",
      "shipments.details": "Details",
      "shipments.edit": "Edit",
      "shipments.delete": "Delete",
      "shipments.created": "Created",
      
      // Bookings
      "bookings.allBookings": "All Bookings",
      "bookings.noBookings": "No bookings found yet.",
      "bookings.user": "User",
      "bookings.container": "CONTAINER",
      "bookings.vehicleName": "VEHICLE NAME",
      "bookings.booked": "Booked",
      "bookings.confirm": "Confirm",
      "bookings.cancel": "Cancel",
      
      // Form
      "form.addNewShipment": "Add New Shipment",
      "form.back": "Back",
      "form.saveShipment": "Save Shipment",
      "form.shipmentImage": "Shipment Image",
      "form.shipmentInfo": "Shipment Information",
      "form.dragDrop": "Drag & Drop or Click to Upload",
      "form.browseFiles": "Browse Files",
      "form.vehicleType": "Vehicle Type",
      "form.status": "Status",
      "form.origin": "Origin",
      "form.destination": "Destination",
      "form.loadDescription": "Load Description",
      "form.truckType": "Truck Type",
      "form.container": "Container",
      "form.priorityShipment": "Priority Shipment",
      "form.required": "required",
      
      // Notifications
      "notifications.title": "Notifications",
      "notifications.clearAll": "Clear All",
      "notifications.noNotifications": "No new notifications",
      
      // Status
      "status.scheduled": "Scheduled",
      "status.inTransit": "In Transit",
      "status.atWarehouse": "At Warehouse",
      "status.delivered": "Delivered",
      "status.confirmed": "Confirmed",
      "status.cancelled": "Cancelled",
      "status.pending": "Pending",
      
      // Buttons
      "buttons.confirm": "Confirm",
      "buttons.cancel": "Cancel",
      "buttons.delete": "Delete",
      "buttons.save": "Save",

      form: {
        shipmentImage: "Shipment Image",
        imagePreviewAlt: "Preview",
        removeImage: "Remove image",
        dragDropOrClick: "Drag & Drop or Click to Upload",
        supportedFormats: "Supports: JPEG, PNG, GIF (Max 5MB)",
        browseFiles: "Browse Files",
        shipmentInformation: "Shipment Information",
        vehicleType: "Vehicle Type",
        vehicleTypePlaceholder: "Heavy Machinery Transport",
        status: "Status",
        statusScheduled: "Scheduled",
        statusInTransit: "In Transit",
        statusAtWarehouse: "At Warehouse",
        statusDelivered: "Delivered",
        origin: "Origin",
        originPlaceholder: "Type or select from suggestions",
        destination: "Destination",
        destinationPlaceholder: "Type or select from suggestions",
        eta: "ETA",
        etaPlaceholder: "2 days",
        loadDescription: "Load Description",
        loadPlaceholder: "Construction Equipment",
        truckType: "Truck Type",
        truckPlaceholder: "Freightliner Cascadia",
        container: "Container",
        containerPlaceholder: "40ft Flatbed",
        weight: "Weight",
        weightPlaceholder: "20,000 kg",
        priorityShipment: "Priority Shipment",
      }

      // location
      
    }
  },
  hi: {
    translation: {
      // Dashboard
      "dashboard.title": "ट्रक वाला",
      "dashboard.subtitle": "एडमिन डैशबोर्ड",
      "dashboard.logout": "लॉगआउट",
      "dashboard.newShipment": "+ नया शिपमेंट",
      "dashboard.searchPlaceholder": "शिपमेंट आईडी, मूल, गंतव्य खोजें...",
      
      // Statistics
      "stats.totalShipments": "कुल शिपमेंट",
      "stats.activeShipments": "सक्रिय शिपमेंट",
      "stats.inTransit": "ट्रांजिट में",
      "stats.pendingBookings": "लंबित बुकिंग",
      "stats.acrossAllLocations": "सभी स्थानों में",
      "stats.currentlyActive": "वर्तमान में सक्रिय",
      "stats.onTheMove": "चल रहा है",
      "stats.needApproval": "अनुमोदन की आवश्यकता",
      
      // Tabs
      "tabs.shipments": "शिपमेंट",
      "tabs.bookings": "बुकिंग",
      
      // Shipments
      "shipments.allShipments": "सभी शिपमेंट",
      "shipments.refresh": "रिफ्रेश करें",
      "shipments.noShipments": "कोई शिपमेंट नहीं मिला। शुरू करने के लिए अपना पहला शिपमेंट बनाएं!",
      "shipments.origin": "मूल स्थान",
      "shipments.destination": "गंतव्य",
      "shipments.deliveryProgress": "डिलीवरी प्रगति",
      "shipments.items": "आइटम",
      "shipments.weight": "वजन",
      "shipments.vehicle": "वाहन",
      "shipments.eta": "अनुमानित समय",
      "shipments.details": "विवरण",
      "shipments.edit": "संपादित करें",
      "shipments.delete": "हटाएं",
      "shipments.created": "बनाया गया",
      form: {
      shipmentImage: "शिपमेंट छवि",
      imagePreviewAlt: "पूर्वावलोकन",
      removeImage: "छवि हटाएं",
      dragDropOrClick: "खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें",
      supportedFormats: "समर्थित: JPEG, PNG, GIF (अधिकतम 5MB)",
      browseFiles: "फ़ाइलें ब्राउज़ करें",
      shipmentInformation: "शिपमेंट जानकारी",
      vehicleType: "वाहन प्रकार",
      vehicleTypePlaceholder: "भारी मशीनरी परिवहन",
      status: "स्थिति",
      statusScheduled: "निर्धारित",
      statusInTransit: "ट्रांजिट में",
      statusAtWarehouse: "गोदाम में",
      statusDelivered: "डिलीवर किया गया",
      origin: "मूल स्थान",
      originPlaceholder: "टाइप करें या सुझावों में से चुनें",
      destination: "गंतव्य",
      destinationPlaceholder: "टाइप करें या सुझावों में से चुनें",
      eta: "अनुमानित समय",
      etaPlaceholder: "2 दिन",
      loadDescription: "लोड विवरण",
      loadPlaceholder: "निर्माण उपकरण",
      truckType: "ट्रक प्रकार",
      truckPlaceholder: "फ्रेटलाइनर कैस्केडिया",
      container: "कंटेनर",
      containerPlaceholder: "40फीट फ्लैटबेड",
      weight: "वजन",
      weightPlaceholder: "20,000 किग्रा",
      priorityShipment: "प्राथमिकता शिपमेंट"
    }


    }
  },
  ta: {
    translation: {
      // Dashboard
      "dashboard.title": "டிரக் வாலா",
      "dashboard.subtitle": "நிர்வாக டாஷ்போர்டு",
      "dashboard.logout": "வெளியேறு",
      "dashboard.newShipment": "+ புதிய அனுப்பீடு",
      "dashboard.searchPlaceholder": "அனுப்பீடு ஐடி, தொடக்க இடம், இலக்கு இடம் தேடு...",


       "form.addNewShipment": "புதிய அனுப்பீட்டைச் சேர்க்கவும்",
    "form.back": "பின்செல்",
    "form.saveShipment": "அனுப்பீட்டைச் சேமிக்கவும்",
    "form.shipmentImage": "அனுப்பீடு படம்",
      
      // Statistics
      "stats.totalShipments": "மொத்த அனுப்பீடுகள்",
      "stats.activeShipments": "செயலில் உள்ள அனுப்பீடுகள்",
      "stats.inTransit": "போக்குவரத்தில்",
      "stats.pendingBookings": "நிலுவையில் உள்ள முன்பதிவுகள்",
      "stats.acrossAllLocations": "அனைத்து இடங்களிலும்",
      "stats.currentlyActive": "தற்போது செயலில்",
      "stats.onTheMove": "நகரும் நிலையில்",
      "stats.needApproval": "அங்கீகாரம் தேவை",
      
      // Tabs
      "tabs.shipments": "அனுப்பீடுகள்",
      "tabs.bookings": "முன்பதிவுகள்",
      
      // Shipments
      "shipments.allShipments": "அனைத்து அனுப்பீடுகள்",
      "shipments.refresh": "புதுப்பிக்கவும்",
      "shipments.noShipments": "அனுப்பீடுகள் எதுவும் கிடைக்கவில்லை. தொடங்க உங்கள் முதல் அனுப்பீட்டை உருவாக்கவும்!",
      "shipments.origin": "தொடக்க இடம்",
      "shipments.destination": "இலக்கு இடம்",
      "shipments.deliveryProgress": "டெலிவரி முன்னேற்றம்",
      "shipments.items": "பொருட்கள்",
      "shipments.weight": "எடை",
      "shipments.vehicle": "வாகனம்",
      "shipments.eta": "எட்டா",
      "shipments.details": "விவரங்கள்",
      "shipments.edit": "திருத்து",
      "shipments.delete": "நீக்கு",
      "shipments.created": "உருவாக்கப்பட்டது",

      form: {
      shipmentImage: "அனுப்பீடு படம்",
      imagePreviewAlt: "முன்னோட்டம்",
      removeImage: "படத்தை அகற்று",
      dragDropOrClick: "இழுத்து விடவும் அல்லது பதிவேற்ற கிளிக் செய்யவும்",
      supportedFormats: "ஆதரவு: JPEG, PNG, GIF (அதிகபட்சம் 5MB)",
      browseFiles: "கோப்புகளை உலாவு",
      shipmentInformation: "அனுப்பீடு தகவல்",
      vehicleType: "வாகன வகை",
      vehicleTypePlaceholder: "கனரக இயந்திர போக்குவரத்து",
      status: "நிலை",
      statusScheduled: "திட்டமிடப்பட்டது",
      statusInTransit: "போக்குவரத்தில்",
      statusAtWarehouse: "கிடங்கில்",
      statusDelivered: "வழங்கப்பட்டது",
      origin: "தொடக்க இடம்",
      originPlaceholder: "தட்டச்சு செய்யவும் அல்லது பரிந்துரைகளிலிருந்து தேர்வு செய்யவும்",
      destination: "இலக்கு இடம்",
      destinationPlaceholder: "தட்டச்சு செய்யவும் அல்லது பரிந்துரைகளிலிருந்து தேர்வு செய்யவும்",
      eta: "மதிப்பீடு நேரம்",
      etaPlaceholder: "2 நாட்கள்",
      loadDescription: "சுமை விளக்கம்",
      loadPlaceholder: "கட்டுமான உபகரணங்கள்",
      truckType: "லாரி வகை",
      truckPlaceholder: "ஃப்ரைட்லைனர் காஸ்கேடியா",
      container: "கண்டெய்னர்",
      containerPlaceholder: "40அடி ஃப்ளாட்பெட்",
      weight: "எடை",
      weightPlaceholder: "20,000 கிலோ",
      priorityShipment: "முன்னுரிமை அனுப்பீடு"
    }


    }
  },
  te: {
    translation: {
      // Dashboard
      "dashboard.title": "ట్రక్ వాలా",
      "dashboard.subtitle": "అడ్మిన్ డాష్బోర్డ్",
      "dashboard.logout": "లాగ్అవుట్",
      "dashboard.newShipment": "+ కొత్త షిప్మెంట్",
      "dashboard.searchPlaceholder": "షిప్మెంట్ ఐడి, ప్రారంభ స్థానం, గమ్యం శోధించండి...",
      
      // Statistics
      "stats.totalShipments": "మొత్తం షిప్మెంట్లు",
      "stats.activeShipments": "చురుకైన షిప్మెంట్లు",
      "stats.inTransit": "ట్రాన్సిట్‌లో",
      "stats.pendingBookings": "పెండింగ్ బుకింగ్‌లు",
      "stats.acrossAllLocations": "అన్ని స్థానాలలో",
      "stats.currentlyActive": "ప్రస్తుతం చురుకుగా",
      "stats.onTheMove": "కదులుతున్న",
      "stats.needApproval": "ఆమోదం అవసరం",


      "form.addNewShipment": "కొత్త షిప్మెంట్ జోడించండి",
    "form.back": "వెనుకకు",
    "form.saveShipment": "షిప్మెంట్ సేవ్ చేయండి",
    "form.shipmentImage": "షిప్మెంట్ చిత్రం",
      
      // Tabs
      "tabs.shipments": "షిప్మెంట్లు",
      "tabs.bookings": "బుకింగ్‌లు",
      
      // Shipments
      "shipments.allShipments": "అన్ని షిప్మెంట్లు",
      "shipments.refresh": "రిఫ్రెష్ చేయండి",
      "shipments.noShipments": "షిప్మెంట్లు ఏవీ లేవు. ప్రారంభించడానికి మీ మొదటి షిప్మెంట్‌ని సృష్టించండి!",
      "shipments.origin": "ప్రారంభ స్థానం",
      "shipments.destination": "గమ్యం",
      "shipments.deliveryProgress": "డెలివరీ పురోగతి",
      "shipments.items": "వస్తువులు",
      "shipments.weight": "బరువు",
      "shipments.vehicle": "వాహనం",
      "shipments.eta": "ఇటీవలి సమయం",
      "shipments.details": "వివరాలు",
      "shipments.edit": "సవరించు",
      "shipments.delete": "తొలగించు",
      "shipments.created": "సృష్టించబడినది",

      form: {
      shipmentImage: "షిప్‌మెంట్ చిత్రం",
      imagePreviewAlt: "ముందస్తు వీక్షణ",
      removeImage: "చిత్రాన్ని తొలగించు",
      dragDropOrClick: "డ్రాగ్ & డ్రాప్ చేయండి లేదా అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
      supportedFormats: "మద్దతు ఉన్నవి: JPEG, PNG, GIF (గరిష్టంగా 5MB)",
      browseFiles: "ఫైళ్లను బ్రౌజ్ చేయండి",
      shipmentInformation: "షిప్‌మెంట్ సమాచారం",
      vehicleType: "వాహన రకం",
      vehicleTypePlaceholder: "భారీ యంత్రాల రవాణా",
      status: "స్థితి",
      statusScheduled: "షెడ్యూల్ చేయబడింది",
      statusInTransit: "ట్రాన్సిట్‌లో",
      statusAtWarehouse: "గోదాములో",
      statusDelivered: "డెలివరీ అయింది",
      origin: "మూల స్థానం",
      originPlaceholder: "టైప్ చేయండి లేదా సూచనల నుండి ఎంచుకోండి",
      destination: "గమ్యం",
      destinationPlaceholder: "టైప్ చేయండి లేదా సూచనల నుండి ఎంచుకోండి",
      eta: "అంచనా సమయం",
      etaPlaceholder: "2 రోజులు",
      loadDescription: "లోడ్ వివరణ",
      loadPlaceholder: "నిర్మాణ పరికరాలు",
      truckType: "ట్రక్ రకం",
      truckPlaceholder: "ఫ్రైట్‌లైనర్ కాస్కేడియా",
      container: "కంటైనర్",
      containerPlaceholder: "40అడుగుల ఫ్లాట్‌బెడ్",
      weight: "బరువు",
      weightPlaceholder: "20,000 కేజీలు",
      priorityShipment: "ప్రాధాన్యత షిప్‌మెంట్"
    }

    }
  },
  es: {
    translation: {
      "dashboard.title": "Truck Wala",
      "dashboard.subtitle": "Panel de Administración",
      "dashboard.logout": "Cerrar Sesión",
      "dashboard.newShipment": "+ Nuevo Envío",
      "dashboard.searchPlaceholder": "Buscar ID de envío, origen, destino..."
    }
  }
  
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;