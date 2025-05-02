import { ref, watch } from "vue";
import { useStorage } from "@vueuse/core";

const runtimeData = {
  auth: ref(),
  user: ref({} as any),
  token: ref(""),
};
const localStorageData = {
  auth: ref(),
  user: useStorage("user", {} as any),
  token: useStorage("token", ""),
};

watch(
  runtimeData.user,
  (val) => {
    if (val && typeof val === "object") {
      Object.keys(val).forEach((key) => {
        localStorageData.user.value[key] = val[key];
      });
    }
  },
  { deep: true }
);

(() => {
  runtimeData.auth.value = localStorageData.auth.value;
  runtimeData.user.value = localStorageData.user.value;
  runtimeData.token.value = localStorageData.token.value;
})();

export const useUser = () => {
  const router = useRouter()
  const id = computed({
    get: () => runtimeData?.auth?.value?.id ?? "",
    set: () => {},
  });


  const isLoggedIn = computed({
    get: () => {
      if (!runtimeData.token?.value) return false;
      return (
        runtimeData?.user?.value != null &&
        typeof runtimeData.user.value === "object"
      );
    },
    set: () => {},
  });

  const isEmailVerified = computed(() => {
    return runtimeData?.user?.value.isEmailVerified;
  });

  const logOut = () => {
    localStorage.clear();
    window.location.href = "/login"
    router.push('/login')
    runtimeData.user.value = null;
  };

  const setToken = (token: string) => {
    console.log(token, 'token recieved')
    runtimeData.token.value = token;
    localStorageData.token.value = token;
  };
  const createUser = (user: any) => {
    runtimeData.user.value = user?.hospital;
    localStorageData.user.value = user?.hospital;
    localStorageData.token.value = user?.access_token;
    runtimeData.token.value = user?.access_token;
  };

  const updateUser = (user: any) => {
    runtimeData.user.value = user?.corporate;
    localStorage.setItem('user', JSON.stringify(user));
    localStorageData.user.value = user?.corporate;
  };

  return {
    id,
    isLoggedIn,
    isEmailVerified,
    createUser,
    ...runtimeData,
    logOut,
    updateUser,
    setToken
  };
};
