import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    type OnGatewayConnection,
    type OnGatewayDisconnect,
    type OnGatewayInit,
    WsException,
  } from "@nestjs/websockets"
  import type { Server, Socket } from "socket.io"
  import { Logger, Injectable } from "@nestjs/common"
  import { type EventEmitter2, OnEvent } from "@nestjs/event-emitter"
  import type { JwtService } from "@nestjs/jwt"
  import type { Model } from "mongoose"
  import type { HospitalDocument } from "../../hospital/schemas/hospital.schema"
  import type { SurgeDocument } from "../../surge/schema/surge.schema"
  
  @WebSocketGateway({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingInterval: 10000,
    pingTimeout: 5000,
  })
  @Injectable()
  export class UnifiedGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private logger = new Logger("UnifiedGateway")
  
    // Client tracking
    private connectedClients: Map<string, Set<string>> = new Map()
    private clientRooms: Map<string, Set<string>> = new Map()
    private clientChannels: Map<string, Set<string>> = new Map()
  
    // Subscription tracking
    private regionalSubscriptions: Map<string, { lat: number; lng: number; radius: number }> = new Map()
  
    constructor(
      private eventEmitter: EventEmitter2,
      private jwtService: JwtService,
      private hospitalModel: Model<HospitalDocument>,
      private surgeModel: Model<SurgeDocument>,
    ) {}
  
    afterInit(server: Server) {
      this.logger.log("🚀 Unified WebSocket Gateway initialized")
  
      // Enhanced connection setup
      server.use((socket: Socket, next) => {
        this.logger.log(`🔌 Socket middleware: ${socket.id} from ${socket.handshake.address}`)
  
        // Log connection details
        this.logger.log(`📋 Connection details:`, {
          id: socket.id,
          transport: socket.conn.transport.name,
          address: socket.handshake.address,
          userAgent: socket.handshake.headers["user-agent"],
          origin: socket.handshake.headers.origin,
        })
  
        // Allow all connections
        next()
      })
  
      // Enhanced error handling
      server.on("connection_error", (err) => {
        this.logger.error(`❌ Connection error: ${err.message}`)
      })
  
      this.logger.log("✅ Unified WebSocket server ready to accept connections")
      this.logger.log(`🌐 Server listening on transports: websocket, polling`)
      this.logger.log(`⚙️ CORS enabled for all origins`)
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`🔗 Client connected to unified gateway: ${client.id}`)
      this.logger.log(`📊 Connection transport: ${client.conn.transport.name}`)
  
      // Initialize client tracking
      if (!this.clientRooms.has(client.id)) {
        this.clientRooms.set(client.id, new Set())
      }
      if (!this.clientChannels.has(client.id)) {
        this.clientChannels.set(client.id, new Set())
      }
  
      // Send immediate connection confirmation
      client.emit("connection_status", {
        connected: true,
        clientId: client.id,
        timestamp: new Date().toISOString(),
        transport: client.conn.transport.name,
        message: "Successfully connected to unified gateway",
        modules: ["surge", "general"],
      })
  
      // Send welcome message
      client.emit("welcome", {
        message: "Welcome to the Unified Monitoring System",
        clientId: client.id,
        timestamp: new Date().toISOString(),
        availableModules: ["surge", "general"],
        availableEvents: [
          "subscribe_hospital_surges",
          "subscribe_regional_surges",
          "subscribe_channel",
          "create_surge",
          "send_message",
          "get_connection_stats",
        ],
      })
  
      // Set up immediate heartbeat
      client.emit("heartbeat", {
        timestamp: new Date().toISOString(),
        message: "Initial heartbeat",
      })
  
      // Set up regular heartbeat
      const interval = setInterval(() => {
        if (client.connected) {
          client.emit("heartbeat", {
            timestamp: new Date().toISOString(),
            clientId: client.id,
          })
        } else {
          clearInterval(interval)
        }
      }, 30000)
  
      // Store interval for cleanup
      client.data.heartbeatInterval = interval
  
      this.logger.log(`📊 Total connected clients: ${this.server.sockets.sockets.size}`)
  
      // Broadcast connection event to other clients
      client.broadcast.emit("client_connected", {
        clientId: client.id,
        timestamp: new Date().toISOString(),
        totalClients: this.server.sockets.sockets.size,
      })
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`❌ Client disconnected from unified gateway: ${client.id}`)
  
      // Clear heartbeat interval
      if (client.data.heartbeatInterval) {
        clearInterval(client.data.heartbeatInterval)
      }
  
      // Remove client from all rooms and channels
      if (this.clientRooms.has(client.id)) {
        const rooms = this.clientRooms.get(client.id)
        rooms.forEach((room) => {
          if (this.connectedClients.has(room)) {
            this.connectedClients.get(room).delete(client.id)
          }
        })
        this.clientRooms.delete(client.id)
      }
  
      if (this.clientChannels.has(client.id)) {
        this.clientChannels.delete(client.id)
      }
  
      this.logger.log(`📊 Total connected clients: ${this.server.sockets.sockets.size}`)
    }
  
    // SURGE MODULE METHODS
    @SubscribeMessage("subscribe_hospital_surges")
    async handleSubscribeHospitalSurges(client: Socket, payload: { hospitalId: string }) {
      try {
        const { hospitalId } = payload
        this.logger.log(`🏥 Client ${client.id} subscribing to hospital surges ${hospitalId}`)
  
        const roomName = `hospital:${hospitalId}:surges`
        await client.join(roomName)
  
        if (!this.connectedClients.has(hospitalId)) {
          this.connectedClients.set(hospitalId, new Set())
        }
        this.connectedClients.get(hospitalId).add(client.id)
  
        if (!this.clientRooms.has(client.id)) {
          this.clientRooms.set(client.id, new Set())
        }
        this.clientRooms.get(client.id).add(hospitalId)
  
        await this.sendCurrentSurgeData(client, hospitalId)
  
        client.emit("hospital_subscription_confirmed", {
          hospitalId,
          success: true,
          timestamp: new Date().toISOString(),
        })
  
        this.logger.log(`✅ Client ${client.id} successfully subscribed to hospital ${hospitalId}`)
  
        return {
          success: true,
          message: `Subscribed to hospital surges ${hospitalId}`,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.error(`❌ Error subscribing to hospital surges: ${error.message}`)
        throw new WsException(`Failed to subscribe to surges: ${error.message}`)
      }
    }
  
    @SubscribeMessage("subscribe_regional_surges")
    async handleSubscribeRegionalSurges(
      client: Socket,
      payload: {
        latitude: number
        longitude: number
        radius: number
        radiusKm?: number
      },
    ) {
      try {
        const { latitude, longitude, radius, radiusKm } = payload
        const actualRadius = radiusKm || radius / 1000
  
        this.logger.log(
          `🌍 Client ${client.id} subscribing to regional surges at ${latitude}, ${longitude} within ${actualRadius}km`,
        )
  
        const roomName = `region:${latitude}:${longitude}:${actualRadius}`
        await client.join(roomName)
  
        this.regionalSubscriptions.set(roomName, {
          lat: latitude,
          lng: longitude,
          radius: actualRadius * 1000,
        })
  
        if (!this.clientRooms.has(client.id)) {
          this.clientRooms.set(client.id, new Set())
        }
        this.clientRooms.get(client.id).add(roomName)
  
        await this.sendCurrentRegionalSurgeData(client, latitude, longitude, actualRadius)
  
        client.emit("regional_subscription_confirmed", {
          latitude,
          longitude,
          radiusKm: actualRadius,
          success: true,
          timestamp: new Date().toISOString(),
        })
  
        this.logger.log(`✅ Client ${client.id} successfully subscribed to regional surges`)
  
        return {
          success: true,
          message: `Subscribed to regional surges within ${actualRadius}km`,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.error(`❌ Error subscribing to regional surges: ${error.message}`)
        throw new WsException(`Failed to subscribe to regional surges: ${error.message}`)
      }
    }
  
    // GENERAL MODULE METHODS
    @SubscribeMessage("subscribe_channel")
    async handleSubscribeChannel(client: Socket, payload: { channel: string }) {
      try {
        const { channel } = payload
        this.logger.log(`📡 Client ${client.id} subscribing to channel ${channel}`)
  
        await client.join(channel)
  
        if (!this.clientChannels.has(client.id)) {
          this.clientChannels.set(client.id, new Set())
        }
        this.clientChannels.get(client.id).add(channel)
  
        client.emit("channel_subscription_confirmed", {
          channel,
          success: true,
          timestamp: new Date().toISOString(),
        })
  
        this.logger.log(`✅ Client ${client.id} successfully subscribed to channel ${channel}`)
  
        return {
          success: true,
          message: `Subscribed to channel ${channel}`,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.error(`❌ Error subscribing to channel: ${error.message}`)
        throw new WsException(`Failed to subscribe to channel: ${error.message}`)
      }
    }
  
    @SubscribeMessage("send_message")
    async handleSendMessage(client: Socket, payload: { channel: string; message: any }) {
      try {
        const { channel, message } = payload
        this.logger.log(`📤 Client ${client.id} sending message to channel ${channel}`)
  
        const messagePayload = {
          ...message,
          senderId: client.id,
          timestamp: new Date().toISOString(),
        }
  
        this.server.to(channel).emit("message_received", messagePayload)
  
        return {
          success: true,
          message: "Message sent successfully",
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.error(`❌ Error sending message: ${error.message}`)
        throw new WsException(`Failed to send message: ${error.message}`)
      }
    }
  
    // SURGE CREATION AND UPDATES
    @SubscribeMessage("create_surge")
    async handleCreateSurge(
      client: Socket,
      payload: {
        hospitalId: string
        latitude: number
        longitude: number
        address?: string
        emergencyType?: string
        description?: string
        metadata?: Record<string, any>
      },
    ) {
      try {
        const { hospitalId, latitude, longitude, address, emergencyType, description, metadata } = payload
  
        this.logger.log(`🚨 Creating surge via WebSocket for hospital ${hospitalId}`)
  
        const newSurge = new this.surgeModel({
          hospital: hospitalId,
          latitude,
          longitude,
          address,
          emergencyType,
          description,
          metadata,
          status: "pending",
        })
  
        const savedSurge = await newSurge.save()
  
        const surgeData = savedSurge.toObject()
        const eventPayload = {
          hospitalId,
          surge: surgeData,
          timestamp: new Date().toISOString(),
          eventId: `surge_create_${Date.now()}`,
        }
  
        // Emit to hospital surge room
        this.server.to(`hospital:${hospitalId}:surges`).emit("surge_created", eventPayload)
        this.server.to(`hospital:${hospitalId}:surges`).emit("new_surge", eventPayload)
  
        // Emit to regional subscribers
        await this.emitToRegionalSubscribers(hospitalId, "hospital_surge_created", eventPayload)
        await this.emitToRegionalSubscribers(hospitalId, "regional_surge_created", eventPayload)
  
        // Emit event for other services
        this.eventEmitter.emit("surge.created", eventPayload)
  
        this.logger.log(`✅ Surge created and emitted: ${savedSurge._id}`)
  
        return {
          success: true,
          message: "Surge created successfully",
          surge: surgeData,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.error(`❌ Error creating surge: ${error.message}`)
        throw new WsException(`Failed to create surge: ${error.message}`)
      }
    }
  
    // PRIVATE HELPER METHODS
    private async sendCurrentSurgeData(client: Socket, hospitalId: string) {
      try {
        const surges = await this.surgeModel
          .find({
            hospital: hospitalId,
            status: { $in: ["pending", "active", "in-progress"] },
          })
          .exec()
  
        if (surges.length > 0) {
          const surgeData = surges.map((surge) => surge.toObject())
  
          client.emit("initial_surge_data", {
            hospitalId,
            surges: surgeData,
            timestamp: new Date().toISOString(),
          })
  
          client.emit("hospital_surges_initial", {
            hospitalId,
            surges: surgeData,
            timestamp: new Date().toISOString(),
          })
  
          this.logger.log(`📤 Sent ${surges.length} initial surges for hospital ${hospitalId} to client ${client.id}`)
        } else {
          this.logger.log(`📭 No active surges found for hospital ${hospitalId}`)
        }
      } catch (error) {
        this.logger.error(`❌ Error sending current surge data: ${error.message}`)
      }
    }
  
    private async sendCurrentRegionalSurgeData(client: Socket, latitude: number, longitude: number, radiusKm: number) {
      try {
        const surges = await this.getSurgesInRegion(latitude, longitude, radiusKm)
  
        if (surges.length > 0) {
          client.emit("initial_surge_data", {
            surges,
            region: { latitude, longitude, radiusKm },
            timestamp: new Date().toISOString(),
          })
  
          client.emit("regional_surges_initial", {
            surges,
            region: { latitude, longitude, radiusKm },
            timestamp: new Date().toISOString(),
          })
  
          this.logger.log(`📤 Sent ${surges.length} initial regional surges to client ${client.id}`)
        } else {
          this.logger.log(`📭 No active surges found in region ${latitude}, ${longitude} (${radiusKm}km)`)
        }
      } catch (error) {
        this.logger.error(`❌ Error sending current regional surge data: ${error.message}`)
      }
    }
  
    private async getSurgesInRegion(latitude: number, longitude: number, radiusKm: number): Promise<any[]> {
      try {
        const allSurges = await this.surgeModel
          .find({
            status: { $in: ["pending", "active", "in-progress"] },
          })
          .exec()
  
        const surgesInRegion = allSurges.filter((surge) => {
          if (!surge.latitude || !surge.longitude) return false
  
          const distance = this.calculateDistance(latitude, longitude, surge.latitude, surge.longitude)
  
          return distance <= radiusKm * 1000
        })
  
        return surgesInRegion.map((surge) => surge.toObject())
      } catch (error) {
        this.logger.error(`❌ Error getting surges in region: ${error.message}`)
        return []
      }
    }
  
    private async emitToRegionalSubscribers(hospitalId: string, eventName: string, payload: any) {
      try {
        const hospital = await this.hospitalModel.findById(hospitalId).exec()
  
        if (!hospital || !hospital.latitude || !hospital.longitude) {
          this.logger.warn(`⚠️ Hospital ${hospitalId} not found or missing coordinates`)
          return
        }
  
        const regionRooms = Array.from(this.server.sockets.adapter.rooms.keys()).filter((room) =>
          room.startsWith("region:"),
        )
  
        this.logger.log(
          `🌍 Checking ${regionRooms.length} regional rooms for hospital at ${hospital.latitude}, ${hospital.longitude}`,
        )
  
        let emittedCount = 0
  
        for (const room of regionRooms) {
          try {
            const [, latStr, lngStr, radiusStr] = room.split(":")
            const regionLat = Number.parseFloat(latStr)
            const regionLng = Number.parseFloat(lngStr)
            const radius = Number.parseFloat(radiusStr) * 1000
  
            const distance = this.calculateDistance(regionLat, regionLng, hospital.latitude, hospital.longitude)
  
            if (distance <= radius) {
              const roomClients = this.server.sockets.adapter.rooms.get(room)
              const clientCount = roomClients ? roomClients.size : 0
  
              this.logger.log(
                `📡 Emitting ${eventName} to regional room ${room} (${clientCount} clients, distance: ${Math.round(distance)}m)`,
              )
              this.server.to(room).emit(eventName, payload)
              emittedCount++
            }
          } catch (parseError) {
            this.logger.error(`❌ Error parsing regional room ${room}: ${parseError.message}`)
          }
        }
  
        this.logger.log(`✅ Emitted ${eventName} to ${emittedCount} regional rooms`)
      } catch (error) {
        this.logger.error(`❌ Error emitting to regional subscribers: ${error.message}`)
      }
    }
  
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371e3
      const φ1 = (lat1 * Math.PI) / 180
      const φ2 = (lat2 * Math.PI) / 180
      const Δφ = ((lat2 - lat1) * Math.PI) / 180
      const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
      return R * c
    }
  
    // EVENT HANDLERS
    @OnEvent("surge.created")
    async handleSurgeCreated(payload: { hospitalId: string; surge: any }) {
      this.logger.log(`🚨 SURGE CREATED EVENT RECEIVED for hospital ${payload.hospitalId}`)
  
      const eventPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
        eventId: `surge_create_${Date.now()}`,
      }
  
      const roomName = `hospital:${payload.hospitalId}:surges`
      const room = this.server.sockets.adapter.rooms.get(roomName)
      const clientCount = room ? room.size : 0
  
      this.logger.log(`📊 Room ${roomName} has ${clientCount} clients`)
  
      this.server.to(roomName).emit("surge_created", eventPayload)
      this.server.to(roomName).emit("new_surge", eventPayload)
      this.server.to(roomName).emit("surge.created", eventPayload)
      this.server.to(roomName).emit("emergency_surge", eventPayload)
  
      this.server.emit("global_surge_created", eventPayload)
  
      await this.emitToRegionalSubscribers(payload.hospitalId, "surge_created", eventPayload)
      await this.emitToRegionalSubscribers(payload.hospitalId, "regional_surge_created", eventPayload)
      await this.emitToRegionalSubscribers(payload.hospitalId, "hospital_surge_created", eventPayload)
  
      this.logger.log(`✅ Surge created event emitted to ${clientCount} clients in room ${roomName}`)
    }
  
    @OnEvent("surge.updated")
    async handleSurgeUpdated(payload: { hospitalId: string; surge: any }) {
      this.logger.log(`🔄 SURGE UPDATED EVENT RECEIVED for hospital ${payload.hospitalId}`)
  
      const eventPayload = {
        ...payload,
        timestamp: new Date().toISOString(),
        eventId: `surge_update_${Date.now()}`,
      }
  
      const roomName = `hospital:${payload.hospitalId}:surges`
      const room = this.server.sockets.adapter.rooms.get(roomName)
      const clientCount = room ? room.size : 0
  
      this.logger.log(`📊 Room ${roomName} has ${clientCount} clients`)
  
      this.server.to(roomName).emit("surge_updated", eventPayload)
      this.server.to(roomName).emit("surge.updated", eventPayload)
      this.server.to(roomName).emit("hospital_surge_updated", eventPayload)
  
      this.server.emit("global_surge_updated", eventPayload)
  
      await this.emitToRegionalSubscribers(payload.hospitalId, "surge_updated", eventPayload)
      await this.emitToRegionalSubscribers(payload.hospitalId, "hospital_surge_updated", eventPayload)
  
      this.logger.log(`✅ Surge updated event emitted to ${clientCount} clients in room ${roomName}`)
    }
  
    // DEBUG METHODS
    @SubscribeMessage("get_connection_stats")
    handleGetConnectionStats(client: Socket) {
      const totalClients = this.server.sockets.sockets.size
      const rooms = Array.from(this.server.sockets.adapter.rooms.keys())
      const hospitalRooms = rooms.filter((room) => room.startsWith("hospital:"))
      const regionalRooms = rooms.filter((room) => room.startsWith("region:"))
      const generalChannels = rooms.filter((room) => !room.startsWith("hospital:") && !room.startsWith("region:"))
  
      const stats = {
        totalClients,
        totalRooms: rooms.length,
        hospitalRooms: hospitalRooms.length,
        regionalRooms: regionalRooms.length,
        generalChannels: generalChannels.length,
        clientRooms: this.clientRooms.get(client.id) || new Set(),
        clientChannels: this.clientChannels.get(client.id) || new Set(),
        timestamp: new Date().toISOString(),
      }
  
      this.logger.log(`📊 Connection stats requested by ${client.id}:`, stats)
  
      client.emit("connection_stats", stats)
  
      return stats
    }
  }
  