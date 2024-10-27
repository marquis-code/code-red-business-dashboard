
export const useFontFamily = () => {
    const fontsList = ref([
      { name: 'Anton', code: 'Anton' },
      { name: 'Bebas Neue', code: 'BebasNeue' },
      { name: 'Bangers', code: 'Bangers' },
      { name: 'Baskervville', code: 'Baskervville' },
      { name: 'Caveat', code: 'Caveat' },
      { name: 'Kanit', code: 'Kanit' },
      { name: 'Lobster', code: 'Lobster' },
      { name: 'Lato', code: 'Lato' },
      { name: 'Noto Serif', code: 'NotoSerif' },
      { name: 'Pacifico', code: 'Pacifico' },
      { name: 'Playfair Display', code: 'PlayfairDisplay' },
      { name: 'Roboto Condensed', code: 'RobotoCondensed' },
      { name: 'Source Code Pro', code: 'SourceCodePro' },
    ]);
  
    return { fontsList };
  };
  