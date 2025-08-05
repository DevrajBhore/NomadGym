// controllers/recurringAvailabilityController.js
import RecurringAvailability from "../models/RecurringAvailability.js"
import Gym from "../models/Gym.js"

export const setRecurringAvailability = async (req, res) => {
  try {
    const { gymId, dayOfWeek, startTime, endTime } = req.body

    if (!gymId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const gym = await Gym.findById(gymId)
    if (!gym || gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const recurring = await RecurringAvailability.findOneAndUpdate(
      { gym: gymId, dayOfWeek },
      { startTime, endTime },
      { upsert: true, new: true },
    )

    res.status(200).json(recurring)
  } catch (error) {
    console.error("Set Recurring Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get recurring availability for a specific gym and day of week
export const getRecurringAvailability = async (req, res) => {
  try {
    const { gymId, dayOfWeek } = req.params

    const gym = await Gym.findById(gymId)
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" })
    }

    // Check if user is the owner of the gym
    if (gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const recurring = await RecurringAvailability.findOne({ gym: gymId, dayOfWeek })

    if (!recurring) {
      return res.status(404).json({ message: "No recurring availability found for this day" })
    }

    res.status(200).json(recurring)
  } catch (error) {
    console.error("Get Recurring Availability Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}
