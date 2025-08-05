// utils/cleanupOldAvailability.js
import mongoose from "mongoose"
import moment from "moment"
import GymAvailability from "../models/GymAvailability.js"

const cleanupOldAvailability = async () => {
  try {
    const today = moment().startOf("day").format("YYYY-MM-DD")
    const result = await GymAvailability.deleteMany({ date: { $lt: today } })
    console.log(`[CLEANUP] Deleted ${result.deletedCount} outdated availability entries`)
  } catch (error) {
    console.error("[CLEANUP ERROR] Failed to delete old availability:", error)
  }
}

// Run immediately on startup
cleanupOldAvailability()

// Run once every 24 hours
setInterval(cleanupOldAvailability, 24 * 60 * 60 * 1000) // 24 hrs
