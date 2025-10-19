import React, { createContext, useReducer, useContext } from 'react';

// 1. Define the initial state of our theme
const initialState = {
  layout: 'layout-a',
  general: {
    sectionBgColor: '#f7fafc',
    containerPadding: 24,
    cardCornerRadius: 12,
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    baseFontSize: 16,
    fontWeight: '500',
  },
  button: {
    bgColor: '#c05621',
    textColor: '#ffffff',
    borderRadius: 8,
    shadow: 'medium',
    alignment: 'right',
  },
  gallery: {
    alignment: 'grid-left',
    spacing: 12,
    imageBorderRadius: 8,
  },
  border: {
    strokeColor: '#e2e8f0',
    strokeWeight: 1,
  },
};

// 2. Create the reducer function to handle state updates
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VALUE':
      // payload will be { section: 'button', key: 'bgColor', value: '#ff0000' }
      const { section, key, value } = action.payload;
      return {
        ...state,
        [section]: {
          ...state[section],
          [key]: value,
        },
      };
    case 'LOAD_THEME':
      return action.payload;
    default:
      return state;
  }
};

// 3. Create the Context
const ThemeContext = createContext();

// 4. Create the Provider Component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  return (
    <ThemeContext.Provider value={{ theme: state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Create a custom hook for easy access to the context
export const useTheme = () => useContext(ThemeContext);