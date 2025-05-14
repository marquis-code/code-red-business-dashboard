import { io, type Socket } from "socket.io-client"
import { ref, onUnmounted, reactive } from "vue"

export const useBedSpaceSocket = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)
  const lastActivity = ref<Date | null>(null)
  
  // Track hospital subscriptions
  const subscribedHospitals = reactive(new Set<string>())
  
  // Store for real-time bedspace data
  const bedspaceData = ref<any[]>([])
  const isLoadingInitialData = ref(false)
  
  // Debug mode for logging
  const debugMode = ref(true)
  
  // Debug logger
  const logDebug = (message: string, data?: any) => {
    if (debugMode.value) {
      if (data) {
        console.log(`[BedSpaceSocket] ${message}`, data)
      } else {
        console.log(`[BedSpaceSocket] ${message}`)
      }
    }
  }
  
  // Initialize socket connection
  const initSocket = (url = import.meta.env.VITE_BASE_URL) => {
    logDebug(`Initializing socket connection to ${url}`)
    
    socket.value = io(url, {
      transports: ["websocket", "polling"], // Match backend configuration
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem('token') // Add token for authentication
      }
    })

    socket.value.on("connect", () => {
      logDebug(`Socket connected with ID: ${socket.value?.id}`)
      isConnected.value = true
      lastActivity.value = new Date()
      lastError.value = null
      
      // Resubscribe to previously subscribed hospitals after reconnection
      subscribedHospitals.forEach(hospitalId => {
        joinHospitalRoom(hospitalId)
      })
    })

    socket.value.on("disconnect", () => {
      logDebug("Socket disconnected")
      isConnected.value = false
    })

    socket.value.on("connect_error", (err) => {
      logDebug("Connection error:", err)
      lastError.value = err.message
      isConnected.value = false
    })
    
    // Handle heartbeat to keep connection alive
    socket.value.on("heartbeat", (data) => {
      lastActivity.value = new Date(data.timestamp)
      socket.value?.emit("heartbeat_response")
    })
    
    // Handle connection status updates
    socket.value.on("connection_status", (data) => {
      logDebug("Connection status:", data)
    })
    
    // Handle errors from server
    socket.value.on("error", (error) => {
      logDebug("Server error:", error)
      lastError.value = error.message || "Unknown server error"
    })
    
    // Listen for ALL possible event names that might contain bedspace updates
    setupBedspaceEventListeners()
  }
  
  // Set up all possible event listeners for bedspace updates
  const setupBedspaceEventListeners = () => {
    if (!socket.value) return
    
    // List of all possible event names that might contain bedspace updates
    const bedspaceEventNames = [
      "bedspace_updated",
      "bedSpaceUpdated",
      "initial_bedspace_data",
      "initialBedspaceData",
      "bedspace.updated",
      "hospital_bedspace_updated"
    ]
    
    // Register a debug listener for ALL events to help identify the correct event name
    socket.value.onAny((eventName, ...args) => {
      logDebug(`Received event: ${eventName}`, args)
    })
    
    // Register listeners for all possible event names
    bedspaceEventNames.forEach(eventName => {
      socket.value?.on(eventName, (data) => {
        logDebug(`Received ${eventName} event:`, data)
        // Process the data regardless of event name
        processBedspaceUpdate(eventName, data)
      })
    })
  }
  
  // Process bedspace update data regardless of event name
  const processBedspaceUpdate = (eventName: string, data: any) => {
    // Store the raw data for debugging
    const lastReceivedData = ref(data)
    
    // Extract bedspace data based on event name and data structure
    let bedspaceData
    let hospitalId
    
    if (eventName === "initial_bedspace_data" || eventName === "initialBedspaceData") {
      // Handle initial data format
      bedspaceData = data.bedspaces || []
      hospitalId = data.hospitalId
      
      // Emit the processed data for initial data
      emitInitialData(bedspaceData, hospitalId)
    } else {
      // Handle update formats - try different possible structures
      if (data.bedspace) {
        // Format: { bedspace: {...}, hospitalId: "..." }
        bedspaceData = data.bedspace
        hospitalId = data.hospitalId || data.bedspace.hospital
      } else if (data.data && data.data.bedspace) {
        // Format: { data: { bedspace: {...}, hospitalId: "..." } }
        bedspaceData = data.data.bedspace
        hospitalId = data.data.hospitalId || data.data.bedspace.hospital
      } else if (Array.isArray(data)) {
        // Format: Array of bedspaces
        bedspaceData = data
      } else {
        // Assume the data itself is the bedspace
        bedspaceData = data
        hospitalId = data.hospital
      }
      
      // Emit the processed data for updates
      if (Array.isArray(bedspaceData)) {
        bedspaceData.forEach(item => {
          emitBedspaceUpdate(item, hospitalId)
        })
      } else if (bedspaceData) {
        emitBedspaceUpdate(bedspaceData, hospitalId)
      }
    }
  }

  // Join a hospital room to receive updates for a specific hospital
  const joinHospitalRoom = (hospitalId: string) => {
    if (!socket.value || !isConnected.value) {
      logDebug(`Cannot join hospital room: Socket not connected`)
      return Promise.reject(new Error("Socket not connected"))
    }

    isLoadingInitialData.value = true
    logDebug(`Attempting to join hospital room: ${hospitalId}`)
    
    return new Promise((resolve, reject) => {
      // Try both event names to ensure compatibility
      socket.value?.emit("subscribe_hospital", { hospitalId }, (response: any) => {
        logDebug(`Joined hospital room response (subscribe_hospital):`, response)
        
        if (response?.success) {
          subscribedHospitals.add(hospitalId)
          resolve(response)
        } else {
          // If first attempt fails, try alternative event name
          socket.value?.emit("joinHospitalRoom", hospitalId, (altResponse: any) => {
            logDebug(`Joined hospital room response (joinHospitalRoom):`, altResponse)
            
            if (altResponse?.success) {
              subscribedHospitals.add(hospitalId)
              resolve(altResponse)
            } else {
              reject(new Error("Failed to join hospital room with both event names"))
            }
          })
        }
        
        isLoadingInitialData.value = false
      })
    })
  }

  // Leave a hospital room
  const leaveHospitalRoom = (hospitalId: string) => {
    if (!socket.value || !isConnected.value) {
      logDebug(`Cannot leave hospital room: Socket not connected`)
      return Promise.reject(new Error("Socket not connected"))
    }

    logDebug(`Attempting to leave hospital room: ${hospitalId}`)
    
    return new Promise((resolve, reject) => {
      // Try both event names to ensure compatibility
      socket.value?.emit("unsubscribe_hospital", { hospitalId }, (response: any) => {
        logDebug(`Left hospital room (unsubscribe_hospital):`, response)
        
        if (response?.success) {
          subscribedHospitals.delete(hospitalId)
          resolve(response)
        } else {
          // If first attempt fails, try alternative event name
          socket.value?.emit("leaveHospitalRoom", hospitalId, (altResponse: any) => {
            logDebug(`Left hospital room (leaveHospitalRoom):`, altResponse)
            
            if (altResponse?.success) {
              subscribedHospitals.delete(hospitalId)
              resolve(altResponse)
            } else {
              reject(new Error("Failed to leave hospital room with both event names"))
            }
          })
        }
      })
    })
  }

  // Update bed space availability
  const updateBedSpace = (unitId: string, availableBeds: number, hospitalId?: string) => {
    if (!socket.value || !isConnected.value) {
      logDebug(`Cannot update bed space: Socket not connected`)
      return Promise.reject(new Error("Socket not connected"))
    }

    logDebug(`Updating bed space: unitId=${unitId}, availableBeds=${availableBeds}, hospitalId=${hospitalId}`)
    
    return new Promise((resolve, reject) => {
      // The backend expects a different event name and payload structure
      socket.value?.emit(
        "updateBedSpace", 
        { unitId, availableBeds, hospitalId }, 
        (response: any) => {
          logDebug(`Update bed space response:`, response)
          
          if (response?.success) {
            resolve(response.data)
          } else {
            reject(new Error(response?.error || "Failed to update bed space"))
          }
        }
      )
    })
  }

  // Send emergency notification
  const sendEmergencyNotification = (hospitalId: string, userLocation: string, latitude: number, longitude: number) => {
    if (!socket.value || !isConnected.value) {
      logDebug(`Cannot send emergency notification: Socket not connected`)
      return Promise.reject(new Error("Socket not connected"))
    }

    return new Promise((resolve, reject) => {
      socket.value?.emit(
        "emergencyNotification",
        { hospitalId, userLocation, latitude, longitude },
        (response: any) => {
          logDebug(`Emergency notification response:`, response)
          
          if (response?.success) {
            resolve(response.data)
          } else {
            reject(new Error(response?.error || "Failed to send emergency notification"))
          }
        }
      )
    })
  }

  // Event callbacks storage
  const callbacks = {
    initialData: [] as ((data: any) => void)[],
    bedspaceUpdate: [] as ((data: any) => void)[],
    hospitalStatus: [] as ((data: any) => void)[],
    emergencyAlert: [] as ((data: any) => void)[]
  }

  // Emit initial data to all registered callbacks
  const emitInitialData = (data: any, hospitalId?: string) => {
    logDebug(`Emitting initial data to ${callbacks.initialData.length} callbacks`)
    callbacks.initialData.forEach(callback => {
      try {
        callback({ bedspaces: data, hospitalId })
      } catch (error) {
        console.error('Error in initial data callback:', error)
      }
    })
  }

  // Emit bedspace update to all registered callbacks
  const emitBedspaceUpdate = (data: any, hospitalId?: string) => {
    logDebug(`Emitting bedspace update to ${callbacks.bedspaceUpdate.length} callbacks`)
    callbacks.bedspaceUpdate.forEach(callback => {
      try {
        callback({ bedspace: data, hospitalId, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error('Error in bedspace update callback:', error)
      }
    })
  }

  // Listen for initial bedspace data
  const onInitialBedspaceData = (callback: (data: any) => void) => {
    logDebug(`Registering initial bedspace data callback`)
    callbacks.initialData.push(callback)

    return () => {
      const index = callbacks.initialData.indexOf(callback)
      if (index !== -1) {
        callbacks.initialData.splice(index, 1)
      }
    }
  }

  // Listen for bed space updates
  const onBedSpaceUpdated = (callback: (data: any) => void) => {
    logDebug(`Registering bedspace update callback`)
    callbacks.bedspaceUpdate.push(callback)

    return () => {
      const index = callbacks.bedspaceUpdate.indexOf(callback)
      if (index !== -1) {
        callbacks.bedspaceUpdate.splice(index, 1)
      }
    }
  }

  // Listen for hospital status changes
  const onHospitalStatusChanged = (callback: (data: any) => void) => {
    if (!socket.value) return () => {}

    logDebug(`Registering hospital status callback`)
    callbacks.hospitalStatus.push(callback)
    
    socket.value.on("hospital_status_changed", callback)

    return () => {
      socket.value?.off("hospital_status_changed", callback)
      const index = callbacks.hospitalStatus.indexOf(callback)
      if (index !== -1) {
        callbacks.hospitalStatus.splice(index, 1)
      }
    }
  }

  // Listen for emergency alerts (for hospital admin dashboard)
  const onEmergencyAlert = (callback: (data: any) => void) => {
    if (!socket.value) return () => {}

    logDebug(`Registering emergency alert callback`)
    callbacks.emergencyAlert.push(callback)
    
    socket.value.on("emergency_created", callback)

    return () => {
      socket.value?.off("emergency_created", callback)
      const index = callbacks.emergencyAlert.indexOf(callback)
      if (index !== -1) {
        callbacks.emergencyAlert.splice(index, 1)
      }
    }
  }

  // Ping the server to check connection
  const ping = () => {
    if (!socket.value || !isConnected.value) return Promise.reject(new Error("Socket not connected"))

    return new Promise((resolve) => {
      const startTime = Date.now()
      socket.value?.emit("ping", {}, (response: any) => {
        const latency = Date.now() - startTime
        resolve({ latency, response })
      })
    })
  }

  // Get hospital ID from local storage
  const getHospitalIdFromLocalStorage = (): string | null => {
    try {
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        return userData.id || null
      }
      return null
    } catch (error) {
      console.error('Error getting hospital ID from local storage:', error)
      return null
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (socket.value) {
      logDebug(`Cleaning up socket connection`)
      
      // Leave all subscribed hospital rooms before disconnecting
      subscribedHospitals.forEach(hospitalId => {
        leaveHospitalRoom(hospitalId)
      })
      
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      subscribedHospitals.clear()
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
    lastActivity,
    bedspaceData,
    isLoadingInitialData,
    subscribedHospitals,
    debugMode,
    initSocket,
    joinHospitalRoom,
    leaveHospitalRoom,
    updateBedSpace,
    sendEmergencyNotification,
    onInitialBedspaceData,
    onBedSpaceUpdated,
    onHospitalStatusChanged,
    onEmergencyAlert,
    ping,
    getHospitalIdFromLocalStorage,
    cleanup,
  }
}