<template>
<div>
    <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
    <div v-if="openSidebar" class="relative z-50 xl:hidden" role="dialog" aria-modal="true">
      <!--
        Off-canvas menu backdrop, show/hide based on off-canvas menu state.
  
        Entering: "transition-opacity ease-linear duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "transition-opacity ease-linear duration-300"
          From: "opacity-100"
          To: "opacity-0"
      -->
      <div class="fixed inset-0 bg-gray-900/80" aria-hidden="true"></div>
  
      <div class="fixed inset-0 flex">
        <!--
          Off-canvas menu, show/hide based on off-canvas menu state.
  
          Entering: "transition ease-in-out duration-300 transform"
            From: "-translate-x-full"
            To: "translate-x-0"
          Leaving: "transition ease-in-out duration-300 transform"
            From: "translate-x-0"
            To: "-translate-x-full"
        -->
        <div class="relative mr-16 flex w-full max-w-xs flex-1">
          <!--
            Close button, show/hide based on off-canvas menu state.
  
            Entering: "ease-in-out duration-300"
              From: "opacity-0"
              To: "opacity-100"
            Leaving: "ease-in-out duration-300"
              From: "opacity-100"
              To: "opacity-0"
          -->
          <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button  @click="openSidebar = false" type="button" class="-m-2.5 p-2.5">
              <span class="sr-only">Close sidebar</span>
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <!-- Sidebar component, swap this element with another sidebar if you like -->
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 ring-1 ring-white/10">
            <div class="flex h-16 shrink-0 items-center">
              <img class="h-8 w-auto" src="@/assets/img/logo-red.png" alt="Your Company">
            </div>
            <nav class="flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" class="-mx-2 space-y-4">
                    <li>
                      <NuxtLink to="/dashboard" class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <mask id="mask0_518_144" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                          <rect width="32" height="32" fill="white"/>
                          </mask>
                          <g mask="url(#mask0_518_144)">
                          <path stroke="#737791" d="M13.6702 7.84619L14.0414 13.3661L14.2257 16.1405C14.2277 16.4259 14.2723 16.7093 14.3586 16.9817C14.5811 17.5105 15.1166 17.8465 15.6991 17.8231L24.5754 17.2424C24.9598 17.2361 25.331 17.3799 25.6073 17.6421C25.8375 17.8607 25.9862 18.1465 26.0331 18.454L26.0489 18.6407C25.6815 23.7269 21.9459 27.9693 16.8702 29.0644C11.7944 30.1595 6.58947 27.8461 4.08127 23.3803C3.35818 22.0828 2.90652 20.6568 2.75283 19.1857C2.68863 18.7503 2.66036 18.3104 2.6683 17.8704C2.66036 12.4174 6.54362 7.70302 11.9794 6.5665C12.6337 6.46462 13.275 6.81096 13.5374 7.40778C13.6053 7.54599 13.6501 7.69402 13.6702 7.84619Z"/>
                          <path opacity="0.4" d="M29.3337 13.0834L29.3244 13.1268L29.2975 13.19L29.3012 13.3635C29.2873 13.5933 29.1985 13.8143 29.0457 13.993C28.8864 14.179 28.6688 14.3057 28.4292 14.3549L28.2831 14.3749L18.042 15.0385C17.7013 15.0721 17.3621 14.9622 17.1089 14.7363C16.8977 14.5479 16.7628 14.2938 16.7247 14.0199L16.0373 3.79374C16.0253 3.75916 16.0253 3.72168 16.0373 3.6871C16.0467 3.40522 16.1708 3.13878 16.3819 2.9473C16.5928 2.75582 16.8733 2.65526 17.1604 2.66808C23.2403 2.82276 28.3501 7.19471 29.3337 13.0834Z"/>
                          </g>
                          </svg>
                          
                        Overview
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/bed-availability"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.875 13.8125V31.6875M34.125 20.3125V31.6875M21.125 12.1875H30.875M8.9375 17.875H13.8125M4.875 22.75H34.125M4.875 27.625H34.125M26 7.3125V17.0625" stroke="#737791" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            
                        Bed Availability
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/staffing"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_519_47)">
                            <path d="M0 30H32M18 26.6667V18.6667C18 18.6667 14.6667 16.6667 9.33333 16.6667C4 16.6667 0.666667 18.6667 0.666667 18.6667V26.6667M23.3333 2V6H19.3333V10H23.3333V14H27.3333V10H31.3333V6H27.3333V2H23.3333ZM8.992 14C8.992 14 5.332 11.6693 5.332 8.75467C5.332 6.5 7.124 4.672 9.33467 4.672C11.5453 4.672 13.328 6.5 13.328 8.75467C13.328 11.6667 9.68 14 9.68 14H8.992Z" stroke="#737791" stroke-width="2.13333"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_519_47">
                            <rect width="32" height="32" fill="white"/>
                            </clipPath>
                            </defs>
                            </svg>
                            
                        Staffing
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/emergency-alerts"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.0004 4C13.6134 4 11.3242 4.94821 9.63641 6.63604C7.94858 8.32387 7.00037 10.6131 7.00037 13V17.803L5.07137 22.629C5.01074 22.7808 4.98823 22.9451 5.0058 23.1075C5.02337 23.27 5.08049 23.4257 5.17215 23.561C5.26382 23.6962 5.38725 23.807 5.53163 23.8835C5.67601 23.9601 5.83695 24.0001 6.00037 24H12.0004C12.0004 26.217 13.7834 28 16.0004 28C18.2174 28 20.0004 26.217 20.0004 24H26.0004C26.1638 24.0001 26.3247 23.9601 26.4691 23.8835C26.6135 23.807 26.7369 23.6962 26.8286 23.561C26.9202 23.4257 26.9774 23.27 26.9949 23.1075C27.0125 22.9451 26.99 22.7808 26.9294 22.629L25.0004 17.803V13C25.0004 10.6131 24.0522 8.32387 22.3643 6.63604C20.6765 4.94821 18.3873 4 16.0004 4ZM18.0004 24C18.0004 25.112 17.1124 26 16.0004 26C14.8884 26 14.0004 25.112 14.0004 24H18.0004ZM9.00037 13C9.00037 11.1435 9.73787 9.36301 11.0506 8.05025C12.3634 6.7375 14.1439 6 16.0004 6C17.8569 6 19.6374 6.7375 20.9501 8.05025C22.2629 9.36301 23.0004 11.1435 23.0004 13V17.995C23.0003 18.1221 23.0243 18.248 23.0714 18.366L24.5234 22H7.47737L8.92937 18.366C8.97626 18.2483 9.00036 18.1227 9.00037 17.996V13Z" fill="#737791"/>
                            </svg>                            
                        Emergency Alerts
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/reports-analytics"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M28 26.6665H4V6.6665" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M28 9.3335L17.3333 18.6668L12 13.3335L4 20.0002" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            
                        Reports & Analytics
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/availability-counter"   class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M28 26.6665H4V6.6665" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M28 9.3335L17.3333 18.6668L12 13.3335L4 20.0002" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            
                        Bedspace Counter
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink to="/dashboard/settings"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                        <svg  class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.9995 10.6665C17.414 10.6665 18.7706 11.2284 19.7708 12.2286C20.771 13.2288 21.3329 14.5854 21.3329 15.9998C21.3329 17.4143 20.771 18.7709 19.7708 19.7711C18.7706 20.7713 17.414 21.3332 15.9995 21.3332C14.585 21.3332 13.2285 20.7713 12.2283 19.7711C11.2281 18.7709 10.6662 17.4143 10.6662 15.9998C10.6662 14.5854 11.2281 13.2288 12.2283 12.2286C13.2285 11.2284 14.585 10.6665 15.9995 10.6665ZM15.9995 13.3332C15.2923 13.3332 14.614 13.6141 14.1139 14.1142C13.6138 14.6143 13.3329 15.2926 13.3329 15.9998C13.3329 16.7071 13.6138 17.3854 14.1139 17.8855C14.614 18.3856 15.2923 18.6665 15.9995 18.6665C16.7068 18.6665 17.385 18.3856 17.8851 17.8855C18.3852 17.3854 18.6662 16.7071 18.6662 15.9998C18.6662 15.2926 18.3852 14.6143 17.8851 14.1142C17.385 13.6141 16.7068 13.3332 15.9995 13.3332ZM13.3329 29.3332C12.9995 29.3332 12.7195 29.0932 12.6662 28.7732L12.1729 25.2398C11.3329 24.9065 10.6129 24.4532 9.91953 23.9198L6.59953 25.2665C6.3062 25.3732 5.9462 25.2665 5.7862 24.9732L3.11953 20.3598C3.03793 20.2225 3.00916 20.0601 3.0386 19.903C3.06805 19.7459 3.1537 19.605 3.27953 19.5065L6.09286 17.2932L5.99953 15.9998L6.09286 14.6665L3.27953 12.4932C3.1537 12.3947 3.06805 12.2537 3.0386 12.0967C3.00916 11.9396 3.03793 11.7772 3.11953 11.6398L5.7862 7.0265C5.9462 6.73317 6.3062 6.61317 6.59953 6.73317L9.91953 8.0665C10.6129 7.5465 11.3329 7.09317 12.1729 6.75984L12.6662 3.2265C12.7195 2.9065 12.9995 2.6665 13.3329 2.6665H18.6662C18.9995 2.6665 19.2795 2.9065 19.3329 3.2265L19.8262 6.75984C20.6662 7.09317 21.3862 7.5465 22.0795 8.0665L25.3995 6.73317C25.6929 6.61317 26.0529 6.73317 26.2129 7.0265L28.8795 11.6398C29.0529 11.9332 28.9729 12.2932 28.7195 12.4932L25.9062 14.6665L25.9995 15.9998L25.9062 17.3332L28.7195 19.5065C28.9729 19.7065 29.0529 20.0665 28.8795 20.3598L26.2129 24.9732C26.0529 25.2665 25.6929 25.3865 25.3995 25.2665L22.0795 23.9332C21.3862 24.4532 20.6662 24.9065 19.8262 25.2398L19.3329 28.7732C19.2795 29.0932 18.9995 29.3332 18.6662 29.3332H13.3329ZM14.9995 5.33317L14.5062 8.81317C12.9062 9.1465 11.4929 9.99984 10.4662 11.1865L7.25286 9.79984L6.25286 11.5332L9.0662 13.5998C8.53286 15.1554 8.53286 16.8443 9.0662 18.3998L6.23953 20.4798L7.23953 22.2132L10.4795 20.8265C11.5062 21.9998 12.9062 22.8532 14.4929 23.1732L14.9862 26.6665H17.0129L17.5062 23.1865C19.0929 22.8532 20.4929 21.9998 21.5195 20.8265L24.7595 22.2132L25.7595 20.4798L22.9329 18.4132C23.4662 16.8532 23.4662 15.1598 22.9329 13.5998L25.7462 11.5332L24.7462 9.79984L21.5329 11.1865C20.4852 9.9736 19.064 9.1434 17.4929 8.8265L16.9995 5.33317H14.9995Z" fill="#737791"/>
                            </svg>
                            
                        Settings
                      </NuxtLink>
                    </li>
                    <li>
                      <button @click="logOut" class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                          <svg class="h-6 w-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7741 20.2009L24.3365 14.8775C24.5544 14.629 24.6659 14.3152 24.666 13.9998C24.6661 13.784 24.6141 13.5674 24.5085 13.3704C24.4615 13.2826 24.4041 13.1992 24.3365 13.1221L19.7741 7.7987C19.2949 7.23957 18.4532 7.17478 17.8941 7.65398C17.3349 8.13317 17.2702 8.9749 17.7494 9.53403L20.4339 12.6664L10.1077 12.6664C9.37134 12.6664 8.77438 13.2633 8.77438 13.9997C8.77438 14.7361 9.37134 15.333 10.1077 15.333L20.4341 15.333L17.7494 18.4655C17.2702 19.0247 17.3349 19.8664 17.8941 20.3456C18.4532 20.8248 19.2949 20.76 19.7741 20.2009ZM11.3327 5.99967C12.0691 5.99967 12.666 6.59663 12.666 7.33301L12.666 9.33301C12.666 10.0694 13.263 10.6663 13.9993 10.6663C14.7357 10.6663 15.3327 10.0694 15.3327 9.33301L15.3327 7.33301C15.3327 5.12387 13.5418 3.33301 11.3327 3.33301L7.33268 3.33301C5.12354 3.33301 3.33268 5.12387 3.33268 7.33301L3.33268 20.6663C3.33268 22.8755 5.12354 24.6663 7.33268 24.6663L11.3327 24.6663C13.5418 24.6663 15.3327 22.8755 15.3327 20.6663L15.3327 18.6663C15.3327 17.93 14.7357 17.333 13.9993 17.333C13.263 17.333 12.666 17.93 12.666 18.6663L12.666 20.6663C12.666 21.4027 12.0691 21.9997 11.3327 21.9997L7.33268 21.9997C6.5963 21.9997 5.99935 21.4027 5.99935 20.6663L5.99935 7.33301C5.99935 6.59663 6.5963 5.99967 7.33268 5.99967L11.3327 5.99967Z" fill="#737791"/>
                              </svg>
                              
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </li>
                <li class="-mx-6 mt-auto pb-20">
                  <div class="flex items-center justify-center">
                    <div class="relative text-center w-64 rounded-xl p-6 shadow-lg bg-gradient-to-b from-red-600 to-red-500 overflow-hidden h-72 flex justify-center items-center">
                      <!-- Background circular gradient patterns -->
                      <div class="absolute w-40 h-40 bg-red-700 opacity-30 rounded-full top-[-20px] right-[-20px]"></div>
                      <div class="absolute w-56 h-56 bg-red-800 opacity-20 rounded-full bottom-[-40px] left-[-40px]"></div>
                
                      <!-- Card Content -->
                      <div class="relative z-10 text-white">
                        <div class="text-lg font-semibold">MAP AREA</div>
                        <p class="mt-2 text-sm">Find Areas they are surges!</p>
                        <button
                          class="mt-6 bg-white text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                        >
                          View Map
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Static sidebar for desktop -->
    <div class="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col bg-white">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow px-6 ring-1 ring-white/5">
        <div class="flex h-16 shrink-0 items-center pt-5">
          <img class="h-10 w-auto" src="@/assets/img/logo-red.png" alt="Your Company">
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-4">
                <li>
                  <NuxtLink to="/dashboard" class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <mask id="mask0_518_144" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
                      <rect width="32" height="32" fill="white"/>
                      </mask>
                      <g mask="url(#mask0_518_144)">
                      <path stroke="#737791" d="M13.6702 7.84619L14.0414 13.3661L14.2257 16.1405C14.2277 16.4259 14.2723 16.7093 14.3586 16.9817C14.5811 17.5105 15.1166 17.8465 15.6991 17.8231L24.5754 17.2424C24.9598 17.2361 25.331 17.3799 25.6073 17.6421C25.8375 17.8607 25.9862 18.1465 26.0331 18.454L26.0489 18.6407C25.6815 23.7269 21.9459 27.9693 16.8702 29.0644C11.7944 30.1595 6.58947 27.8461 4.08127 23.3803C3.35818 22.0828 2.90652 20.6568 2.75283 19.1857C2.68863 18.7503 2.66036 18.3104 2.6683 17.8704C2.66036 12.4174 6.54362 7.70302 11.9794 6.5665C12.6337 6.46462 13.275 6.81096 13.5374 7.40778C13.6053 7.54599 13.6501 7.69402 13.6702 7.84619Z"/>
                      <path opacity="0.4" d="M29.3337 13.0834L29.3244 13.1268L29.2975 13.19L29.3012 13.3635C29.2873 13.5933 29.1985 13.8143 29.0457 13.993C28.8864 14.179 28.6688 14.3057 28.4292 14.3549L28.2831 14.3749L18.042 15.0385C17.7013 15.0721 17.3621 14.9622 17.1089 14.7363C16.8977 14.5479 16.7628 14.2938 16.7247 14.0199L16.0373 3.79374C16.0253 3.75916 16.0253 3.72168 16.0373 3.6871C16.0467 3.40522 16.1708 3.13878 16.3819 2.9473C16.5928 2.75582 16.8733 2.65526 17.1604 2.66808C23.2403 2.82276 28.3501 7.19471 29.3337 13.0834Z"/>
                      </g>
                      </svg>
                      
                    Overview
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/bed-availability"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.875 13.8125V31.6875M34.125 20.3125V31.6875M21.125 12.1875H30.875M8.9375 17.875H13.8125M4.875 22.75H34.125M4.875 27.625H34.125M26 7.3125V17.0625" stroke="#737791" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                    Bed Availability
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/staffing"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_519_47)">
                        <path d="M0 30H32M18 26.6667V18.6667C18 18.6667 14.6667 16.6667 9.33333 16.6667C4 16.6667 0.666667 18.6667 0.666667 18.6667V26.6667M23.3333 2V6H19.3333V10H23.3333V14H27.3333V10H31.3333V6H27.3333V2H23.3333ZM8.992 14C8.992 14 5.332 11.6693 5.332 8.75467C5.332 6.5 7.124 4.672 9.33467 4.672C11.5453 4.672 13.328 6.5 13.328 8.75467C13.328 11.6667 9.68 14 9.68 14H8.992Z" stroke="#737791" stroke-width="2.13333"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_519_47">
                        <rect width="32" height="32" fill="white"/>
                        </clipPath>
                        </defs>
                        </svg>
                        
                    Staffing
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/emergency-alerts"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.0004 4C13.6134 4 11.3242 4.94821 9.63641 6.63604C7.94858 8.32387 7.00037 10.6131 7.00037 13V17.803L5.07137 22.629C5.01074 22.7808 4.98823 22.9451 5.0058 23.1075C5.02337 23.27 5.08049 23.4257 5.17215 23.561C5.26382 23.6962 5.38725 23.807 5.53163 23.8835C5.67601 23.9601 5.83695 24.0001 6.00037 24H12.0004C12.0004 26.217 13.7834 28 16.0004 28C18.2174 28 20.0004 26.217 20.0004 24H26.0004C26.1638 24.0001 26.3247 23.9601 26.4691 23.8835C26.6135 23.807 26.7369 23.6962 26.8286 23.561C26.9202 23.4257 26.9774 23.27 26.9949 23.1075C27.0125 22.9451 26.99 22.7808 26.9294 22.629L25.0004 17.803V13C25.0004 10.6131 24.0522 8.32387 22.3643 6.63604C20.6765 4.94821 18.3873 4 16.0004 4ZM18.0004 24C18.0004 25.112 17.1124 26 16.0004 26C14.8884 26 14.0004 25.112 14.0004 24H18.0004ZM9.00037 13C9.00037 11.1435 9.73787 9.36301 11.0506 8.05025C12.3634 6.7375 14.1439 6 16.0004 6C17.8569 6 19.6374 6.7375 20.9501 8.05025C22.2629 9.36301 23.0004 11.1435 23.0004 13V17.995C23.0003 18.1221 23.0243 18.248 23.0714 18.366L24.5234 22H7.47737L8.92937 18.366C8.97626 18.2483 9.00036 18.1227 9.00037 17.996V13Z" fill="#737791"/>
                        </svg>                            
                    Emergency Alerts
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/reports-analytics"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M28 26.6665H4V6.6665" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M28 9.3335L17.3333 18.6668L12 13.3335L4 20.0002" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                    Reports & Analytics
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/availability-counter"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M28 26.6665H4V6.6665" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M28 9.3335L17.3333 18.6668L12 13.3335L4 20.0002" stroke="#737791" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                        Bedspace Counter
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/dashboard/settings"  class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                    <svg  class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.9995 10.6665C17.414 10.6665 18.7706 11.2284 19.7708 12.2286C20.771 13.2288 21.3329 14.5854 21.3329 15.9998C21.3329 17.4143 20.771 18.7709 19.7708 19.7711C18.7706 20.7713 17.414 21.3332 15.9995 21.3332C14.585 21.3332 13.2285 20.7713 12.2283 19.7711C11.2281 18.7709 10.6662 17.4143 10.6662 15.9998C10.6662 14.5854 11.2281 13.2288 12.2283 12.2286C13.2285 11.2284 14.585 10.6665 15.9995 10.6665ZM15.9995 13.3332C15.2923 13.3332 14.614 13.6141 14.1139 14.1142C13.6138 14.6143 13.3329 15.2926 13.3329 15.9998C13.3329 16.7071 13.6138 17.3854 14.1139 17.8855C14.614 18.3856 15.2923 18.6665 15.9995 18.6665C16.7068 18.6665 17.385 18.3856 17.8851 17.8855C18.3852 17.3854 18.6662 16.7071 18.6662 15.9998C18.6662 15.2926 18.3852 14.6143 17.8851 14.1142C17.385 13.6141 16.7068 13.3332 15.9995 13.3332ZM13.3329 29.3332C12.9995 29.3332 12.7195 29.0932 12.6662 28.7732L12.1729 25.2398C11.3329 24.9065 10.6129 24.4532 9.91953 23.9198L6.59953 25.2665C6.3062 25.3732 5.9462 25.2665 5.7862 24.9732L3.11953 20.3598C3.03793 20.2225 3.00916 20.0601 3.0386 19.903C3.06805 19.7459 3.1537 19.605 3.27953 19.5065L6.09286 17.2932L5.99953 15.9998L6.09286 14.6665L3.27953 12.4932C3.1537 12.3947 3.06805 12.2537 3.0386 12.0967C3.00916 11.9396 3.03793 11.7772 3.11953 11.6398L5.7862 7.0265C5.9462 6.73317 6.3062 6.61317 6.59953 6.73317L9.91953 8.0665C10.6129 7.5465 11.3329 7.09317 12.1729 6.75984L12.6662 3.2265C12.7195 2.9065 12.9995 2.6665 13.3329 2.6665H18.6662C18.9995 2.6665 19.2795 2.9065 19.3329 3.2265L19.8262 6.75984C20.6662 7.09317 21.3862 7.5465 22.0795 8.0665L25.3995 6.73317C25.6929 6.61317 26.0529 6.73317 26.2129 7.0265L28.8795 11.6398C29.0529 11.9332 28.9729 12.2932 28.7195 12.4932L25.9062 14.6665L25.9995 15.9998L25.9062 17.3332L28.7195 19.5065C28.9729 19.7065 29.0529 20.0665 28.8795 20.3598L26.2129 24.9732C26.0529 25.2665 25.6929 25.3865 25.3995 25.2665L22.0795 23.9332C21.3862 24.4532 20.6662 24.9065 19.8262 25.2398L19.3329 28.7732C19.2795 29.0932 18.9995 29.3332 18.6662 29.3332H13.3329ZM14.9995 5.33317L14.5062 8.81317C12.9062 9.1465 11.4929 9.99984 10.4662 11.1865L7.25286 9.79984L6.25286 11.5332L9.0662 13.5998C8.53286 15.1554 8.53286 16.8443 9.0662 18.3998L6.23953 20.4798L7.23953 22.2132L10.4795 20.8265C11.5062 21.9998 12.9062 22.8532 14.4929 23.1732L14.9862 26.6665H17.0129L17.5062 23.1865C19.0929 22.8532 20.4929 21.9998 21.5195 20.8265L24.7595 22.2132L25.7595 20.4798L22.9329 18.4132C23.4662 16.8532 23.4662 15.1598 22.9329 13.5998L25.7462 11.5332L24.7462 9.79984L21.5329 11.1865C20.4852 9.9736 19.064 9.1434 17.4929 8.8265L16.9995 5.33317H14.9995Z" fill="#737791"/>
                        </svg>
                        
                    Settings
                  </NuxtLink>
                </li>
                <li>
                  <button type="button" @click="showLogoutModal = true" class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-[#737791]">
                      <svg class="h-6 w-6" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7741 20.2009L24.3365 14.8775C24.5544 14.629 24.6659 14.3152 24.666 13.9998C24.6661 13.784 24.6141 13.5674 24.5085 13.3704C24.4615 13.2826 24.4041 13.1992 24.3365 13.1221L19.7741 7.7987C19.2949 7.23957 18.4532 7.17478 17.8941 7.65398C17.3349 8.13317 17.2702 8.9749 17.7494 9.53403L20.4339 12.6664L10.1077 12.6664C9.37134 12.6664 8.77438 13.2633 8.77438 13.9997C8.77438 14.7361 9.37134 15.333 10.1077 15.333L20.4341 15.333L17.7494 18.4655C17.2702 19.0247 17.3349 19.8664 17.8941 20.3456C18.4532 20.8248 19.2949 20.76 19.7741 20.2009ZM11.3327 5.99967C12.0691 5.99967 12.666 6.59663 12.666 7.33301L12.666 9.33301C12.666 10.0694 13.263 10.6663 13.9993 10.6663C14.7357 10.6663 15.3327 10.0694 15.3327 9.33301L15.3327 7.33301C15.3327 5.12387 13.5418 3.33301 11.3327 3.33301L7.33268 3.33301C5.12354 3.33301 3.33268 5.12387 3.33268 7.33301L3.33268 20.6663C3.33268 22.8755 5.12354 24.6663 7.33268 24.6663L11.3327 24.6663C13.5418 24.6663 15.3327 22.8755 15.3327 20.6663L15.3327 18.6663C15.3327 17.93 14.7357 17.333 13.9993 17.333C13.263 17.333 12.666 17.93 12.666 18.6663L12.666 20.6663C12.666 21.4027 12.0691 21.9997 11.3327 21.9997L7.33268 21.9997C6.5963 21.9997 5.99935 21.4027 5.99935 20.6663L5.99935 7.33301C5.99935 6.59663 6.5963 5.99967 7.33268 5.99967L11.3327 5.99967Z" fill="#737791"/>
                          </svg>
                          
                    Sign Out
                  </button>
                </li>
              </ul>
            </li>
            <li class="-mx-6 mt-auto pb-20">
              <div class="flex items-center justify-center">
                <div class="relative text-center w-64 rounded-xl p-6 shadow-lg bg-gradient-to-b from-red-600 to-red-500 overflow-hidden h-72 flex justify-center items-center">
                  <!-- Background circular gradient patterns -->
                  <div class="absolute w-40 h-40 bg-red-700 opacity-30 rounded-full top-[-20px] right-[-20px]"></div>
                  <div class="absolute w-56 h-56 bg-red-800 opacity-20 rounded-full bottom-[-40px] left-[-40px]"></div>
            
                  <!-- Card Content -->
                  <div class="relative z-10 text-white">
                    <div class="text-lg font-semibold">MAP AREA</div>
                    <p class="mt-2 text-sm">Find Areas they are surges!</p>
                    <button @click="showMapModal = true"
                      class="mt-6 bg-white text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Map
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  
    <div class="xl:pl-72">
      <!-- Sticky search header -->
      <!-- <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b shadow-lg border-white/5 bg-white px-4 sm:px-6 lg:px-8">
        <button @click="openSidebar = true" type="button" class="-m-2.5 p-2.5 text-white xl:hidden">
          <span class="sr-only">Open sidebar</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </button>
  
        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form class="flex flex-1" action="#" method="GET">
            <label for="search-field" class="sr-only">Search</label>
            <div class="relative w-full">
              <svg class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
              <input id="search-field" class="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm" placeholder="Search..." type="search" name="search">
            </div>
          </form>
        </div>
      </div> -->

      <div class="sticky top-0 z-40 flex h-20 shrink-0  border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <DashHeader />
        <button @click="openSidebar = true" type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden pl-4">
          <span class="sr-only">Open sidebar</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true"></div>
  
        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form class="relative flex flex-1" action="#" method="GET">
            <label for="search-field" class="sr-only">Search</label>
            <svg class="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
            </svg>
            <input id="search-field" class="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm" placeholder="Search..." type="search" name="search">
          </form>
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span class="sr-only">View notifications</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </button>
            <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true"></div>
  

            <div class="relative">
              <button type="button" class="-m-1.5 flex items-center p-1.5" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <img class="h-8 w-8 rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                <span class="hidden lg:flex lg:items-center">
                  <span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">EverCare Clinics</span>
                  <svg class="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                    <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div> -->
      </div>
  
      <main class="bg-gray-25">
        <slot />
      </main>
    </div>
  </div>

  <SurgeMap @close="closeMap" @open="openMap" :showMapModal="showMapModal" />

  <LogoutModal :show="showLogoutModal"  @close="closeLogoutModal" />
  
</template>

<script  setup lang="ts">
import { useLogin } from '@/composables/auth/login'
// const { logOut } = useLogin()
// import { dynamicIcons } from '@/utils/assets'
import SurgeMap from "~/components/SurgeMap.vue";
const openSidebar = ref(false)

const showMapModal = ref(false)
const showLogoutModal = ref(false)

const closeLogoutModal = () => {
  showLogoutModal.value = false
}

const openMap = () => {
  showMapModal.value = true
}

const closeMap = () => {
  showMapModal.value = false
}

const sidebarItems = ref([
  {
    name: 'Dashboard Overview',
     path: '/dashboard/home',
    icon: 'dashboard-home'
  },
  {
    name: 'Bed Availability',
    path: '/dashboard/patients',
    icon: 'dashboard-patients'
  },
  {
    name: 'Staffing',
     path: '/dashboard/activity',
    icon: 'dashboard-activity'
  },
  {
    name: 'Emergency Alerts',
    path: '/dashboard/domains',
    icon: 'dashboard-domains'
  },
  {
    name: 'Settings & User Management',
     path: '/dashboard/usage',
    icon: 'dashboard-usage'
  },
  {
    name: 'Reports & Analytics',
     path: '/dashboard/settings',
    icon: 'dashboard-settings'
  },
  {
    name: 'Bedspace Counter',
     path: '/dashboard/availability-counter',
    icon: 'dashboard-settings'
  },
  {
    name: 'Map View',
     path: '/dashboard/map',
    icon: 'dashboard-settings'
  }
])
</script>

<style scoped>
.router-link-exact-active {
  background-color: #CC1100;
  border-radius: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  color: #FFFFFF
}
</style>