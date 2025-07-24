import React from 'react';
// Revert to ReactDOM.render for React 17
import ReactDOM from 'react-dom'; // No '/client' for React 17
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';

const theme = extendTheme({
  // --- 1. Color Palette ---
  colors: {
    primary: {
      50: '#E6F0FF', 100: '#BFD7FF', 200: '#99BEFF', 300: '#73A5FF', 400: '#4D8CFF',
      500: '#2673FF', // Main Blue
      600: '#1F5ECC', 700: '#194999', 800: '#123366', 900: '#0C1C33',
    },
    accent: {
      50: '#FFF0E6', 100: '#FFD7BF', 200: '#FFBE99', 300: '#FFA573', 400: '#FF8C4D',
      500: '#FF7326', // Main Orange/Accent
      600: '#CC5C1F', 700: '#994519', 800: '#662F12', 900: '#33170C',
    },
    gray: {
      50: '#F9FAFB', 100: '#EDF2F7', 200: '#E2E8F0', 300: '#CBD5E0', 400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      light: '#FFFFFF',
    },
    background: {
      light: '#FFFFFF',
      section: '#F8F8F8',
    },
  },
  // --- 2. Global Styles ---
  styles: {
    global: (props) => ({
      body: { bg: 'background.light', color: 'text.primary', lineHeight: 'base', },
      '::-webkit-scrollbar': { width: '8px', height: '8px', },
      '::-webkit-scrollbar-thumb': { background: 'primary.500', borderRadius: '10px', },
      '::-webkit-scrollbar-track': { background: 'gray.100', },
    }),
  },
  // --- 3. Component Customization ---
  components: {
    Button: {
      baseStyle: { borderRadius: 'md', },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'primary' ? 'primary.500' : (props.colorScheme === 'accent' ? 'gray.700' : props.bg),
          color: 'text.light',
          _hover: {
            bg: props.colorScheme === 'primary' ? 'primary.600' : (props.colorScheme === 'accent' ? 'gray.800' : props._hover?.bg),
            boxShadow: 'md',
          },
          _active: {
            bg: props.colorScheme === 'primary' ? 'primary.700' : (props.colorScheme === 'accent' ? 'gray.900' : props._active?.bg),
          },
        }),
        ghost: (props) => ({
          color: 'text.primary',
          _hover: { bg: 'gray.100', color: 'primary.500', },
          _active: { bg: 'gray.200', },
        }),
        outline: { borderColor: 'primary.500', color: 'primary.500', _hover: { bg: 'primary.50', }, },
      },
      defaultProps: { colorScheme: 'primary', },
    },
    Input: { variants: { outline: { field: { bg: 'background.light', borderColor: 'gray.300', color: 'text.primary', _hover: { borderColor: 'gray.400' }, _focus: { borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)', }, }, }, }, },
    Textarea: { variants: { outline: { bg: 'background.light', borderColor: 'gray.300', color: 'text.primary', _hover: { borderColor: 'gray.400' }, _focus: { borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)', }, }, }, },
    Select: { variants: { outline: { field: { bg: 'background.light', borderColor: 'gray.300', color: 'text.primary', _hover: { borderColor: 'gray.400' }, _focus: { borderColor: 'primary.500', boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)', }, }, icon: { color: 'text.primary', }, }, }, },
    Link: { baseStyle: { color: 'primary.500', _hover: { textDecoration: 'underline', color: 'primary.700', }, }, },
    Box: {
        variants: {
            card: { borderWidth: '1px', borderColor: 'gray.200', borderRadius: 'md', overflow: 'hidden', bg: 'background.light', boxShadow: 'sm', _hover: { boxShadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s ease-in-out', borderColor: 'primary.100', }, },
            panel: { borderWidth: '1px', borderColor: 'gray.200', borderRadius: 'md', boxShadow: 'md', bg: 'background.light', padding: '6', },
        }, },
    Alert: { baseStyle: { container: { borderRadius: 'md', }, }, },
    Modal: { baseStyle: { dialog: { bg: 'background.light', border: '1px solid', borderColor: 'gray.200', boxShadow: 'lg', }, header: { color: 'text.primary', }, body: { color: 'text.primary', }, }, },
    Spinner: { baseStyle: { color: 'primary.500', emptyColor: 'gray.200', }, },
    Heading: { baseStyle: { color: 'text.primary', }, },
    Text: { baseStyle: { color: 'text.primary', }, },
    Avatar: { baseStyle: { bg: 'primary.500', color: 'white', border: '1px solid', borderColor: 'gray.300', }, },
    IconButton: { baseStyle: { color: 'text.primary', _hover: { bg: 'gray.100', color: 'primary.500', }, _active: { bg: 'gray.200', }, }, },
    Tag: {
      variants: {
        subtle: (props) => ({
          container: {
            bg: props.colorScheme === 'green' ? 'green.100' : props.colorScheme === 'orange' ? 'orange.100' : 'gray.100',
            color: props.colorScheme === 'green' ? 'green.700' : props.colorScheme === 'orange' ? 'orange.700' : 'gray.700',
          },
        }),
      },
    },
    FormLabel: { baseStyle: { color: 'text.primary', }, },
  },
  config: { initialColorMode: 'light', useSystemColorMode: false, },
  styles: {
    global: {
      body: {
        transitionProperty: "all",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-in-out",
      },
    },
  },
});

// Revert to ReactDOM.render for React 17
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();