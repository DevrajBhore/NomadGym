// controllers/gymController.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Gym from "../models/Gym.js";
import User from "../models/Users.js";
import Booking from "../models/Booking.js";
import GymAvailability from "../models/GymAvailability.js";
import RecurringAvailability from "../models/RecurringAvailability.js";

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// GET /gyms/all-public
export const getAllGymsPublic = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }).select(
      "name description city imageUrls averageRating"
    );

    res.status(200).json({ success: true, data: gyms });
  } catch (err) {
    console.error("Error fetching gyms:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get nearby gyms based on user location
export const getNearbyGyms = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      search = "",
      minPrice,
      maxPrice,
      minRating,
      amenities,
      sortBy = "distance",
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLat = Number.parseFloat(lat);
    const userLng = Number.parseFloat(lng);
    const searchRadius = Number.parseFloat(radius) * 1000; // Convert km to meters

    // Build the query
    const query = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: searchRadius,
        },
      },
    };

    // Add text search if provided
    // if (search && search.trim()) {
    //   query.$text = { $search: search.trim() }
    // }

    // Add price filters
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number.parseFloat(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number.parseFloat(maxPrice);
    }

    // Add rating filter
    if (minRating) {
      query.averageRating = { $gte: Number.parseFloat(minRating) };
    }

    // Add amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $in: amenitiesList };
    }

    // Execute the query
    let gyms = await Gym.find(query).populate("ownerId", "name email").lean();

    // Calculate distances and add to each gym
    gyms = gyms.map((gym) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        Number.parseFloat(gym.latitude),
        Number.parseFloat(gym.longitude)
      );

      return {
        ...gym,
        distance: distance,
        id: gym._id.toString(),
      };
    });

    // Sort gyms based on sortBy parameter
    switch (sortBy) {
      case "price_low":
        gyms.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case "price_high":
        gyms.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case "rating":
        gyms.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "name":
        gyms.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "distance":
      default:
        gyms.sort((a, b) => a.distance - b.distance);
        break;
    }

    res.json({
      success: true,
      count: gyms.length,
      gyms: gyms,
      filters: {
        search,
        radius: Number.parseFloat(radius),
        minPrice,
        maxPrice,
        minRating,
        amenities,
        sortBy,
      },
    });
  } catch (error) {
    console.error("Error fetching nearby gyms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby gyms",
      error: error.message,
    });
  }
};

// Get all gyms (Public)
export const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true })
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: gyms.length,
      gyms: gyms,
    });
  } catch (error) {
    console.error("Error fetching gyms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gyms",
      error: error.message,
    });
  }
};

// Get gym by ID (Public)
export const getGymById = async (req, res) => {
  try {
    const { id } = req.params;

    const gym = await Gym.findById(id).populate("ownerId", "name email");

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    res.json({
      success: true,
      gym: gym,
    });
  } catch (error) {
    console.error("Error fetching gym:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gym details",
      error: error.message,
    });
  }
};

