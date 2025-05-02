import { ref, computed, watch } from "vue"
import { useBedSpaceSocket } from "./useBedSpaceSocket"

// Types
export interface Unit {
  _id: string
  unitName: string
  floor: string
  wing: string
  totalBeds: number
  availableBeds: number
  lastUpdated: Date
  hospital: {
    _id: string
    name: string
  }
}

export interface Hospital {
  _id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  bedSpaces: Unit[]
}

export interface Notification {
  show: boolean
  type: "success" | "warning"
  title: string
  message: string
}

export const useBedManagement = (hospitalId?: string) => {
  const units = ref<Unit[]>([])
  const hospitals = ref<Hospital[]>([])
  const isLoading = ref(true)
  const notification = ref<Notification>({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  // Initialize socket connection
  const {
    initSocket,
    joinHospitalRoom,
    leaveHospitalRoom,
    updateBedSpace,
    sendEmergencyNotification,
    onBedSpaceUpdated,
    isConnected,
  } = useBedSpaceSocket()

  // Initialize socket on component mount
  initSocket()

  // Watch for socket connection and join hospital room if hospitalId is provided
  watch(
    [isConnected, () => hospitalId],
    ([connected, id]) => {
      if (connected && id) {
        joinHospitalRoom(id)
      }
    },
    { immediate: true },
  )

  // Listen for bed space updates
  const unsubscribeBedSpaceUpdated = onBedSpaceUpdated((updatedUnit) => {
    // Find and update the unit in our local state
    const index = units.value.findIndex((unit) => unit._id === updatedUnit._id)
    if (index !== -1) {
      units.value[index] = {
        ...updatedUnit,
        lastUpdated: new Date(updatedUnit.lastUpdated),
      }
      showNotification(
        "success",
        "Bed Space Updated",
        `${updatedUnit.unitName} now has ${updatedUnit.availableBeds} available beds`,
      )
    }
  })

  // Fetch hospitals data
  const fetchHospitals = async () => {
    isLoading.value = true
    try {
      const response = await fetch("http://localhost:3000/bed-space/hospitals")
      const data = await response.json()
      hospitals.value = data
    } catch (error) {
      console.error("Error fetching hospitals:", error)
      showNotification("warning", "Data Fetch Failed", "Unable to load hospitals data. Please try again.")
    } finally {
      isLoading.value = false
    }
  }

  // Fetch units data for a specific hospital
  const fetchUnitsByHospital = async (id: string) => {
    isLoading.value = true
    try {
      const response = await fetch(`http://localhost:3000/bed-space/hospital/${id}`)
      const data = await response.json()
      units.value = data.map((unit: any) => ({
        ...unit,
        lastUpdated: new Date(unit.lastUpdated),
      }))
    } catch (error) {
      console.error("Error fetching units:", error)
      showNotification("warning", "Data Fetch Failed", "Unable to load unit data. Please try again.")
    } finally {
      isLoading.value = false
    }
  }

  // Increment bed availability
  const incrementBed = async (unit: Unit) => {
    if (unit.availableBeds < unit.totalBeds) {
      try {
        await updateBedSpace(unit._id, unit.availableBeds + 1, unit.hospital._id)
        // The actual update will come through the WebSocket
      } catch (error) {
        console.error("Error incrementing bed:", error)
        showNotification("warning", "Update Failed", "Failed to update bed availability. Please try again.")
      }
    }
  }

  // Decrement bed availability
  const decrementBed = async (unit: Unit) => {
    if (unit.availableBeds > 0) {
      try {
        await updateBedSpace(unit._id, unit.availableBeds - 1, unit.hospital._id)
        // The actual update will come through the WebSocket
      } catch (error) {
        console.error("Error decrementing bed:", error)
        showNotification("warning", "Update Failed", "Failed to update bed availability. Please try again.")
      }
    }
  }

  // Send emergency notification when user clicks on a hospital
  const notifyEmergency = async (hospital: Hospital, userLocation: string, lat: number, lng: number) => {
    try {
      await sendEmergencyNotification(hospital._id, userLocation, lat, lng)
      showNotification("success", "Emergency Notification Sent", `Your emergency has been reported to ${hospital.name}`)
    } catch (error) {
      console.error("Error sending emergency notification:", error)
      showNotification("warning", "Notification Failed", "Failed to send emergency notification. Please try again.")
    }
  }

  // Show notification
  const showNotification = (type: "success" | "warning", title: string, message: string) => {
    notification.value = {
      show: true,
      type,
      title,
      message,
    }

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      notification.value.show = false
    }, 5000)
  }

  // Calculate total beds
  const totalBeds = computed(() => {
    return units.value.reduce((sum, unit) => sum + unit.totalBeds, 0)
  })

  // Calculate total available beds
  const totalAvailable = computed(() => {
    return units.value.reduce((sum, unit) => sum + unit.availableBeds, 0)
  })

  // Calculate occupancy rate
  const occupancyRate = computed(() => {
    if (totalBeds.value === 0) return 0
    return Math.round(((totalBeds.value - totalAvailable.value) / totalBeds.value) * 100)
  })

  // Cleanup function
  const cleanup = () => {
    if (hospitalId) {
      leaveHospitalRoom(hospitalId)
    }
    if (unsubscribeBedSpaceUpdated) {
      unsubscribeBedSpaceUpdated()
    }
  }

  return {
    units,
    hospitals,
    isLoading,
    notification,
    fetchHospitals,
    fetchUnitsByHospital,
    incrementBed,
    decrementBed,
    notifyEmergency,
    totalBeds,
    totalAvailable,
    occupancyRate,
    cleanup,
  }
}
