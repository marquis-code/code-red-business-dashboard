
export const useColors = () => {
  const colors = ref([
    { name: 'Color 1', code: '#39349A', key: '0xFF39349A' },
    { name: 'Color 2', code: '#026290', key: '0xFF026290' },
    { name: 'Color 3', code: '#034C40', key: '0xff034C40' },
    { name: 'Color 4', code: '#79062D', key: '0xff79062D' },
    { name: 'Color 5', code: '#543F21', key: '0xff543F21' },
    { name: 'Color 6', code: '#6E267C', key: '0xFF6E267C' },
    { name: 'Color 7', code: '#243640', key: '0xFF243640' },
    { name: 'Color 8', code: '#792139', key: '0xFF792139' },
  ]);

  return { colors };
};
