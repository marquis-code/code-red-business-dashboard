// composables/useConfirmationModal.ts

import { ref, Ref } from 'vue'

interface ModalState {
  isVisible: Ref<boolean>;
  message: Ref<string>;
  onConfirm: () => void;
}

const state: ModalState = {
  isVisible: ref(false),
  message: ref(''),
  onConfirm: () => {},
}

export function useConfirmationModal() {
  function openModal(message: string, confirmAction: () => void) {
    state.isVisible.value = true;
    state.message.value = message;
    state.onConfirm = confirmAction;
  }

  function closeModal() {
    state.isVisible.value = false;
  }

  function confirm() {
    state.onConfirm();
    closeModal();
  }

  return {
    state,
    openModal,
    closeModal,
    confirm,
  }
}
