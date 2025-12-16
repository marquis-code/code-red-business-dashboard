<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 md:p-6">
    <main class="max-w-7xl mx-auto">
      <!-- Hospital Staffing Table -->
      <div class="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-800 mb-2">Hospital Staff Directory</h2>
          <p class="text-gray-500">Manage and view all hospital personnel</p>
          
          <!-- Search and Filter -->
          <div class="mt-6 flex flex-col sm:flex-row gap-4">
            <div class="relative flex-grow">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search staff..." 
                class="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex-shrink-0">
              <select 
                v-model="departmentFilter"
                class="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Departments</option>
                <option value="Medicine">Medicine</option>
                <option value="Surgery">Surgery</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Emergency">Emergency</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>
            <div class="flex-shrink-0">
              <select 
                v-model="verificationFilter"
                class="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <div v-if="loading" class="animate-pulse p-6">
            <!-- Skeleton Loader -->
            <div v-for="i in 4" :key="i" class="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b border-gray-200 gap-4">
              <div class="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
              <div class="flex-1 space-y-3">
                <div class="h-6 bg-gray-300 rounded-lg w-3/4"></div>
                <div class="h-4 bg-gray-300 rounded-lg w-1/2"></div>
                <div class="h-4 bg-gray-300 rounded-lg w-1/3"></div>
              </div>
              <div class="w-24 h-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          
          <!-- Mobile View (Card Layout) -->
          <div v-else-if="isMobile" class="divide-y divide-gray-100">
            <TransitionGroup 
              name="list" 
              tag="div" 
              class="space-y-4 p-4"
            >
              <div 
                v-for="staff in filteredStaff" 
                :key="staff._id"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                      <div class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl mr-3">
                        {{ getInitials(staff.name) }}
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-800">{{ staff.name }}</h3>
                        <p class="text-sm text-gray-500">{{ staff.position }}</p>
                      </div>
                    </div>
                    <div class="flex gap-1">
                      <span
                        v-if="staff.isVerified"
                        class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Verified
                      </span>
                      <span
                        v-else
                        class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        Pending
                      </span>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <span
                      :class="{
                        'bg-green-100 text-green-700': staff.availability === 'Available',
                        'bg-gray-100 text-gray-700': staff.availability === 'Off Shift',
                        'bg-blue-100 text-blue-700': staff.availability === 'On Duty',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ staff.availability }}
                    </span>
                  </div>
                  
                  <div class="text-sm text-gray-600 space-y-1">
                    <p><span class="font-medium">Department:</span> {{ staff.department }}</p>
                    <p><span class="font-medium">Contact:</span> {{ staff.contactNumber }}</p>
                    <p><span class="font-medium">EMR Access:</span> {{ staff.emrAccessLevel }}</p>
                    <p><span class="font-medium">Permissions:</span> {{ staff.permissions.length }} assigned</p>
                  </div>
                  
                  <div class="mt-4 flex gap-2">
                    <button
                      @click="showDetails(staff)"
                      class="flex-1 text-center bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                    <button
                      v-if="!staff.isVerified"
                      @click="openApprovalModal(staff)"
                      class="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </TransitionGroup>
            
            <div v-if="filteredStaff.length === 0" class="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-700">No staff found</h3>
              <p class="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
          
          <!-- Desktop View (Table Layout) -->
          <table
            v-else
            class="min-w-full bg-white"
          >
            <thead>
              <tr class="bg-gray-50 text-gray-700 border-b border-gray-200">
                <th class="p-4 text-left text-sm font-bold">Staff</th>
                <th class="p-4 text-left text-sm font-bold">Position</th>
                <th class="p-4 text-left text-sm font-bold">Department</th>
                <th class="p-4 text-left text-sm font-bold">Status</th>
                <th class="p-4 text-left text-sm font-bold">EMR Access</th>
                <th class="p-4 text-left text-sm font-bold">Permissions</th>
                <th class="p-4 text-left text-sm font-bold">Contact</th>
                <th class="p-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup name="list">
                <tr
                  v-for="staff in filteredStaff"
                  :key="staff._id"
                  class="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200"
                >
                  <td class="p-4 text-gray-700">
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                        {{ getInitials(staff.name) }}
                      </div>
                      <div>
                        <div class="font-medium">{{ staff.name }}</div>
                        <div class="text-xs text-gray-500">{{ staff.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.position }}</td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.department }}</td>
                  <td class="p-4 text-sm">
                    <div class="flex flex-col gap-1">
                      <span
                        :class="{
                          'bg-green-100 text-green-700': staff.availability === 'Available',
                          'bg-gray-100 text-gray-700': staff.availability === 'Off Shift',
                          'bg-blue-100 text-blue-700': staff.availability === 'On Duty',
                        }"
                        class="px-2 py-1 rounded-full text-xs font-medium inline-block"
                      >
                        {{ staff.availability }}
                      </span>
                      <div class="flex gap-1">
                        <span
                          v-if="staff.isVerified"
                          class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          ✓ Verified
                        </span>
                        <span
                          v-else
                          class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          ⏳ Pending
                        </span>
                        <span
                          v-if="staff.isActive"
                          class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          Active
                        </span>
                        <span
                          v-else
                          class="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          Inactive
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-sm">
                    <span
                      :class="{
                        'bg-purple-100 text-purple-700': staff.emrAccessLevel === 'full',
                        'bg-blue-100 text-blue-700': staff.emrAccessLevel === 'read',
                        'bg-gray-100 text-gray-700': staff.emrAccessLevel === 'none',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ staff.emrAccessLevel }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-700 text-sm">
                    <span class="font-medium">{{ staff.permissions.length }}</span> assigned
                  </td>
                  <td class="p-4 text-gray-700 text-sm">{{ staff.contactNumber }}</td>
                  <td class="p-4">
                    <div class="flex gap-2">
                      <button
                        @click="showDetails(staff)"
                        class="text-sm bg-teal-600 text-white px-3 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
                      >
                        Details
                      </button>
                      <button
                        v-if="!staff.isVerified"
                        @click="openApprovalModal(staff)"
                        class="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              </TransitionGroup>
            </tbody>
          </table>
          
          <div v-if="!loading && filteredStaff.length === 0 && !isMobile" class="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-700">No staff found</h3>
            <p class="text-gray-500">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Details Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedStaff"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="selectedStaff = null"
        >
          <div class="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl p-6 relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <!-- Close Button -->
            <button
              @click="selectedStaff = null"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl mr-4">
                {{ getInitials(selectedStaff.name) }}
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800">{{ selectedStaff.name }}</h3>
                <p class="text-gray-500">{{ selectedStaff.position }} • {{ selectedStaff.department }}</p>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p class="text-sm text-gray-500 mb-1">Email</p>
                  <p class="font-medium">{{ selectedStaff.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">Phone</p>
                  <p class="font-medium">{{ selectedStaff.contactNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">Availability</p>
                  <p>
                    <span
                      :class="{
                        'bg-green-100 text-green-700': selectedStaff.availability === 'Available',
                        'bg-gray-100 text-gray-700': selectedStaff.availability === 'Off Shift',
                        'bg-blue-100 text-blue-700': selectedStaff.availability === 'On Duty',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ selectedStaff.availability }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">Verification Status</p>
                  <p>
                    <span
                      :class="{
                        'bg-green-100 text-green-700': selectedStaff.isVerified,
                        'bg-yellow-100 text-yellow-700': !selectedStaff.isVerified,
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ selectedStaff.isVerified ? 'Verified' : 'Pending Verification' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">Account Status</p>
                  <p>
                    <span
                      :class="{
                        'bg-blue-100 text-blue-700': selectedStaff.isActive,
                        'bg-red-100 text-red-700': !selectedStaff.isActive,
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ selectedStaff.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">EMR Access Level</p>
                  <p class="font-medium">{{ selectedStaff.emrAccessLevel }}</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-sm text-gray-500 mb-1">Created</p>
                  <p class="font-medium">{{ formatDate(selectedStaff.createdAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Assigned Permissions ({{ selectedStaff.permissions.length }})</h4>
              <div v-if="selectedStaff.permissions.length > 0" class="flex flex-wrap gap-2">
                <span 
                  v-for="(permission, index) in selectedStaff.permissions" 
                  :key="index"
                  class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {{ permission }}
                </span>
              </div>
              <p v-else class="text-gray-500 text-sm">No permissions assigned yet</p>
            </div>

            <!-- Schedule -->
            <div v-if="selectedStaff.schedule && selectedStaff.schedule.length > 0" class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Recent Schedule</h4>
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div v-for="(item, index) in selectedStaff.schedule" :key="index" class="p-3 border-b last:border-b-0">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium">{{ formatDate(item.date) }}</p>
                      <p class="text-sm text-gray-500">{{ item.shift }} Shift</p>
                    </div>
                    <span
                      :class="{
                        'bg-green-100 text-green-700': item.status === 'Present',
                        'bg-red-100 text-red-700': item.status === 'Sick',
                        'bg-yellow-100 text-yellow-700': item.status === 'Leave',
                        'bg-blue-100 text-blue-700': item.status === 'Training',
                      }"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ item.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3">
              <button
                @click="selectedStaff = null"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                v-if="!selectedStaff.isVerified"
                @click="openApprovalModal(selectedStaff); selectedStaff = null"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
              >
                Approve Staff
              </button>
              <button
                @click="openApprovalModal(selectedStaff); selectedStaff = null"
                class="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors duration-200"
              >
                Edit Permissions
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Approval/Permission Management Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showApprovalModal && staffToApprove"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click.self="closeApprovalModal"
        >
          <div class="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-3/4 max-w-4xl p-6 relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <!-- Close Button -->
            <button
              @click="closeApprovalModal"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                {{ staffToApprove.isVerified ? 'Manage Staff Permissions' : 'Approve Staff Member' }}
              </h3>
              <p class="text-gray-500">{{ staffToApprove.name }} - {{ staffToApprove.position }}</p>
            </div>

            <!-- Approval Form -->
            <div class="space-y-6">
              <!-- Status Toggles -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Account Status</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p class="font-medium text-gray-700">Verified</p>
                      <p class="text-xs text-gray-500">Account verification status</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="approvalForm.isVerified" 
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p class="font-medium text-gray-700">Active</p>
                      <p class="text-xs text-gray-500">Can access the system</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="approvalForm.isActive" 
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div class="p-3 bg-white rounded-lg border border-gray-200">
                    <p class="font-medium text-gray-700 mb-2">EMR Access Level</p>
                    <select 
                      v-model="approvalForm.emrAccessLevel"
                      class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="none">None</option>
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="full">Full Access</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Permissions Section -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Permissions Management</h4>
                <p class="text-sm text-gray-600 mb-4">Select permissions for this staff member based on their role and responsibilities</p>

                <!-- Search Permissions -->
                <div class="mb-4">
                  <input 
                    v-model="permissionSearchQuery" 
                    type="text" 
                    placeholder="Search permissions..." 
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <!-- Permissions by Module -->
                <div class="space-y-4 max-h-96 overflow-y-auto">
                  <div v-for="module in filteredPermissionModules" :key="module" class="bg-white rounded-lg border border-gray-200 p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="font-semibold text-gray-700">{{ module }}</h5>
                      <button
                        @click="toggleModulePermissions(module)"
                        class="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
                      >
                        {{ isModuleFullySelected(module) ? 'Deselect All' : 'Select All' }}
                      </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <label 
                        v-for="permission in getPermissionsByModule(module)" 
                        :key="permission.value"
                        class="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          :value="permission.value"
                          v-model="approvalForm.permissions"
                          class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        >
                        <span class="text-sm text-gray-700">{{ permission.label }}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Selected Permissions Summary -->
                <div v-if="approvalForm.permissions.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p class="text-sm font-medium text-blue-900 mb-2">
                    Selected Permissions ({{ approvalForm.permissions.length }})
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(permission, index) in approvalForm.permissions" 
                      :key="index"
                      class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {{ permission }}
                      <button 
                        @click="removePermission(permission)"
                        class="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                @click="closeApprovalModal"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                v-if="staffToApprove.isVerified"
                @click="disapproveStaff"
                :disabled="submitting"
                class="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Processing...' : 'Disapprove Staff' }}
              </button>
              <button
                @click="approveStaff"
                :disabled="submitting"
                class="px-6 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Processing...' : (staffToApprove.isVerified ? 'Update Permissions' : 'Approve & Save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

// Types
interface Staff {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  contactNumber: string;
  availability: string;
  isActive: boolean;
  isVerified: boolean;
  emrAccessLevel: string;
  permissions: string[];
  currentShift: any;
  schedule: any[];
  createdAt: string;
  updatedAt: string;
  lastKnownLocation?: {
    type: string;
    coordinates: number[];
  };
  attendanceHistory?: any[];
}

// Mock data - replace with actual API call
const staffList = ref<Staff[]>([
  {
    lastKnownLocation: {
      type: "Point",
      coordinates: [0, 0]
    },
    _id: "693e94766846d3f7079c173e",
    isVerified: false,
    isActive: true,
    emrAccessLevel: "none",
    permissions: [],
    currentShift: null,
    attendanceHistory: [],
    contactNumber: "09012312343",
    availability: "Off Shift",
    department: "Medicine",
    position: "Medical Doctor",
    email: "anita@gmail.com",
    name: "Anita Orji",
    schedule: [],
    createdAt: "2025-12-14T10:41:58.417Z",
    updatedAt: "2025-12-14T10:41:58.417Z"
  },
  {
    lastKnownLocation: {
      type: "Point",
      coordinates: [0, 0]
    },
    _id: "693e95486846d3f7079c1748",
    isVerified: true,
    isActive: true,
    emrAccessLevel: "read",
    permissions: ["bedspace:read", "attendance:read"],
    currentShift: null,
    attendanceHistory: [],
    contactNumber: "09012312345",
    availability: "Available",
    department: "Surgery",
    position: "Surgeon",
    email: "ifedoyin@gmail.com",
    name: "Ifedoyin Chukwuma",
    schedule: [],
    createdAt: "2025-12-14T10:45:28.571Z",
    updatedAt: "2025-12-14T10:45:28.571Z"
  }
]);

const loading = ref(false);

// State for search and filtering
const searchQuery = ref('');
const departmentFilter = ref('all');
const verificationFilter = ref('all');
const selectedStaff = ref<Staff | null>(null);
const showApprovalModal = ref(false);
const staffToApprove = ref<Staff | null>(null);
const submitting = ref(false);
const permissionSearchQuery = ref('');
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const isMobile = computed(() => windowWidth.value < 768);

// Approval form state
const approvalForm = ref({
  isVerified: false,
  isActive: false,
  emrAccessLevel: 'none',
  permissions: [] as string[]
});

// Available permissions based on backend structure
const availablePermissions = [
  // Audit
  { value: 'audit:read', label: 'Read Logs', module: 'Audit' },
  { value: 'audit:create', label: 'Create Logs', module: 'Audit' },
  
  // Auth
  { value: 'auth:manage', label: 'Manage Auth', module: 'Authentication' },
  
  // Bedspace
  { value: 'bedspace:read', label: 'View Bedspaces', module: 'Bedspace' },
  { value: 'bedspace:create', label: 'Create Bedspaces', module: 'Bedspace' },
  { value: 'bedspace:update', label: 'Update Bedspaces', module: 'Bedspace' },
  { value: 'bedspace:delete', label: 'Delete Bedspaces', module: 'Bedspace' },
  
  // Database
  { value: 'database:manage', label: 'Manage Database', module: 'Database' },
  
  // Emergency Alerts
  { value: 'emergency:read', label: 'View Alerts', module: 'Emergency Alerts' },
  { value: 'emergency:create', label: 'Create Alerts', module: 'Emergency Alerts' },
  { value: 'emergency:update', label: 'Update Alerts', module: 'Emergency Alerts' },
  
  // EMR
  { value: 'emr:read', label: 'View Records', module: 'EMR' },
  { value: 'emr:create', label: 'Create Records', module: 'EMR' },
  { value: 'emr:update', label: 'Update Records', module: 'EMR' },
  { value: 'emr:delete', label: 'Delete Records', module: 'EMR' },
  
  // Hospital
  { value: 'hospital:read', label: 'View Hospital', module: 'Hospital' },
  { value: 'hospital:update', label: 'Update Hospital', module: 'Hospital' },
  
  // Map
  { value: 'map:read', label: 'View Map', module: 'Map' },
  { value: 'map:update', label: 'Update Map', module: 'Map' },
  
  // Reports
  { value: 'reports:read', label: 'View Reports', module: 'Reports' },
  { value: 'reports:create', label: 'Generate Reports', module: 'Reports' },
  
  // Staffing
  { value: 'staffing:read', label: 'View Staff', module: 'Staffing' },
  { value: 'staffing:create', label: 'Add Staff', module: 'Staffing' },
  { value: 'staffing:update', label: 'Update Staff', module: 'Staffing' },
  { value: 'staffing:delete', label: 'Remove Staff', module: 'Staffing' },
  { value: 'staffing:approve', label: 'Approve Staff', module: 'Staffing' },
  
  // Attendance
  { value: 'attendance:read', label: 'View Attendance', module: 'Attendance' },
  { value: 'attendance:create', label: 'Mark Attendance', module: 'Attendance' },
  { value: 'attendance:update', label: 'Update Attendance', module: 'Attendance' },
  
  // Surge
  { value: 'surge:read', label: 'View Surge Data', module: 'Surge Management' },
  { value: 'surge:create', label: 'Create Surge Plan', module: 'Surge Management' },
  { value: 'surge:update', label: 'Update Surge Plan', module: 'Surge Management' },
  
  // Surge Prediction
  { value: 'surge-prediction:read', label: 'View Predictions', module: 'Surge Prediction' },
  { value: 'surge-prediction:create', label: 'Generate Predictions', module: 'Surge Prediction' },
  
  // User Management
  { value: 'user:read', label: 'View Users', module: 'User Management' },
  { value: 'user:create', label: 'Create Users', module: 'User Management' },
  { value: 'user:update', label: 'Update Users', module: 'User Management' },
  { value: 'user:delete', label: 'Delete Users', module: 'User Management' },
  
  // WebSocket
  { value: 'websocket:manage', label: 'Manage Connections', module: 'WebSocket' },
];

// Handle window resize for responsive layout
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});

// Computed: Get unique modules
const permissionModules = computed(() => {
  return [...new Set(availablePermissions.map(p => p.module))];
});

// Computed: Filter modules based on search
const filteredPermissionModules = computed(() => {
  if (!permissionSearchQuery.value) return permissionModules.value;
  
  const query = permissionSearchQuery.value.toLowerCase();
  return permissionModules.value.filter(module => {
    const modulePerms = availablePermissions.filter(p => p.module === module);
    return module.toLowerCase().includes(query) || 
           modulePerms.some(p => p.label.toLowerCase().includes(query) || p.value.toLowerCase().includes(query));
  });
});

// Get permissions by module
const getPermissionsByModule = (module: string) => {
  return availablePermissions.filter(p => p.module === module);
};

// Check if module is fully selected
const isModuleFullySelected = (module: string) => {
  const modulePerms = getPermissionsByModule(module);
  return modulePerms.every(p => approvalForm.value.permissions.includes(p.value));
};

// Toggle all permissions in a module
const toggleModulePermissions = (module: string) => {
  const modulePerms = getPermissionsByModule(module);
  const isFullySelected = isModuleFullySelected(module);
  
  if (isFullySelected) {
    // Remove all module permissions
    approvalForm.value.permissions = approvalForm.value.permissions.filter(
      p => !modulePerms.some(mp => mp.value === p)
    );
  } else {
    // Add all module permissions
    modulePerms.forEach(p => {
      if (!approvalForm.value.permissions.includes(p.value)) {
        approvalForm.value.permissions.push(p.value);
      }
    });
  }
};

// Remove a single permission
const removePermission = (permission: string) => {
  approvalForm.value.permissions = approvalForm.value.permissions.filter(p => p !== permission);
};

// Filter staff based on search query and filters
const filteredStaff = computed(() => {
  if (!Array.isArray(staffList.value)) return [];
  
  return staffList.value.filter(staff => {
    // Search filter
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Department filter
    const matchesDepartment = 
      departmentFilter.value === 'all' || 
      staff.department === departmentFilter.value;
    
    // Verification filter
    let matchesVerification = true;
    if (verificationFilter.value === 'verified') {
      matchesVerification = staff.isVerified;
    } else if (verificationFilter.value === 'unverified') {
      matchesVerification = !staff.isVerified;
    } else if (verificationFilter.value === 'active') {
      matchesVerification = staff.isActive;
    } else if (verificationFilter.value === 'inactive') {
      matchesVerification = !staff.isActive;
    }
    
    return matchesSearch && matchesDepartment && matchesVerification;
  });
});

// Helper functions
const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const showDetails = (staff: Staff) => {
  selectedStaff.value = staff;
};

const openApprovalModal = (staff: Staff) => {
  staffToApprove.value = staff;
  approvalForm.value = {
    isVerified: staff.isVerified,
    isActive: staff.isActive,
    emrAccessLevel: staff.emrAccessLevel,
    permissions: [...staff.permissions]
  };
  showApprovalModal.value = true;
};

const closeApprovalModal = () => {
  showApprovalModal.value = false;
  staffToApprove.value = null;
  permissionSearchQuery.value = '';
  approvalForm.value = {
    isVerified: false,
    isActive: false,
    emrAccessLevel: 'none',
    permissions: []
  };
};

const approveStaff = async () => {
  if (!staffToApprove.value) return;
  
  submitting.value = true;
  
  try {
    // Simulate API call - replace with actual API call
    // const response = await $fetch(`/api/staff/${staffToApprove.value._id}/approve`, {
    //   method: 'PATCH',
    //   body: approvalForm.value
    // });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local data
    const index = staffList.value.findIndex(s => s._id === staffToApprove.value!._id);
    if (index !== -1) {
      staffList.value[index] = {
        ...staffList.value[index],
        ...approvalForm.value
      };
    }
    
    alert(`Staff ${staffToApprove.value.isVerified ? 'updated' : 'approved'} successfully!`);
    closeApprovalModal();
  } catch (error) {
    console.error('Error approving staff:', error);
    alert('Failed to approve staff. Please try again.');
  } finally {
    submitting.value = false;
  }
};

const disapproveStaff = async () => {
  if (!staffToApprove.value) return;
  
  if (!confirm(`Are you sure you want to disapprove ${staffToApprove.value.name}? This will revoke their access.`)) {
    return;
  }
  
  submitting.value = true;
  
  try {
    // Simulate API call - replace with actual API call
    // const response = await $fetch(`/api/staff/${staffToApprove.value._id}/approve`, {
    //   method: 'PATCH',
    //   body: {
    //     isVerified: false,
    //     isActive: false,
    //     emrAccessLevel: 'none',
    //     permissions: []
    //   }
    // });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local data
    const index = staffList.value.findIndex(s => s._id === staffToApprove.value!._id);
    if (index !== -1) {
      staffList.value[index] = {
        ...staffList.value[index],
        isVerified: false,
        isActive: false,
        emrAccessLevel: 'none',
        permissions: []
      };
    }
    
    alert(`Staff disapproved successfully!`);
    closeApprovalModal();
  } catch (error) {
    console.error('Error disapproving staff:', error);
    alert('Failed to disapprove staff. Please try again.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Card hover effect */
.hover\:-translate-y-1:hover {
  transform: translateY(-4px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>