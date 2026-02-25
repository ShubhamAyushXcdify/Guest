interface Clinic {
    id: string,
    name: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    phone: string,
    email: string,
    website: string,
    taxId: string,
    licenseNumber: string,
    subscriptionStatus: string | null,
    subscriptionExpiresAt: string | null,
    createdAt: string,
    updatedAt: string,
    location: {
        lat: number,
        lng: number,
        address: string
    },
    distance: number
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);  // Convert degrees to radians
    const dLon = (lon2 - lon1) * (Math.PI / 180);  // Convert degrees to radians
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

export const getNearestClinic = async (latitude: number, longitude: number, data: Clinic[]) => {
    const clinicsWithDistance = data.map((clinic) => ({
        ...clinic,
        distance: calculateDistance(latitude, longitude, clinic.location.lat, clinic.location.lng)
    }))
    return clinicsWithDistance.sort((a: Clinic, b: Clinic) => a.distance - b.distance)
}


