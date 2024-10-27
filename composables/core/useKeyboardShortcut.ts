import { onMounted, onUnmounted } from 'vue';

export function useKeyboardShortcut(callback: () => void): void {
  const handler = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      callback();
    }
  };

  onMounted(() => window.addEventListener('keydown', handler));
  onUnmounted(() => window.removeEventListener('keydown', handler));
}
