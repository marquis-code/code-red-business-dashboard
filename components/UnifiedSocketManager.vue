<template>
    <div class="fixed bottom-4 left-4 z-50">
      <div class="bg-white border rounded-lg shadow-xl p-4 w-80">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-lg">Socket Manager</h3>
          <button @click="showDetails = !showDetails" class="text-gray-500 hover:text-gray-700">
            {{ showDetails ? '−' : '+' }}
          </button>
        </div>
        
        <!-- Connection Status -->
        <div class="mb-3">
          <div class="flex items-center space-x-2 mb-2">
            <div :class="isConnected ? 'w-3 h-3 bg-green-500 rounded-full animate-pulse' : 'w-3 h-3 bg-red-500 rounded-full'"></div>
            <span class="font-medium">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <div v-if="lastError" class="text-red-600 text-xs">{{ lastError }}</div>
        </div>
  
        <!-- Active Modules -->
        <div class="mb-3">
          <div class="text-sm font-medium mb-1">Active Modules:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="module in activeModules" 
              :key="module"
              class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {{ module }}
            </span>
            <span v-if="activeModules.length === 0" class="text-gray-500 text-xs">None</span>
          </div>
        </div>
  
        <!-- Module Controls -->
        <div class="mb-3">
          <div class="text-sm font-medium mb-2">Switch Module:</div>
          <div class="flex gap-2">
            <button 
              @click="switchToModule('surge')"
              class="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Surge
            </button>
            <button 
              @click="switchToModule('bedspace')"
              class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Bedspace
            </button>
            <button 
              @click="switchToModule('general')"
              class="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
            >
              General
            </button>
          </div>
        </div>
  
        <!-- Detailed Information -->
        <div v-if="showDetails" class="space-y-3">
          <!-- Subscriptions -->
          <div>
            <div class="text-sm font-medium mb-1">Subscriptions:</div>
            <div class="text-xs space-y-1">
              <div>Hospitals: {{ subscribedHospitals.size }}</div>
              <div>Regions: {{ subscribedRegions.size }}</div>
              <div>Channels: {{ subscribedChannels.size }}</div>
            </div>
          </div>
  
          <!-- Data Counts -->
          <div>
            <div class="text-sm font-medium mb-1">Data:</div>
            <div class="text-xs space-y-1">
              <div>Surges: {{ surgeData.length }} (Active: {{ activeSurges.length }})</div>
              <div>Bedspaces: {{ bedspaceData.length }}</div>
              <div>General: {{ generalData.length }}</div>
            </div>
          </div>
  
          <!-- Last Activity -->
          <div v-if="lastActivity">
            <div class="text-sm font-medium mb-1">Last Activity:</div>
            <div class="text-xs text-gray-600">{{ formatTime(lastActivity) }}</div>
          </div>
  
          <!-- Actions -->
          <div class="pt-2 border-t space-y-2">
            <button
              @click="testConnection"
              class="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Test Connection
            </button>
            <button
              @click="getStats"
              class="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
            >
              Get Stats
            </button>
            <button
              @click="reconnect"
              class="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useUnifiedHospitalSocket } from '@/composables/useUnifiedHospitalSocket'
  
  const showDetails = ref(false)
  
  const {
    isConnected,
    lastError,
    lastActivity,
    activeModules,
    subscribedHospitals,
    subscribedRegions,
    subscribedChannels,
    surgeData,
    activeSurges,
    bedspaceData,
    generalData,
    switchModule,
    getConnectionStats,
    ping,
    initSocket,
    cleanup
  } = useUnifiedHospitalSocket()
  
  onMounted(() => {
    initSocket()
  })
  
  onBeforeUnmount(() => {
    cleanup()
  })
  
  const switchToModule = (module: 'surge' | 'bedspace' | 'general') => {
    console.log(`🔄 Switching to ${module} module`)
    switchModule(module)
  }
  
  const testConnection = async () => {
    try {
      const result = await ping()
      console.log('🏓 Ping result:', result)
      alert(`Ping successful! Latency: ${result.latency}ms`)
    } catch (error) {
      console.error('❌ Ping failed:', error)
      alert('Ping failed: ' + error.message)
    }
  }
  
  const getStats = async () => {
    try {
      const stats = await getConnectionStats()
      console.log('📊 Connection stats:', stats)
      alert('Stats retrieved! Check console for details.')
    } catch (error) {
      console.error('❌ Failed to get stats:', error)
      alert('Failed to get stats: ' + error.message)
    }
  }
  
  const reconnect = () => {
    console.log('🔄 Reconnecting...')
    cleanup()
    setTimeout(() => {
      initSocket()
    }, 1000)
  }
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }
  </script>
  