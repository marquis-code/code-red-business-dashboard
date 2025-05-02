import { defineNuxtPlugin } from "#app"
import { io } from "socket.io-client"

export default defineNuxtPlugin((nuxtApp) => {
  const socketUrl = process.env.API_BASE_URL || "http://localhost:3000"

  // Only initialize socket on client-side
  if (process.client) {
    const socket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: false,
    })

    // Make socket available throughout the app
    nuxtApp.provide("socket", socket)
  }
})
