
export const useTextAlignment = () => {
    const textAlignmentList = ref([
      { name: 'Left', code: 'left' },
      { name: 'Center', code: 'center' },
    ]);
  
    return { textAlignmentList };
  };
  