// controllers/availabilityController.js
import moment from "moment"
import GymAvailability from "../models/GymAvailability.js"
import Gym from "../models/Gym.js"
import RecurringAvailability from "../models/RecurringAvailability.js"

const generateTimeSlots = (start, end) => {
  const slots = []
  const startMoment = moment(start, ["h:mm A", "hh:mm A"])
  const endMoment = moment(end, ["h:mm A", "hh:mm A"])

  if (!startMoment.isValid() || !endMoment.isValid()) return slots
  if (startMoment.isSameOrAfter(endMoment)) return slots

  const current = startMoment.clone()

  while (current.isBefore(endMoment)) {
    slots.push(current.format("hh:mm A"))
    current.add(1, "hour")
  }

  return slots
}

export const setAvailability = async (req, res) => {
  try {
    const { gymId, date, startTime, endTime } = req.body

    if (!gymId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const selectedDate = moment(date, "YYYY-MM-DD", true)
    const today = moment().startOf("day")

    if (!selectedDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format" })
    }

    if (selectedDate.isBefore(today)) {
      return res.status(400).json({ message: "Cannot set availability for past dates" })
    }

    const gym = await Gym.findById(gymId)
    if (!gym || gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const availableSlots = generateTimeSlots(startTime, endTime)

    const availability = await GymAvailability.findOneAndUpdate(
      { gym: gymId, date },
      { availableSlots },
      { upsert: true, new: true },
    )

    res.status(200).json(availability)
  } catch (error) {
    console.error("Set Availability Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Modified getAvailability controller
export const getAvailability = async (req, res) => {
  try {
    const gymId = req.params.gymId
    const date = req.query.date || moment().format("YYYY-MM-DD")
    const dayOfWeek = moment(date).format("dddd")

    // 1. Check date-specific availability
    const availability = await GymAvailability.findOne({ gym: gymId, date })

    if (availability) {
      return res.status(200).json(availability)
    }

    // 2. If not found, check recurring
    const recurring = await RecurringAvailability.findOne({ gym: gymId, dayOfWeek })

    if (recurring) {
      const slots = generateTimeSlots(recurring.startTime, recurring.endTime)
      return res.status(200).json({
        gym: gymId,
        date,
        availableSlots: slots,
        recurring: true,
      })
    }

    return res.status(404).json({ message: "No availability found for selected date" })
  } catch (error) {
    console.error("Get Availability Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// New: Get all availability (date-specific and recurring) for a gym, for the owner
export const getOwnerGymAvailability = async (req, res) => {
  try {
    const { gymId } = req.params

    const gym = await Gym.findById(gymId)
    if (!gym || gym.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access or gym not found" })
    }

    const dateSpecificAvailability = await GymAvailability.find({ gym: gymId }).sort({ date: 1 })
    const recurringAvailability = await RecurringAvailability.find({ gym: gymId })

    res.status(200).json({
      message: "Gym availability fetched successfully",
      dateSpecific: dateSpecificAvailability,
      recurring: recurringAvailability,
    })
  } catch (error) {
    console.error("Get Owner Gym Availability Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// New: Get all availability (date-specific and recurring) for a gym, for users
export const getUserGymAvailability = async (req, res) => {
  try {
    const { gymId } = req.params

    const gym = await Gym.findById(gymId)
    if (!gym ) {
      // Only show approved gyms to users
      return res.status(404).json({ message: "Gym not found or not approved" })
    }

    // Fetch date-specific availability for future dates
    const today = moment().startOf("day").format("YYYY-MM-DD")
    const dateSpecificAvailability = await GymAvailability.find({
      gym: gymId,
      date: { $gte: today },
    }).sort({ date: 1 })

    const recurringAvailability = await RecurringAvailability.find({ gym: gymId })

    res.status(200).json({
      message: "Gym availability fetched successfully",
      dateSpecific: dateSpecificAvailability,
      recurring: recurringAvailability,
    })
  } catch (error) {
    console.error("Get User Gym Availability Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

