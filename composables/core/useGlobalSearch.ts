// import { coreApiFactory } from "@/apiFactory/core";
// import { ref, watch } from "vue";
// import { useNuxtApp } from "#app";

// export const useFetchGlobalSearch = () => {
//   const queryResult = ref([]) as any;
//   const query = ref(null) as Record<string, any>;
//   const loading = ref(false);
//   let debounceTimeout: NodeJS.Timeout;

//   const fetchQueryResult = async () => {
//     loading.value = true;
//     try {
//       const response = await coreApiFactory.$_global_search(query.value);
//       console.log(response, 'dearch result')
//       queryResult.value = response?.data || {};
//     } catch (error: any) {
//       useNuxtApp().$toast.error(error.message, {
//         autoClose: 5000,
//         dangerouslyHTMLString: true
//       });
//       return error;
//     } finally {
//       loading.value = false;
//     }
//   };

//   const debouncedFetchQueryResult = () => {
//     if (debounceTimeout) {
//       clearTimeout(debounceTimeout);
//     }
//     debounceTimeout = setTimeout(() => {
//       fetchQueryResult();
//     }, 300); // Adjust the delay as necessary
//   };

//   watch(query, (val) => {
//     query.value = val;
//     debouncedFetchQueryResult();
//   }, { immediate: true });

//   return { fetchQueryResult, query, loading, queryResult };
// };

import { coreApiFactory } from "@/apiFactory/core";
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";

export const useFetchGlobalSearch = () => {
  const queryResult = ref([]) as any;
  const query = ref('') as any;
  const loading = ref(false);
  let debounceTimeout: NodeJS.Timeout;

  const fetchQueryResult = async () => {
    if (!query.value.trim()) {
      queryResult.value = []; // Clear the result if query is empty
      return;
    }
    loading.value = true;
    try {
      const response = await coreApiFactory.$_global_search(query.value);
      console.log(response, 'search result')
      queryResult.value = response?.data || {};
    } catch (error: any) {
      useNuxtApp().$toast.error(error.message, {
        autoClose: 5000,
        dangerouslyHTMLString: true
      });
      return error;
    } finally {
      loading.value = false;
    }
  };

  const debouncedFetchQueryResult = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      fetchQueryResult();
    }, 300); // Adjust the delay as necessary
  };

  watch(query, (val) => {
    query.value = val;
    if (query.value.trim()) {
      debouncedFetchQueryResult();
    } else {
      queryResult.value = []; // Clear the result if query is empty
    }
  }, { immediate: true });

  return { fetchQueryResult, query, loading, queryResult };
};
