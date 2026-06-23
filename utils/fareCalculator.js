// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate fare based on distance, vehicle type, and lady captain
export const calculateFare = (distance, vehicleType = 'bike', ladyCaptain = false) => {
  // Base rates
  const BASE_FARE = 50;
  const PER_KM_RATE = 15;
  const PER_MINUTE_RATE = 2;
  
  // Vehicle type bonus
  const vehicleBonus = {
    bike: 0,
    auto: 20,
    car: 50
  };
  
  // Lady Captain extra charge
  const LADY_CAPTAIN_EXTRA = 10;
  
  // Estimate time (assume average speed of 20 km/h)
  const estimatedTime = (distance / 20) * 60; // in minutes
  
  // Calculate fare
  let fare = BASE_FARE;
  fare += distance * PER_KM_RATE;
  fare += estimatedTime * PER_MINUTE_RATE;
  fare += vehicleBonus[vehicleType] || 0;
  
  if (ladyCaptain) {
    fare += LADY_CAPTAIN_EXTRA;
  }
  
  return Math.round(fare);
};

// Format fare display
export const formatFare = (fare) => {
  return `₹${fare}`;
};

// Get vehicle type display name
export const getVehicleDisplayName = (vehicleType) => {
  const names = {
    bike: 'Bike',
    auto: 'Auto Rickshaw',
    car: 'Car'
  };
  return names[vehicleType] || vehicleType;
};