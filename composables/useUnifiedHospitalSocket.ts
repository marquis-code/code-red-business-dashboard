import { io, type Socket } from "socket.io-client"
import { ref, onUnmounted, reactive, computed } from "vue"

// Define module types
type SocketModule = "surge" | "bedspace" | "general"

// Define connection state
interface ConnectionState {
  connected: boolean
  activeModules: Set<SocketModule>
  lastActivity: Date | null
  error: string | null
}

export const useUnifiedHospitalSocket = () => {
  const socket = ref<Socket | null>(null)
  const connectionState = ref<ConnectionState>({
    connected: false,
    activeModules: new Set(),
    lastActivity: null,
    error: null,
  })

  // Track subscriptions for different modules
  const subscribedHospitals = reactive(new Set<string>())
  const subscribedRegions = reactive(new Set<string>())
  const subscribedChannels = reactive(new Set<string>())

  // Data stores for different modules
  const surgeData = ref<any[]>([])
  const bedspaceData = ref<any[]>([])
  const generalData = ref<any[]>([])
  const isLoadingInitialData = ref(false)

  // Debug mode
  const debugMode = ref(true)

  // Computed properties
  const isConnected = computed(() => connectionState.value.connected)
  const lastError = computed(() => connectionState.value.error)
  const lastActivity = computed(() => connectionState.value.lastActivity)
  const activeModules = computed(() => Array.from(connectionState.value.activeModules))

  const activeSurges = computed(() =>
    surgeData.value.filter((surge) => ["pending", "active", "in-progress"].includes(surge.status)),
  )

  // Debug logger
  const logDebug = (module: string, message: string, data?: any) => {
    if (debugMode.value) {
      const timestamp = new Date().toISOString()
      if (data) {
        console.log(`[${timestamp}][${module}] ${message}`, data)
      } else {
        console.log(`[${timestamp}][${module}] ${message}`)
      }
    }
  }

  // Initialize unified socket connection
  const initSocket = (
    url = 'http://localhost:3000',
  ) => {
    logDebug("UNIFIED", `Initializing unified socket connection to: ${url}`)

    if (!url) {
      const error = "No API URL provided"
      logDebug("UNIFIED", `❌ ${error}`)
      connectionState.value.error = error
      return
    }

    // Clean up existing connection
    if (socket.value) {
      logDebug("UNIFIED", "🧹 Cleaning up existing socket connection")
      socket.value.disconnect()
      socket.value = null
    }

    // Reset state
    connectionState.value = {
      connected: false,
      activeModules: new Set(),
      lastActivity: null,
      error: null,
    }
    surgeData.value = []
    bedspaceData.value = []
    generalData.value = []

    logDebug("UNIFIED", "🚀 Creating new unified socket connection...")

    socket.value = io(url, {
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
      logDebug("UNIFIED", `✅ Socket connected successfully: ${socket.value?.id}`)
      connectionState.value.connected = true
      connectionState.value.lastActivity = new Date()
      connectionState.value.error = null

      // Emit connection confirmation with module support
      socket.value?.emit("client_connected", {
        clientId: socket.value?.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        supportedModules: ["surge", "bedspace", "general"],
      })

      // Resubscribe after reconnection
      logDebug("UNIFIED", "🔄 Resubscribing to existing subscriptions...")
      resubscribeAll()
    })

    socket.value.on("disconnect", (reason) => {
      logDebug("UNIFIED", `❌ Socket disconnected: ${reason}`)
      connectionState.value.connected = false
      connectionState.value.error = `Disconnected: ${reason}`
    })

    socket.value.on("connect_error", (err) => {
      logDebug("UNIFIED", `❌ Socket connection error: ${err.message}`)
      connectionState.value.error = err.message
      connectionState.value.connected = false
    })

    socket.value.on("reconnect", (attemptNumber) => {
      logDebug("UNIFIED", `🔄 Socket reconnected after ${attemptNumber} attempts`)
      connectionState.value.connected = true
      connectionState.value.error = null
    })

    // Handle heartbeat events
    socket.value.on("heartbeat", (data) => {
      logDebug("UNIFIED", `💓 Heartbeat received: ${data.timestamp}`)
      connectionState.value.lastActivity = new Date(data.timestamp)
      connectionState.value.connected = true
      socket.value?.emit("heartbeat_response")
    })

    // Setup unified event listeners for all modules
    setupUnifiedEventListeners()

    logDebug("UNIFIED", "🎯 Unified socket initialization complete, waiting for connection...")
  }

  // Resubscribe to all existing subscriptions
  const resubscribeAll = async () => {
    // Resubscribe to surge subscriptions
    for (const hospitalId of subscribedHospitals) {
      logDebug("SURGE", `🏥 Resubscribing to hospital: ${hospitalId}`)
      await subscribeToHospitalSurges(hospitalId)
    }

    for (const regionKey of subscribedRegions) {
      const [lat, lng, radius] = regionKey.split(":")
      logDebug("SURGE", `🌍 Resubscribing to region: ${lat}, ${lng}, ${radius}km`)
      await subscribeToRegionalSurges(Number.parseFloat(lat), Number.parseFloat(lng), Number.parseFloat(radius))
    }

    // Resubscribe to bedspace subscriptions
    for (const hospitalId of subscribedHospitals) {
      logDebug("BEDSPACE", `🏥 Resubscribing to hospital bedspace: ${hospitalId}`)
      await joinHospitalRoom(hospitalId)
    }

    // Resubscribe to general channels
    for (const channel of subscribedChannels) {
      logDebug("GENERAL", `📡 Resubscribing to channel: ${channel}`)
      await subscribeToChannel(channel)
    }
  }

  // Setup unified event listeners for all modules
  const setupUnifiedEventListeners = () => {
    if (!socket.value) return

    // Global event listener for debugging
    socket.value.onAny((eventName, ...args) => {
      logDebug("EVENT", `Received event: ${eventName}`, args)
    })

    // SURGE MODULE EVENTS
    const surgeEvents = [
      "surge_created",
      "new_surge",
      "surge.created",
      "hospital_surge_created",
      "regional_surge_created",
      "emergency_surge",
      "global_surge_created",
      "surge_updated",
      "surge.updated",
      "hospital_surge_updated",
      "global_surge_updated",
      "initial_surge_data",
      "hospital_surges_initial",
      "regional_surges_initial",
    ]

    surgeEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        logDebug("SURGE", `📡 Received ${eventName}:`, data)
        handleSurgeEvent(data, eventName)
      })
    })

    // BEDSPACE MODULE EVENTS
    const bedspaceEvents = [
      "bedspace_updated",
      "bedSpaceUpdated",
      "initial_bedspace_data",
      "initialBedspaceData",
      "bedspace.updated",
      "hospital_bedspace_updated",
    ]

    bedspaceEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        logDebug("BEDSPACE", `📡 Received ${eventName}:`, data)
        handleBedspaceEvent(data, eventName)
      })
    })

    // GENERAL MODULE EVENTS
    const generalEvents = [
      "notification",
      "alert",
      "system_update",
      "user_activity",
      "data_update",
      "hospital_status_changed",
      "emergency_created",
      "connection_status",
    ]

    generalEvents.forEach((eventName) => {
      socket.value?.on(eventName, (data) => {
        logDebug("GENERAL", `📡 Received ${eventName}:`, data)
        handleGeneralEvent(data, eventName)
      })
    })

    // CONFIRMATION EVENTS
    socket.value?.on("hospital_subscription_confirmed", (data) => {
      logDebug("UNIFIED", "✅ Hospital subscription confirmed:", data)
    })

    socket.value?.on("regional_subscription_confirmed", (data) => {
      logDebug("UNIFIED", "✅ Regional subscription confirmed:", data)
    })

    socket.value?.on("channel_subscription_confirmed", (data) => {
      logDebug("UNIFIED", "✅ Channel subscription confirmed:", data)
    })
  }

  // SURGE MODULE HANDLERS
  const handleSurgeEvent = (data: any, eventType: string) => {
    connectionState.value.activeModules.add("surge")

    let surge = null
    let hospitalId = null

    if (data.surge) {
      surge = data.surge
      hospitalId = data.hospitalId || data.surge.hospital
    } else if (data._id) {
      surge = data
      hospitalId = data.hospital
    }

    if (eventType.includes("initial")) {
      // Handle initial data
      if (data.surges && Array.isArray(data.surges)) {
        surgeData.value = [...data.surges]
      } else if (Array.isArray(data)) {
        surgeData.value = [...data]
      }
      emitSurgeInitialData(data.surges || data || [], data.hospitalId)
      isLoadingInitialData.value = false
    } else if (surge) {
      // Handle surge creation/update
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

      if (eventType.includes("created")) {
        emitSurgeCreated(surge, hospitalId, eventType)
      } else {
        emitSurgeUpdated(surge, hospitalId, eventType)
      }
    }
  }

  // BEDSPACE MODULE HANDLERS
  const handleBedspaceEvent = (data: any, eventType: string) => {
    connectionState.value.activeModules.add("bedspace")

    let bedspaceData
    let hospitalId

    if (eventType.includes("initial")) {
      // Handle initial bedspace data
      bedspaceData = data.bedspaces || []
      hospitalId = data.hospitalId
      emitBedspaceInitialData(bedspaceData, hospitalId)
    } else {
      // Handle bedspace updates
      if (data.bedspace) {
        bedspaceData = data.bedspace
        hospitalId = data.hospitalId || data.bedspace.hospital
      } else if (data.data && data.data.bedspace) {
        bedspaceData = data.data.bedspace
        hospitalId = data.data.hospitalId || data.data.bedspace.hospital
      } else if (Array.isArray(data)) {
        bedspaceData = data
      } else {
        bedspaceData = data
        hospitalId = data.hospital
      }

      if (Array.isArray(bedspaceData)) {
        bedspaceData.forEach((item) => {
          emitBedspaceUpdate(item, hospitalId)
        })
      } else if (bedspaceData) {
        emitBedspaceUpdate(bedspaceData, hospitalId)
      }
    }
  }

  // GENERAL MODULE HANDLERS
  const handleGeneralEvent = (data: any, eventType: string) => {
    connectionState.value.activeModules.add("general")

    logDebug("GENERAL", `📡 General event received: ${eventType}`, data)

    // Add to general data store
    generalData.value = [...generalData.value, { ...data, eventType, timestamp: new Date().toISOString() }]

    // Emit to general event callbacks
    emitGeneralEvent(data, eventType)
  }

  // SURGE SUBSCRIPTION METHODS
  const subscribeToHospitalSurges = (hospitalId: string) => {
    logDebug("SURGE", `🏥 Attempting to subscribe to hospital surges: ${hospitalId}`)

    if (!socket.value || !connectionState.value.connected) {
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
      logDebug("SURGE", "📤 Sending hospital subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_hospital_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        logDebug("SURGE", "📥 Hospital subscription response:", response)

        if (response?.success !== false) {
          subscribedHospitals.add(hospitalId)
          logDebug("SURGE", `✅ Successfully subscribed to hospital: ${hospitalId}`)
          resolve(response || { success: true })
        } else {
          logDebug("SURGE", `❌ Hospital subscription failed: ${response}`)
          reject(new Error(response?.message || "Subscription failed"))
        }

        isLoadingInitialData.value = false
      })
    })
  }

  const subscribeToRegionalSurges = (latitude: number, longitude: number, radiusInKm: number) => {
    logDebug("SURGE", `🌍 Attempting to subscribe to regional surges: ${latitude}, ${longitude}, ${radiusInKm}km`)

    if (!socket.value || !connectionState.value.connected) {
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
      logDebug("SURGE", "📤 Sending regional subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_regional_surges", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        logDebug("SURGE", "📥 Regional subscription response:", response)

        if (response?.success !== false) {
          subscribedRegions.add(regionKey)
          logDebug("SURGE", `✅ Successfully subscribed to region: ${regionKey}`)
          resolve(response || { success: true })
        } else {
          logDebug("SURGE", `❌ Regional subscription failed: ${response}`)
          reject(new Error(response?.message || "Subscription failed"))
        }
      })
    })
  }

  // BEDSPACE SUBSCRIPTION METHODS
  const joinHospitalRoom = (hospitalId: string) => {
    logDebug("BEDSPACE", `🏥 Attempting to join hospital room: ${hospitalId}`)

    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    isLoadingInitialData.value = true

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        subscribedHospitals.add(hospitalId)
        isLoadingInitialData.value = false
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      // Try both event names for compatibility
      socket.value?.emit("subscribe_hospital", { hospitalId }, (response: any) => {
        clearTimeout(timeout)
        logDebug("BEDSPACE", `📥 Hospital room subscription response (subscribe_hospital):`, response)

        if (response?.success !== false) {
          subscribedHospitals.add(hospitalId)
          logDebug("BEDSPACE", `✅ Successfully joined hospital room: ${hospitalId}`)
          resolve(response || { success: true })
        } else {
          // Try alternative event name
          socket.value?.emit("joinHospitalRoom", hospitalId, (altResponse: any) => {
            logDebug("BEDSPACE", `📥 Hospital room subscription response (joinHospitalRoom):`, altResponse)

            if (altResponse?.success !== false) {
              subscribedHospitals.add(hospitalId)
              resolve(altResponse || { success: true })
            } else {
              reject(new Error("Failed to join hospital room with both event names"))
            }
          })
        }

        isLoadingInitialData.value = false
      })
    })
  }

  const leaveHospitalRoom = (hospitalId: string) => {
    logDebug("BEDSPACE", `🏥 Attempting to leave hospital room: ${hospitalId}`)

    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      // Try both event names for compatibility
      socket.value?.emit("unsubscribe_hospital", { hospitalId }, (response: any) => {
        logDebug("BEDSPACE", `📥 Left hospital room (unsubscribe_hospital):`, response)

        if (response?.success !== false) {
          subscribedHospitals.delete(hospitalId)
          resolve(response || { success: true })
        } else {
          // Try alternative event name
          socket.value?.emit("leaveHospitalRoom", hospitalId, (altResponse: any) => {
            logDebug("BEDSPACE", `📥 Left hospital room (leaveHospitalRoom):`, altResponse)

            if (altResponse?.success !== false) {
              subscribedHospitals.delete(hospitalId)
              resolve(altResponse || { success: true })
            } else {
              reject(new Error("Failed to leave hospital room with both event names"))
            }
          })
        }
      })
    })
  }

  // GENERAL SUBSCRIPTION METHODS
  const subscribeToChannel = (channel: string) => {
    logDebug("GENERAL", `📡 Attempting to subscribe to channel: ${channel}`)

    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        subscribedChannels.add(channel)
        resolve({ success: true, message: "Timeout fallback subscription" })
      }, 15000)

      const subscriptionPayload = { channel }
      logDebug("GENERAL", "📤 Sending channel subscription:", subscriptionPayload)

      socket.value?.emit("subscribe_channel", subscriptionPayload, (response: any) => {
        clearTimeout(timeout)
        logDebug("GENERAL", "📥 Channel subscription response:", response)

        if (response?.success !== false) {
          subscribedChannels.add(channel)
          logDebug("GENERAL", `✅ Successfully subscribed to channel: ${channel}`)
          resolve(response || { success: true })
        } else {
          logDebug("GENERAL", `❌ Channel subscription failed: ${response}`)
          reject(new Error(response?.message || "Subscription failed"))
        }
      })
    })
  }

  // ACTION METHODS
  const createSurge = (payload: {
    hospitalId: string
    latitude: number
    longitude: number
    address?: string
    emergencyType?: string
    description?: string
    metadata?: Record<string, any>
  }) => {
    if (!socket.value || !connectionState.value.connected) {
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

  const updateBedSpace = (unitId: string, availableBeds: number, hospitalId?: string) => {
    logDebug(
      "BEDSPACE",
      `🛏️ Updating bed space: unitId=${unitId}, availableBeds=${availableBeds}, hospitalId=${hospitalId}`,
    )

    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      socket.value?.emit("updateBedSpace", { unitId, availableBeds, hospitalId }, (response: any) => {
        logDebug("BEDSPACE", `📥 Update bed space response:`, response)

        if (response?.success) {
          resolve(response.data)
        } else {
          reject(new Error(response?.error || "Failed to update bed space"))
        }
      })
    })
  }

  const sendEmergencyNotification = (hospitalId: string, userLocation: string, latitude: number, longitude: number) => {
    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      socket.value?.emit(
        "emergencyNotification",
        { hospitalId, userLocation, latitude, longitude },
        (response: any) => {
          logDebug("BEDSPACE", `📥 Emergency notification response:`, response)

          if (response?.success) {
            resolve(response.data)
          } else {
            reject(new Error(response?.error || "Failed to send emergency notification"))
          }
        },
      )
    })
  }

  const sendGeneralMessage = (event: string, payload: any) => {
    if (!socket.value || !connectionState.value.connected) {
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

  // UTILITY METHODS
  const ping = () => {
    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve) => {
      const startTime = Date.now()
      socket.value?.emit("ping", {}, (response: any) => {
        const latency = Date.now() - startTime
        resolve({ latency, response })
      })
    })
  }

  const getHospitalIdFromLocalStorage = (): string | null => {
    try {
      const userDataStr = localStorage.getItem("user")
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        return userData.id || null
      }
      return null
    } catch (error) {
      console.error("Error getting hospital ID from local storage:", error)
      return null
    }
  }

  const switchModule = (module: SocketModule) => {
    logDebug("UNIFIED", `🔄 Switching to module: ${module}`)
    connectionState.value.activeModules.add(module)
  }

  const getConnectionStats = () => {
    if (!socket.value || !connectionState.value.connected) {
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve) => {
      socket.value?.emit("get_connection_stats", {}, (response: any) => {
        resolve(response)
      })
    })
  }

  // EVENT CALLBACKS
  const callbacks = {
    surgeInitialData: [] as ((data: any) => void)[],
    surgeCreated: [] as ((data: any) => void)[],
    surgeUpdated: [] as ((data: any) => void)[],
    bedspaceInitialData: [] as ((data: any) => void)[],
    bedspaceUpdate: [] as ((data: any) => void)[],
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

  const emitBedspaceInitialData = (data: any[], hospitalId?: string) => {
    callbacks.bedspaceInitialData.forEach((callback) => {
      try {
        callback({ bedspaces: data, hospitalId })
      } catch (error) {
        console.error("Error in bedspace initial data callback:", error)
      }
    })
  }

  const emitBedspaceUpdate = (data: any, hospitalId?: string) => {
    callbacks.bedspaceUpdate.forEach((callback) => {
      try {
        callback({ bedspace: data, hospitalId, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error("Error in bedspace update callback:", error)
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

  const onBedspaceInitialData = (callback: (data: any) => void) => {
    callbacks.bedspaceInitialData.push(callback)
    return () => {
      const index = callbacks.bedspaceInitialData.indexOf(callback)
      if (index !== -1) {
        callbacks.bedspaceInitialData.splice(index, 1)
      }
    }
  }

  const onBedSpaceUpdated = (callback: (data: any) => void) => {
    callbacks.bedspaceUpdate.push(callback)
    return () => {
      const index = callbacks.bedspaceUpdate.indexOf(callback)
      if (index !== -1) {
        callbacks.bedspaceUpdate.splice(index, 1)
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

  // Legacy compatibility methods
  const onInitialBedspaceData = onBedspaceInitialData
  const onHospitalStatusChanged = (callback: (data: any) => void) => onGeneralEvent(callback)
  const onEmergencyAlert = (callback: (data: any) => void) => onGeneralEvent(callback)

  // Cleanup
  const cleanup = () => {
    if (socket.value) {
      logDebug("UNIFIED", "🧹 Cleaning up unified socket connection")

      // Leave all subscribed rooms before disconnecting
      subscribedHospitals.forEach((hospitalId) => {
        leaveHospitalRoom(hospitalId)
      })

      socket.value.disconnect()
      socket.value = null
      connectionState.value = {
        connected: false,
        activeModules: new Set(),
        lastActivity: null,
        error: null,
      }
      subscribedHospitals.clear()
      subscribedRegions.clear()
      subscribedChannels.clear()
      surgeData.value = []
      bedspaceData.value = []
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
    activeModules,
    connectionState,

    // Data stores
    surgeData,
    activeSurges,
    bedspaceData,
    generalData,
    isLoadingInitialData,

    // Subscription tracking
    subscribedHospitals,
    subscribedRegions,
    subscribedChannels,

    // Configuration
    debugMode,

    // Connection methods
    initSocket,
    cleanup,
    switchModule,
    getConnectionStats,

    // Surge methods
    subscribeToHospitalSurges,
    subscribeToRegionalSurges,
    onSurgeInitialData,
    onSurgeCreated,
    onSurgeUpdated,
    createSurge,

    // Bedspace methods
    joinHospitalRoom,
    leaveHospitalRoom,
    updateBedSpace,
    sendEmergencyNotification,
    onBedspaceInitialData,
    onBedSpaceUpdated,
    onInitialBedspaceData,
    onHospitalStatusChanged,
    onEmergencyAlert,

    // General methods
    subscribeToChannel,
    onGeneralEvent,
    sendGeneralMessage,

    // Utility methods
    ping,
    getHospitalIdFromLocalStorage,
  }
}
