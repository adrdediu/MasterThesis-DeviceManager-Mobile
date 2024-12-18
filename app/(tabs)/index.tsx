import { Stack } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Update the imports at the top
import WebView from '../../components/WebView';
import { Platform } from 'react-native';
import { Image } from '@rneui/base';
import { Input, Button, Text, Card, ThemeProvider, Icon } from '@rneui/themed';

const initializeTheme = async () => {
  const storedTheme = await AsyncStorage.getItem('theme');
  return storedTheme || 'light';
};

export default function App() {
  const [serverIP, setServerIP] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [serverResponse, setServerResponse] = useState({ http: null, https: null });
  const [debugMode, setDebugMode] = useState(false);

  const DebugInfo = () => (
    <View style={styles.debugContainer}>
      <Text style={styles.debugText}>Server IP: {serverIP}</Text>
      <Text style={styles.debugText}>Connection Status: {error ? 'Error' : 'OK'}</Text>
      <Text style={styles.debugText}>Last Error: {error}</Text>
      <Text style={styles.debugText}>Theme: {theme}</Text>
      <Text style={styles.debugText}>HTTP Response: {JSON.stringify(serverResponse.http, null, 2)}</Text>
      <Text style={styles.debugText}>HTTPS Response: {JSON.stringify(serverResponse.https, null, 2)}</Text>
    </View>
  );

  useEffect(() => {
    const loadTheme = async () => {
      const initialTheme = await initializeTheme();
      setTheme(initialTheme);
    };
    loadTheme();
  }, []);
  
  useEffect(() => {
    checkStoredIP();
    initializeTheme();
  }, []);


  const checkStoredIP = async () => {
    try {
      const storedIP = await AsyncStorage.getItem('serverIP');
      if (storedIP) {
        const isValid = await validateServer(storedIP);
        if (isValid) {
          setServerIP(storedIP);
          setShowModal(false);
        }
      }
    } catch (error) {
      setError('Unable to connect to server');
    }
    setIsLoading(false);
  };

  const validateServer = async (ip) => {
    try {
      // First try HTTP
      console.log(`Testing connection to: http://${ip}`);
      const httpResponse = await fetch(`http://${ip}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        timeout: 5000
      });
      
      const httpData = {
        status: httpResponse.status,
        headers: Object.fromEntries(httpResponse.headers.entries()),
        data: await httpResponse.text()
      };
      
      setServerResponse(prev => ({
        ...prev,
        http: httpData,
        lastAttempt: new Date().toISOString()
      }));
  
      return httpResponse.ok;
  
    } catch (error) {
      const errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      
      setServerResponse(prev => ({
        ...prev,
        error: errorDetails,
        lastError: new Date().toISOString()
      }));
      
      console.log('Connection Details:', {
        ip,
        error: errorDetails,
        devicePlatform: Platform.OS,
        deviceVersion: Platform.Version
      });
      
      return false;
    }
  };
  

  const handleIPSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    const isValid = await validateServer(serverIP);
    if (isValid) {
      await AsyncStorage.setItem('serverIP', serverIP);
      setShowModal(false);
    } else {
      setError('Server not found');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Icon
          name="settings"
          type="material"
          size={50}
          color={theme === 'dark' ? '#ffffff' : '#0d6efd'}
        />
        <Text h4 style={styles.loadingTitle}>Device Manager</Text>
        <Text style={styles.loadingText}>Connecting to server...</Text>
      </SafeAreaView>
    );
  }

  return (
   // <ThemeProvider>
      <SafeAreaView style={styles.container}>
        {showModal ? (
          <View style={styles.modalContainer}>
            <Card containerStyle={styles.card}>
              <View style={[styles.headerContainer,{ alignItems: 'center', flexDirection: 'column' }]}>
                <Image 
                  source={require('../../assets/icons/device_manager.png')}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.headerContainer,{ alignItems: 'center', flexDirection: 'column' }]}>
                <Text h4 style={styles.title}>Device Manager Setup</Text>
              </View>
              <Card.Divider />
              <Input
                placeholder="Enter server IP address"
                value={serverIP}
                onChangeText={(text) => setServerIP(text)}
                errorMessage={error}
                leftIcon={
                  <Icon
                    name="computer"
                    type="material"
                    size={24}
                    color={theme === 'dark' ? '#ffffff' : '#0d6efd'}
                  />
                }
                inputStyle={styles.input}
                containerStyle={styles.inputContainer}
              />
              <Button
                title="Connect"
                onPress={handleIPSubmit}
                raised
                buttonStyle={styles.button}
                titleStyle={styles.buttonText}
              />
              <Button
                title="Debug Info"
                onPress={() => setDebugMode(!debugMode)}
                type="outline"
                buttonStyle={styles.debugButton}
                titleStyle={styles.debugButtonText}
              />
            </Card>
            {debugMode && <DebugInfo />}
          </View>
        ) : (
          <WebView url={`https://${serverIP}`} />
        )}
      </SafeAreaView>
    //</ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    marginLeft: 10,
    color: '#212529',
  },
  loadingTitle: {
    marginTop: 20,
    color: '#212529',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  input: {
    color: '#212529',
    paddingLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0d6efd',
    borderRadius: 5,
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
  debugContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    marginVertical: 2,
    fontFamily: 'monospace',
  },
  debugButton: {
    marginTop: 10,
    borderColor: '#6c757d',
  },
  debugButtonText: {
    color: '#6c757d',
  }
});
