/**
 * Utility to calculate real driving distance between two addresses
 * using OpenStreetMap Nominatim (for geocoding) and OSRM (for routing).
 * Falling back to a standard straight-line distance if routing fails.
 */

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address || address.trim().length < 5) return null;
  const trimmed = address.trim();
  
  // 1. Try Photon Komoot API first (unrestricted, extremely fast, built on OSM)
  try {
    const encodedAddress = encodeURIComponent(trimmed + ", Brasil");
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodedAddress}&limit=1`,
      { headers: { "Accept-Language": "pt" } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return {
          lat: coords[1],
          lon: coords[0]
        };
      }
    }
  } catch (err) {
    console.warn("Photon geocoding failed, trying Nominatim...", err);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const encodedAddress = encodeURIComponent(trimmed + ", Brasil");
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodedAddress}`,
      {
        headers: {
          "Accept-Language": "pt-BR,pt;q=0.9",
          "User-Agent": "LogiDispatch-Applet-AI-Studio"
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.error("Geocoding failed for address:", address, err);
  }
  return null;
}

export async function calculateRouteDistance(
  retirada: string,
  entrega: string
): Promise<number | null> {
  try {
    const locA = await geocodeAddress(retirada);
    if (!locA) return null;
    
    // Slight pause ONLY if we need a fallback or are query-limiting. Since Photon is fast, we can try to get locB.
    const locB = await geocodeAddress(entrega);
    if (!locB) return null;
    
    // Call OSRM public route service
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${locA.lon},${locA.lat};${locB.lon},${locB.lat}?overview=false`;
    const response = await fetch(osrmUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.routes && data.routes.length > 0) {
        const distanceMeters = data.routes[0].distance; // distance in meters
        const distanceKm = distanceMeters / 1000;
        return parseFloat(distanceKm.toFixed(1));
      }
    }
    
    // Fallback: Haversine distance if OSRM is down
    const R = 6371; // Earth's radius in km
    const dLat = ((locB.lat - locA.lat) * Math.PI) / 180;
    const dLon = ((locB.lon - locA.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((locA.lat * Math.PI) / 180) *
        Math.cos((locB.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    
    // Driving distance is usually around 1.3x straight-line distance
    return parseFloat((straightKm * 1.3).toFixed(1));
  } catch (err) {
    console.error("Route calculation error:", err);
  }
  return null;
}
