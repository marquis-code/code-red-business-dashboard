import { io, type Socket } from "socket.io-client"
import { ref, onUnmounted, reactive, computed } from "vue"

export const useSurgeSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)
  const lastActivity = ref<Date | null>(null)

  // Track subscriptions
  const subscribedHospitals = reactive(new Set<string>())
  const subscribedRegions = reactive(new Set<string>())

  // Store for real-time surge data
  const surgeData = ref<any[]>([])
  const isLoadingInitialData = ref(false)

  // Active surges computed property
  const activeSurges = computed(() =>
    surgeData.value.filter((surge) => ["pending", "active", "in-progress"].includes(surge.status)),
  )

  // Initialize socket connection
  const initSocket = (url = 'http://localhost:3000') => {
    // console.log(`Initializing socket connection to ${url}`)
    if (!url) {
      lastError.value = "No API URL provided"
      return
    }

    socket.value = io('http://localhost:3000', {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      auth: {
        token: localStorage.getItem("token"),
      },
    })

    socket.value.on("connect", () => {
      isConnected.value = true
      lastActivity.value = new Date()
      lastError.value = null

      // Resubscribe after reconnection
      subscribedHospitals.forEach((hospitalId) => {
        subscribeToHospitalSurges(hospitalId)
      })

      subscribedRegions.forEach((regionKey) => {
        const [lat, lng, radius] = regionKey.split(":")
        subscribeToRegionalSurges(Number.parseFloat(lat), Number.parseFloat(lng), Number.parseFloat(radius))
      })
    })

    socket.value.on("disconnect", () => {
      isConnected.value = false
    })

    socket.value.on("connect_error", (err) => {
      lastError.value = err.message
      isConnected.value = false
    })

    // Handle heartbeat events
    socket.value.on("surge_heartbeat", (data) => {
      lastActivity.value = new Date(data.timestamp)
    })

    // Setup event listeners
    setupSurgeEventListeners()
  }

  // Setup surge event listeners
  const setupSurgeEventListeners = () => {
    if (!socket.value) return

    // Listen for all surge creation events
    const surgeCreatedEvents = [
      "surge_created",
      "new_surge",
      "surge.created",
      "hospital_surge_created",
      "regional_surge_created",
      "emergency_surge",
      "global_surge_created",
    ]

    surgeCreatedEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        handleSurgeEvent(data, eventName)
      })
    })

    // Listen for surge update events
    const surgeUpdatedEvents = ["surge_updated", "surge.updated", "hospital_surge_updated", "global_surge_updated"]

    surgeUpdatedEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        handleSurgeUpdateEvent(data, eventName)
      })
    })

    // Listen for initial data
    const initialDataEvents = ["initial_surge_data", "hospital_surges_initial", "regional_surges_initial"]

    initialDataEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        if (data.surges && Array.isArray(data.surges)) {
          surgeData.value = [...data.surges]
        } else if (Array.isArray(data)) {
          surgeData.value = [...data]
        }
        emitInitialData(data.surges || data || [], data.hospitalId)
        isLoadingInitialData.value = false
      })
    })
  }

  // Handle surge creation events
  const handleSurgeEvent = (data: any, eventType: string) => {
    let surge = null
    let hospitalId = null

    if (data.surge) {
      surge = data.surge
      hospitalId = data.hospitalId || data.surge.hospital
    } else if (data._id) {
      surge = data
      hospitalId = data.hospital
    }

    if (surge) {
      const existingIndex = surgeData.value.findIndex((s) => s._id === surge._id)

      if (existingIndex === -1) {
        surgeData.value = [...surgeData.value, surge]
      } else {
        surgeData.value = [
          ...surgeData.value.slice(0, existingIndex),
          surge,
          ...surgeData.value.slice(existingIndex + 1),
        ]
      }

      emitSurgeCreated(surge, hospitalId, eventType)
    }
  }

  // Handle surge update events
  const handleSurgeUpdateEvent = (data: any, eventType: string) => {
    let surge = null
    let hospitalId = null

    if (data.surge) {
      surge = data.surge
      hospitalId = data.hospitalId || data.surge.hospital
    } else if (data._id) {
      surge = data
      hospitalId = data.hospital
    }

    if (surge) {
      const existingIndex = surgeData.value.findIndex((s) => s._id === surge._id)

      if (existingIndex !== -1) {
        surgeData.value = [
          ...surgeData.value.slice(0, existingIndex),
          surge,
          ...surgeData.value.slice(existingIndex + 1),
        ]
      } else {
        surgeData.value = [...surgeData.value, surge]
      }

      emitSurgeUpdated(surge, hospitalId, eventType)
    }
  }

  // Subscribe to hospital surges
  const subscribeToHospitalSurges = (hospitalId: string) => {
    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    isLoadingInitialData.value = true

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        subscribedHospitals.add(hospitalId)
        isLoadingInitialData.value = false
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      const subscriptionPayload = { hospitalId }

      socket.value?.emit("subscribe_hospital_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        subscribedHospitals.add(hospitalId)
        isLoadingInitialData.value = false
        resolve(response || { success: true })
      })
    })
  }

  // Subscribe to regional surges
  const subscribeToRegionalSurges = (latitude: number, longitude: number, radiusInKm: number) => {
    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    const regionKey = `${latitude}:${longitude}:${radiusInKm}`

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        subscribedRegions.add(regionKey)
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      const subscriptionPayload = {
        latitude,
        longitude,
        radius: radiusInKm * 1000,
        radiusKm: radiusInKm,
      }

      socket.value?.emit("subscribe_regional_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        subscribedRegions.add(regionKey)
        resolve(response || { success: true })
      })
    })
  }

  // Event callbacks
  const callbacks = {
    initialData: [] as ((data: any) => void)[],
    surgeCreated: [] as ((data: any) => void)[],
    surgeUpdated: [] as ((data: any) => void)[],
  }

  const emitInitialData = (data: any[], hospitalId?: string) => {
    callbacks.initialData.forEach((callback) => {
      try {
        callback({ surges: data, hospitalId })
      } catch (error) {
        console.error("Error in initial data callback:", error)
      }
    })
  }

  const emitSurgeCreated = (data: any, hospitalId?: string, eventType?: string) => {
    callbacks.surgeCreated.forEach((callback) => {
      try {
        callback({ surge: data, hospitalId, eventType, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error("Error in surge created callback:", error)
      }
    })
  }

  const emitSurgeUpdated = (data: any, hospitalId?: string, eventType?: string) => {
    callbacks.surgeUpdated.forEach((callback) => {
      try {
        callback({ surge: data, hospitalId, eventType, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error("Error in surge updated callback:", error)
      }
    })
  }

  // Callback registration
  const onInitialSurgeData = (callback: (data: any) => void) => {
    callbacks.initialData.push(callback)
    return () => {
      const index = callbacks.initialData.indexOf(callback)
      if (index !== -1) {
        callbacks.initialData.splice(index, 1)
      }
    }
  }

  const onSurgeCreated = (callback: (data: any) => void) => {
    callbacks.surgeCreated.push(callback)
    return () => {
      const index = callbacks.surgeCreated.indexOf(callback)
      if (index !== -1) {
        callbacks.surgeCreated.splice(index, 1)
      }
    }
  }

  const onSurgeUpdated = (callback: (data: any) => void) => {
    callbacks.surgeUpdated.push(callback)
    return () => {
      const index = callbacks.surgeUpdated.indexOf(callback)
      if (index !== -1) {
        callbacks.surgeUpdated.splice(index, 1)
      }
    }
  }

  const onRegionalSurge = (callback: (data: any) => void) => {
    // For compatibility - regional surges are handled by surge created events
    return onSurgeCreated(callback)
  }

  // Create surge
  const createSurge = (payload: {
    hospitalId: string
    latitude: number
    longitude: number
    address?: string
    emergencyType?: string
    description?: string
    metadata?: Record<string, any>
  }) => {
    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      socket.value?.emit("create_surge", payload, (response: any) => {
        if (response?.success) {
          resolve(response.surge)
        } else {
          reject(new Error(response?.message || "Failed to create surge"))
        }
      })
    })
  }

  // Cleanup
  const cleanup = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      subscribedHospitals.clear()
      subscribedRegions.clear()
      surgeData.value = []
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    socket,
    isConnected,
    lastError,
    lastActivity,
    surgeData,
    activeSurges,
    isLoadingInitialData,
    subscribedHospitals,
    subscribedRegions,
    initSocket,
    subscribeToHospitalSurges,
    subscribeToRegionalSurges,
    onInitialSurgeData,
    onSurgeCreated,
    onSurgeUpdated,
    onRegionalSurge,
    createSurge,
    cleanup,
  }
}