// Add new gym (Admin only)
export const addGym = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      name,
      description,
      address,
      city,
      state,
      pincode,
      contactNumber,
      email,
      pricePerHour,
      capacity,
      amenities,
      latitude,
      longitude,
      ownerEmail,
    } = req.body;

    // required fields check
    const required = {
      name,
      description,
      address,
      city,
      state,
      pincode,
      contactNumber,
      email,
      ownerEmail,
    };
    for (const [k, v] of Object.entries(required)) {
      if (v == null || String(v).trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: `Missing field: ${k}` });
      }
    }

    // validate numbers
    const price = Number(pricePerHour);
    const cap = Number(capacity);
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (![price, cap, lat, lng].every(Number.isFinite)) {
      return res.status(400).json({
        success: false,
        message: "Invalid number in pricePerHour/capacity/latitude/longitude",
      });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res
        .status(400)
        .json({ success: false, message: "Coordinates out of range" });
    }

    // check owner
    const owner = await User.findOne({ email: ownerEmail });
    if (!owner)
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    if (!owner.isVerified)
      return res.status(403).json({
        success: false,
        message: "User is not verified. Cannot assign gym ownership.",
      });

    if (owner.role !== "gym_owner") {
      owner.role = "gym_owner";
      await owner.save();
    }

    // images
    const imageUrls = Array.isArray(req.files)
      ? req.files
          .map((f) => f.path || f.location || f.secure_url)
          .filter(Boolean)
      : [];

    const newGym = new Gym({
      name,
      description,
      address,
      city,
      state,
      pincode,
      contactNumber,
      email,
      pricePerHour: price,
      capacity: cap,
      amenities: Array.isArray(amenities)
        ? amenities
        : amenities
        ? String(amenities)
            .split(",")
            .map((s) => s.trim())
        : [],
      imageUrls,
      latitude: lat, // ✅ store as number
      longitude: lng, // ✅ store as number
      ownerId: owner._id,
      location: { type: "Point", coordinates: [lng, lat] }, // ✅ proper GeoJSON
    });

    let savedGym;
    try {
      savedGym = await newGym.save();
    } catch (e) {
      if (e.code === 11000)
        return res
          .status(409)
          .json({ success: false, message: "Duplicate gym", key: e.keyValue });
      if (e.name === "ValidationError")
        return res.status(400).json({ success: false, message: e.message });
      console.error("Mongo Save Error:", e);
      return res.status(500).json({ success: false, message: e.message });
    }

    return res.status(201).json({
      success: true,
      message: "Gym added successfully and user promoted to gym_owner",
      gym: savedGym,
    });
  } catch (error) {
    console.error("AddGym error:", error.message);
    next(error);
  }
};


