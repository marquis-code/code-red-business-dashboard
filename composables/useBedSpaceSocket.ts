import { io, type Socket } from "socket.io-client"
import { ref, onUnmounted } from "vue"

export const useBedSpaceSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)

  // Initialize socket connection
  const initSocket = (url = "http://localhost:3000") => {
    socket.value = io(url, {
      transports: ["websocket"],
      autoConnect: true,
    })

    socket.value.on("connect", () => {
      console.log("Socket connected")
      isConnected.value = true
    })

    socket.value.on("disconnect", () => {
      console.log("Socket disconnected")
      isConnected.value = false
    })

    socket.value.on("connect_error", (err) => {
      console.error("Connection error:", err)
      lastError.value = err.message
      isConnected.value = false
    })
  }

  // Join a hospital room to receive updates for a specific hospital
  const joinHospitalRoom = (hospitalId: string) => {
    if (!socket.value || !isConnected.value) return

    socket.value.emit("joinHospitalRoom", hospitalId, (response: any) => {
      console.log("Joined hospital room:", response)
    })
  }

  // Leave a hospital room
  const leaveHospitalRoom = (hospitalId: string) => {
    if (!socket.value || !isConnected.value) return

    socket.value.emit("leaveHospitalRoom", hospitalId, (response: any) => {
      console.log("Left hospital room:", response)
    })
  }

  // Update bed space availability
  const updateBedSpace = (unitId: string, availableBeds: number, hospitalId?: string) => {
    if (!socket.value || !isConnected.value) return

    return new Promise((resolve, reject) => {
      socket.value?.emit("updateBedSpace", { unitId, availableBeds, hospitalId }, (response: any) => {
        if (response.success) {
          resolve(response.data)
        } else {
          reject(new Error(response.error || "Failed to update bed space"))
        }
      })
    })
  }

  // Send emergency notification
  const sendEmergencyNotification = (hospitalId: string, userLocation: string, latitude: number, longitude: number) => {
    if (!socket.value || !isConnected.value) return

    return new Promise((resolve, reject) => {
      socket.value?.emit(
        "emergencyNotification",
        { hospitalId, userLocation, latitude, longitude },
        (response: any) => {
          if (response.success) {
            resolve(response.data)
          } else {
            reject(new Error(response.error || "Failed to send emergency notification"))
          }
        },
      )
    })
  }

  // Listen for bed space updates
  const onBedSpaceUpdated = (callback: (data: any) => void) => {
    if (!socket.value) return

    socket.value.on("bedSpaceUpdated", callback)

    return () => {
      socket.value?.off("bedSpaceUpdated", callback)
    }
  }

  // Listen for emergency alerts (for hospital admin dashboard)
  const onEmergencyAlert = (callback: (data: any) => void) => {
    if (!socket.value) return

    socket.value.on("emergencyAlert", callback)

    return () => {
      socket.value?.off("emergencyAlert", callback)
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    socket,
    isConnected,
    lastError,
    initSocket,
    joinHospitalRoom,
    leaveHospitalRoom,
    updateBedSpace,
    sendEmergencyNotification,
    onBedSpaceUpdated,
    onEmergencyAlert,
    cleanup,
  }
}
