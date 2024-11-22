import { ref } from 'vue';

export const visible = ref(false);
export const toastData = ref({
  title: '',
  message: '',
  toastType: 'success'
});

export function useCustomToast() {
  const showToast = ({ title, message, toastType = 'success', duration = 3000 }) => {
    toastData.value = { title, message, toastType };
    visible.value = true;
    
    setTimeout(() => {
      visible.value = false;
    }, duration);
  };

  return {
    visible,
    toastData,
    showToast,
  };
}
