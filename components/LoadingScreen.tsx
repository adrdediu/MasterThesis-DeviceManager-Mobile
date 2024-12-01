import React from 'react';
import { Div, P } from '@expo/html-elements';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <Div className={`d-flex justify-content-center align-items-center vh-100 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light'}`}>
      <img 
        src={'../../assets/icons/device_manager.png'}
        className="mb-4"
        style={{ width: 64, height: 64 }}
      />
      <div className={`spinner-border ${theme === 'dark' ? 'text-light' : 'text-primary'}`} />
      <P className="mt-3">Connecting to Device Manager...</P>
    </Div>
  );
}
