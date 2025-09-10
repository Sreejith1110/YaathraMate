export interface SafetyAlert {
  id: number;
  title: string;
  location: string;
  description: string;
  level: string;
  scamType: string;
  category: string;
  timestamp: string;
}

export interface FairPrice {
  id: number;
  item: string;
  category: string;
  fairPrice: number;
  location: string; // Added location
  city: string; // Added city
}

export interface CommunityReport {
  id: number;
  report: string;
  location: string;
  city: string;
  country: string;
  category: string;
  timestamp: string;
}

export interface Suggestion {
  id: number;
  title: string;
  description: string;
  category: string;
  upvotes: number;
}

export const dummyData = {
  user: {
    qrCode:
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=12345",
    nationality: "India",
    idNumber: "IND1234567890",
    blockchainVerified: true,
  },

  safetyAlerts: [
    {
      id: 1,
      title: "Pickpocketing in crowded market",
      location: "Delhi",
      description: "High risk in Chandni Chowk during weekends.",
      level: "High",
      scamType: "Theft",
      category: "Personal Safety",
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: 2,
      title: "Fake tour guide scam",
      location: "Agra",
      description: "Unlicensed guides offer overpriced tours.",
      level: "Medium",
      scamType: "Fraud",
      category: "Tourist Alert",
      timestamp: new Date(Date.now() - 7200 * 1000).toISOString(),
    },
  ],

  fairPriceChecker: [
    {
      id: 1,
      item: "Bottle of Water",
      category: "Beverages",
      fairPrice: 20,
      location: "Delhi",
      city: "Connaught Place",
    },
    {
      id: 2,
      item: "Taxi Ride (1km)",
      category: "Transport",
      fairPrice: 15,
      location: "Bengaluru",
      city: "MG Road",
    },
    {
      id: 3,
      item: "Street Food Sandwich",
      category: "Food",
      fairPrice: 50,
      location: "Agra",
      city: "Taj Mahal Area",
    },
    {
      id: 4,
      item: "Local Bus Ticket",
      category: "Transport",
      fairPrice: 10,
      location: "Delhi",
      city: "Karol Bagh",
    },
    {
      id: 5,
      item: "Tea Cup",
      category: "Beverages",
      fairPrice: 5,
      location: "Bengaluru",
      city: "Brigade Road",
    },
  ],

  communityWatch: {
    reports: [
      {
        id: 1,
        report: "Street harassment reported near bus station",
        location: "MG Road",
        city: "Bengaluru",
        country: "India",
        category: "Safety",
        timestamp: new Date(Date.now() - 60000 * 30).toISOString(), // 30 mins ago
      },
      {
        id: 2,
        report: "Overcharging taxi driver spotted",
        location: "Connaught Place",
        city: "Delhi",
        country: "India",
        category: "Transport",
        timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
      },
    ],
    aiAnalysis: {
      summary: "Current safety risk level is moderate with some localized alerts.",
      riskLevel: "Moderate",
    },
  },

  communitySuggestions: [
    {
      id: 1,
      title: "Install Street Lights",
      description: "Add more street lights in dark alleys to improve safety.",
      category: "Infrastructure",
      upvotes: 12,
    },
    {
      id: 2,
      title: "Free Water Stations",
      description: "Provide free drinking water at tourist spots.",
      category: "Amenities",
      upvotes: 8,
    },
    {
      id: 3,
      title: "Clear Tourist Signage",
      description: "Install clear signboards for tourists in crowded areas.",
      category: "Guidance",
      upvotes: 15,
    },
  ],
};
