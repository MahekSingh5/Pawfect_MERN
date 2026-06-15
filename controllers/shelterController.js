const Shelter = require("../models/Shelter");

// Create new shelter (Admin only)
exports.createShelter = async (req, res) => {
    try {
        const { name, address, phone, email, latitude, longitude, capacity, specializations, website, operatingHours, description } = req.body;

        if (!name || !address || !phone || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Required fields: name, address, phone, latitude, longitude"
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates"
            });
        }

        const shelter = await Shelter.create({
            name,
            address,
            phone,
            email,
            location: {
                type: "Point",
                coordinates: [lng, lat]
            },
            capacity: capacity || 0,
            specializations: specializations || [],
            website,
            operatingHours: operatingHours || "9:00 AM - 5:00 PM",
            description
        });

        res.status(201).json({
            success: true,
            message: "Shelter created successfully",
            shelter
        });

    } catch (error) {
        console.error("Create Shelter Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating shelter",
            error: error.message
        });
    }
};

// Get all shelters
exports.getAllShelters = async (req, res) => {
    try {
        const shelters = await Shelter.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shelters.length,
            shelters
        });

    } catch (error) {
        console.error("Get All Shelters Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching shelters",
            error: error.message
        });
    }
};

// Get shelter by ID
exports.getShelterById = async (req, res) => {
    try {
        const { id } = req.params;

        const shelter = await Shelter.findById(id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: "Shelter not found"
            });
        }

        res.status(200).json({
            success: true,
            shelter
        });

    } catch (error) {
        console.error("Get Shelter Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching shelter",
            error: error.message
        });
    }
};

// Get nearby shelters
exports.getNearbyShelters = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 15000 } = req.query;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide latitude and longitude"
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid coordinates"
            });
        }

        const shelters = await Shelter.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });

        // Calculate distances in km
        const sheltersWithDistance = shelters.map(shelter => {
            const distance = getDistanceBetweenCoordinates(
                lat,
                lng,
                shelter.location.coordinates[1],
                shelter.location.coordinates[0]
            );

            return {
                _id: shelter._id,
                name: shelter.name,
                address: shelter.address,
                phone: shelter.phone,
                email: shelter.email,
                location: shelter.location,
                capacity: shelter.capacity,
                currentAnimals: shelter.currentAnimals,
                availableSpace: shelter.availableSpace,
                specializations: shelter.specializations,
                website: shelter.website,
                operatingHours: shelter.operatingHours,
                distanceKm: distance.toFixed(2)
            };
        });

        res.status(200).json({
            success: true,
            count: sheltersWithDistance.length,
            searchCenter: {
                type: "Point",
                coordinates: [lng, lat]
            },
            maxDistanceMeters: maxDistance,
            shelters: sheltersWithDistance
        });

    } catch (error) {
        console.error("Get Nearby Shelters Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while searching nearby shelters",
            error: error.message
        });
    }
};

// Update shelter (Admin only)
exports.updateShelter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, email, latitude, longitude, capacity, currentAnimals, specializations, website, operatingHours, description } = req.body;

        const shelter = await Shelter.findById(id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: "Shelter not found"
            });
        }

        // Update fields
        if (name) shelter.name = name;
        if (address) shelter.address = address;
        if (phone) shelter.phone = phone;
        if (email) shelter.email = email;
        if (latitude !== undefined && longitude !== undefined) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinates"
                });
            }

            shelter.location = {
                type: "Point",
                coordinates: [lng, lat]
            };
        }
        if (capacity !== undefined) shelter.capacity = capacity;
        if (currentAnimals !== undefined) {
            shelter.currentAnimals = currentAnimals;
            shelter.availableSpace = shelter.capacity - currentAnimals;
        }
        if (specializations) shelter.specializations = specializations;
        if (website) shelter.website = website;
        if (operatingHours) shelter.operatingHours = operatingHours;
        if (description) shelter.description = description;

        await shelter.save();

        res.status(200).json({
            success: true,
            message: "Shelter updated successfully",
            shelter
        });

    } catch (error) {
        console.error("Update Shelter Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating shelter",
            error: error.message
        });
    }
};

// Delete shelter (Admin only)
exports.deleteShelter = async (req, res) => {
    try {
        const { id } = req.params;

        const shelter = await Shelter.findByIdAndDelete(id);

        if (!shelter) {
            return res.status(404).json({
                success: false,
                message: "Shelter not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Shelter deleted successfully"
        });

    } catch (error) {
        console.error("Delete Shelter Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting shelter",
            error: error.message
        });
    }
};

// Haversine formula to calculate distance between two points
function getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
