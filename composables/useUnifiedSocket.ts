import { io, type Socket } from "socket.io-client"
import { ref, onUnmounted, reactive, computed } from "vue"

export const useUnifiedSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)
  const lastActivity = ref<Date | null>(null)

  // Track subscriptions for different modules
  const subscribedHospitals = reactive(new Set<string>())
  const subscribedRegions = reactive(new Set<string>())
  const subscribedChannels = reactive(new Set<string>())

  // Store for real-time data from different modules
  const surgeData = ref<any[]>([])
  const generalData = ref<any[]>([])
  const isLoadingInitialData = ref(false)

  // Active surges computed property
  const activeSurges = computed(() =>
    surgeData.value.filter((surge) => ["pending", "active", "in-progress"].includes(surge.status)),
  )

  // Initialize unified socket connection
  const initSocket = (url = 'http://localhost:3000') => {
    console.log("🔌 Initializing unified socket connection to:", url)

    if (!url) {
      console.error("❌ No API URL provided")
      lastError.value = "No API URL provided"
      return
    }

    // Clean up existing connection
    if (socket.value) {
      console.log("🧹 Cleaning up existing socket connection")
      socket.value.disconnect()
      socket.value = null
    }

    // Reset state
    isConnected.value = false
    lastError.value = null
    surgeData.value = []
    generalData.value = []

    console.log("🚀 Creating new unified socket connection...")

    socket.value = io('http://localhost:3000', {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: true,
      auth: {
        token: localStorage.getItem("token") || "anonymous",
      },
    })

    // Connection event handlers
    socket.value.on("connect", () => {
      console.log("✅ Unified socket connected successfully:", socket.value?.id)
      isConnected.value = true
      lastActivity.value = new Date()
      lastError.value = null

      // Emit connection confirmation
      socket.value?.emit("client_connected", {
        clientId: socket.value?.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        modules: ["surge", "general"],
      })

      // Resubscribe after reconnection
      console.log("🔄 Resubscribing to existing subscriptions...")

      // Resubscribe to surge subscriptions
      subscribedHospitals.forEach((hospitalId) => {
        console.log(`🏥 Resubscribing to hospital: ${hospitalId}`)
        subscribeToHospitalSurges(hospitalId)
      })

      subscribedRegions.forEach((regionKey) => {
        const [lat, lng, radius] = regionKey.split(":")
        console.log(`🌍 Resubscribing to region: ${lat}, ${lng}, ${radius}km`)
        subscribeToRegionalSurges(Number.parseFloat(lat), Number.parseFloat(lng), Number.parseFloat(radius))
      })

      // Resubscribe to general channels
      subscribedChannels.forEach((channel) => {
        console.log(`📡 Resubscribing to channel: ${channel}`)
        subscribeToChannel(channel)
      })
    })

    socket.value.on("disconnect", (reason) => {
      console.log("❌ Unified socket disconnected:", reason)
      isConnected.value = false
      lastError.value = `Disconnected: ${reason}`
    })

    socket.value.on("connect_error", (err) => {
      console.error("❌ Unified socket connection error:", err)
      lastError.value = err.message
      isConnected.value = false
    })

    socket.value.on("reconnect", (attemptNumber) => {
      console.log("🔄 Unified socket reconnected after", attemptNumber, "attempts")
      isConnected.value = true
      lastError.value = null
    })

    socket.value.on("reconnect_error", (err) => {
      console.error("❌ Unified socket reconnection error:", err)
      lastError.value = `Reconnection failed: ${err.message}`
    })

    socket.value.on("reconnect_failed", () => {
      console.error("❌ Unified socket reconnection failed permanently")
      lastError.value = "Connection failed permanently"
      isConnected.value = false
    })

    // Handle connection status events from server
    socket.value.on("connection_status", (data) => {
      console.log("📡 Connection status from server:", data)
      if (data.connected) {
        isConnected.value = true
        lastError.value = null
      }
    })

    // Handle heartbeat events
    socket.value.on("heartbeat", (data) => {
      console.log("💓 Heartbeat received:", data.timestamp)
      lastActivity.value = new Date(data.timestamp)
      isConnected.value = true
    })

    // Setup event listeners for all modules
    setupUnifiedEventListeners()

    console.log("🎯 Unified socket initialization complete, waiting for connection...")
  }

  // Setup unified event listeners for all modules
  const setupUnifiedEventListeners = () => {
    if (!socket.value) return

    // SURGE MODULE EVENTS
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

    const surgeUpdatedEvents = ["surge_updated", "surge.updated", "hospital_surge_updated", "global_surge_updated"]

    surgeUpdatedEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        handleSurgeUpdateEvent(data, eventName)
      })
    })

    const surgeInitialDataEvents = ["initial_surge_data", "hospital_surges_initial", "regional_surges_initial"]

    surgeInitialDataEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        if (data.surges && Array.isArray(data.surges)) {
          surgeData.value = [...data.surges]
        } else if (Array.isArray(data)) {
          surgeData.value = [...data]
        }
        emitSurgeInitialData(data.surges || data || [], data.hospitalId)
        isLoadingInitialData.value = false
      })
    })

    // GENERAL MODULE EVENTS (for your other WebSocket functionality)
    const generalEvents = ["notification", "alert", "system_update", "user_activity", "data_update"]

    generalEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        handleGeneralEvent(data, eventName)
      })
    })

    // CONFIRMATION EVENTS
    socket.value?.on("hospital_subscription_confirmed", (data) => {
      console.log("✅ Hospital subscription confirmed:", data)
    })

    socket.value?.on("regional_subscription_confirmed", (data) => {
      console.log("✅ Regional subscription confirmed:", data)
    })

    socket.value?.on("channel_subscription_confirmed", (data) => {
      console.log("✅ Channel subscription confirmed:", data)
    })
  }

  // SURGE MODULE HANDLERS
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

  // GENERAL MODULE HANDLERS
  const handleGeneralEvent = (data: any, eventType: string) => {
    console.log(`📡 General event received: ${eventType}`, data)

    // Add to general data store
    generalData.value = [...generalData.value, { ...data, eventType, timestamp: new Date().toISOString() }]

    // Emit to general event callbacks
    emitGeneralEvent(data, eventType)
  }

  // SUBSCRIPTION METHODS

  // Surge subscriptions
  const subscribeToHospitalSurges = (hospitalId: string) => {
    console.log("🏥 Attempting to subscribe to hospital surges:", hospitalId)

    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    isLoadingInitialData.value = true

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        subscribedHospitals.add(hospitalId)
        isLoadingInitialData.value = false
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      const subscriptionPayload = { hospitalId }
      console.log("📤 Sending hospital subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_hospital_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        console.log("📥 Hospital subscription response:", response)

        if (response?.success !== false) {
          subscribedHospitals.add(hospitalId)
          console.log("✅ Successfully subscribed to hospital:", hospitalId)
          resolve(response || { success: true })
        } else {
          console.error("❌ Hospital subscription failed:", response)
          reject(new Error(response?.message || "Subscription failed"))
        }

        isLoadingInitialData.value = false
      })
    })
  }

  const subscribeToRegionalSurges = (latitude: number, longitude: number, radiusInKm: number) => {
    console.log("🌍 Attempting to subscribe to regional surges:", { latitude, longitude, radiusInKm })

    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    const regionKey = `${latitude}:${longitude}:${radiusInKm}`

    return new Promise((resolve, reject) => {
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
      console.log("📤 Sending regional subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_regional_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        console.log("📥 Regional subscription response:", response)

        if (response?.success !== false) {
          subscribedRegions.add(regionKey)
          console.log("✅ Successfully subscribed to region:", regionKey)
          resolve(response || { success: true })
        } else {
          console.error("❌ Regional subscription failed:", response)
          reject(new Error(response?.message || "Subscription failed"))
        }
      })
    })
  }

  // General subscriptions
  const subscribeToChannel = (channel: string) => {
    console.log("📡 Attempting to subscribe to channel:", channel)

    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        subscribedChannels.add(channel)
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      const subscriptionPayload = { channel }
      console.log("📤 Sending channel subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_channel", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        console.log("📥 Channel subscription response:", response)

        if (response?.success !== false) {
          subscribedChannels.add(channel)
          console.log("✅ Successfully subscribed to channel:", channel)
          resolve(response || { success: true })
        } else {
          console.error("❌ Channel subscription failed:", response)
          reject(new Error(response?.message || "Subscription failed"))
        }
      })
    })
  }

  // EVENT CALLBACKS
  const callbacks = {
    surgeInitialData: [] as ((data: any) => void)[],
    surgeCreated: [] as ((data: any) => void)[],
    surgeUpdated: [] as ((data: any) => void)[],
    generalEvent: [] as ((data: any) => void)[],
  }

  const emitSurgeInitialData = (data: any[], hospitalId?: string) => {
    callbacks.surgeInitialData.forEach((callback) => {
      try {
        callback({ surges: data, hospitalId })
      } catch (error) {
        console.error("Error in surge initial data callback:", error)
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

  const emitGeneralEvent = (data: any, eventType?: string) => {
    callbacks.generalEvent.forEach((callback) => {
      try {
        callback({ data, eventType, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error("Error in general event callback:", error)
      }
    })
  }

  // CALLBACK REGISTRATION
  const onSurgeInitialData = (callback: (data: any) => void) => {
    callbacks.surgeInitialData.push(callback)
    return () => {
      const index = callbacks.surgeInitialData.indexOf(callback)
      if (index !== -1) {
        callbacks.surgeInitialData.splice(index, 1)
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

  const onGeneralEvent = (callback: (data: any) => void) => {
    callbacks.generalEvent.push(callback)
    return () => {
      const index = callbacks.generalEvent.indexOf(callback)
      if (index !== -1) {
        callbacks.generalEvent.splice(index, 1)
      }
    }
  }

  // UTILITY METHODS
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

  const sendGeneralMessage = (event: string, payload: any) => {
    if (!socket.value || !isConnected.value) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      socket.value?.emit(event, payload, (response: any) => {
        if (response?.success !== false) {
          resolve(response)
        } else {
          reject(new Error(response?.message || "Failed to send message"))
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
      subscribedChannels.clear()
      surgeData.value = []
      generalData.value = []
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    // Connection state
    socket,
    isConnected,
    lastError,
    lastActivity,

    // Data stores
    surgeData,
    activeSurges,
    generalData,
    isLoadingInitialData,

    // Subscription tracking
    subscribedHospitals,
    subscribedRegions,
    subscribedChannels,

    // Connection methods
    initSocket,
    cleanup,

    // Surge methods
    subscribeToHospitalSurges,
    subscribeToRegionalSurges,
    onSurgeInitialData,
    onSurgeCreated,
    onSurgeUpdated,
    createSurge,

    // General methods
    subscribeToChannel,
    onGeneralEvent,
    sendGeneralMessage,
  }
}