// Get all bookings for a gym (Owner only)
export const getBookingsForGym = async (req, res) => {
  try {
    const gymId = req.params.gymId;
    console.log("Fetching bookings for gym:", gymId);
    console.log("User:", req.user._id);

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    console.log("Gym owner:", gym.ownerId.toString());
    console.log("Current user:", req.user._id.toString());

    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const bookings = await Booking.find({ gym: gymId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log("Found bookings:", bookings.length);

    res.status(200).json({
      success: true,
      bookings: bookings,
      count: bookings.length,
    });
  } catch (err) {
    console.error("Failed to get bookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get gyms owned by the current user (Gym Owner only)
export const getOwnerGyms = async (req, res) => {
  try {
    // console.log("Fetching gyms for owner:", req.user._id)

    const gyms = await Gym.find({ ownerId: req.user._id })
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    // console.log("Found gyms:", gyms.length)

    res.json({
      success: true,
      gyms: gyms,
      count: gyms.length,
    });
  } catch (err) {
    console.error("Error fetching owner gyms:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// Update gym price (Gym Owner only)
export const updateGymPrice = async (req, res) => {
  const { pricePerHour, pricingMode } = req.body;
  const { id } = req.params; // gym ID

  try {
    const gym = await Gym.findById(id);

    if (!gym) {
      return res.status(404).json({ message: "Gym not found." });
    }

    // Ensure the logged-in user is the owner of this gym
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this gym." });
    }

    if (pricePerHour !== undefined) {
      gym.pricePerHour = pricePerHour;
    }
    if (pricingMode !== undefined) {
      gym.pricingMode = pricingMode;
    }

    await gym.save();
    res.json({ message: "Gym price updated successfully.", gym: gym });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Admin: Approve/Reject Gym
// export const updateGymApprovalStatus = async (req, res) => {
//   const { isApproved } = req.body;
//   const { id } = req.params; // gym ID

//   try {
//     const gym = await Gym.findById(id);

//     if (!gym) {
//       return res.status(404).json({ message: "Gym not found." });
//     }

//     gym.isApproved = isApproved;
//     await gym.save();

//     res.json({
//       message: `Gym ${isApproved ? "approved" : "rejected"} successfully.`,
//       gym: gym,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };

// Get unique cities with approved gyms (Public)
export const getUniqueCities = async (req, res) => {
  try {
    const cities = await Gym.distinct("city", {});
    res.json({ cities: cities });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get unique amenities for filter options
export const getAmenities = async (req, res) => {
  try {
    const gyms = await Gym.find({ isActive: true }, { amenities: 1 });

    const uniqueAmenities = gyms
      .flatMap((gym) => gym.amenities)
      .filter((amenity) => amenity && amenity.trim())
      .reduce((acc, amenity) => {
        if (!acc.includes(amenity)) {
          acc.push(amenity);
        }
        return acc;
      }, []);

    res.json({
      success: true,
      amenities: uniqueAmenities,
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch amenities",
      error: error.message,
    });
  }
};

export const getAllCities = async (req, res) => {
  try {
    const cities = await Gym.distinct("city", {
      isActive: true,
    });

    res.json({
      success: true,
      cities: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
      error: error.message,
    });
  }
};

// Get city gym stats
export const getCityGymStats = async (req, res) => {
  try {
    const stats = await Gym.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$city",
          totalGyms: { $sum: 1 },
          averageRating: { $avg: "$averageRating" },
        },
      },
      {
        $sort: { totalGyms: -1 },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching city gym stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch city gym stats",
      error: error.message,
    });
  }
};

export const getGymDetails = async (req, res) => {
  try {
    const { gymId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gymId)) {
      return res.status(400).json({ error: "Invalid gym ID" });
    }

    const gym = await Gym.findById(gymId).populate("ownerId", "name email");

    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    res.json({
      success: true,
      gym: gym,
    });
  } catch (error) {
    console.error("Error fetching gym details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch gym details" });
  }
};

export const getGymsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const gyms = await Gym.find({
      city,
      isActive: true,
    }).populate("ownerId", "name email");

    res.json({
      success: true,
      count: gyms.length,
      gyms: gyms,
    });
  } catch (error) {
    console.error("Error fetching gyms by city:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch gyms by city" });
  }
};

export const updatePricePerHour = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { pricePerHour } = req.body;

    if (!pricePerHour) {
      return res.status(400).json({ message: "Price per hour is required" });
    }

    const gym = await Gym.findById(gymId);

    if (!gym || gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    gym.pricePerHour = pricePerHour;
    await gym.save();

    res
      .status(200)
      .json({ success: true, message: "Price updated successfully", gym: gym });
  } catch (error) {
    console.error("Error updating price per hour:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update price",
      error: error.message,
    });
  }
};

export const deleteGymImage = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { imageUrl } = req.body;

    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

    // Ensure the logged-in user is the owner
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    gym.imageUrls = gym.imageUrls.filter(url => url !== imageUrl);
    await gym.save();

    res.json({ success: true, message: "Image deleted", images: gym.imageUrls });
  } catch (error) {
    console.error("Delete gym image error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addGymImages = async (req, res) => {
  try {
    const { gymId } = req.params;
    const gym = await Gym.findById(gymId);
    if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

    // Ensure the logged-in user is the owner
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const newImages = Array.isArray(req.files)
      ? req.files.map(f => f.path || f.location || f.secure_url).filter(Boolean)
      : [];

    gym.imageUrls = [...gym.imageUrls, ...newImages];
    await gym.save();

    res.json({ success: true, message: "Images added", images: gym.imageUrls });
  } catch (error) {
    console.error("Add gym images error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getAdminGymAvailability = async (req, res) => {
//   try {
//     const { gymId } = req.params;
//     if (!gymId || gymId.length !== 24) {
//       return res.status(400).json({ error: "Invalid gym ID" });
//     }
//     const gym = await Gym.findById(gymId);
//     if (!gym) {
//       return res.status(404).json({ message: "Gym not found" });
//     }
//     const dateSpecificAvailability = await GymAvailability.find({ gym: gymId }).sort({ date: 1 });
//     const recurringAvailability = await RecurringAvailability.find({ gym: gymId });
//     res.status(200).json({
//       message: "Gym availability fetched successfully",
//       dateSpecific: dateSpecificAvailability,
//       recurring: recurringAvailability,
//     });
//   } catch (error) {
//     console.error("Get Admin Gym Availability Error:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
