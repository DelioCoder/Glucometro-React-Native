import React, { useEffect } from 'react';
import { View, Button, NativeEventEmitter, NativeModules, Platform, PermissionsAndroid } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const MyBluetoothApp = () => {
  useEffect(() => {
    BleManager.start({ showAlert: false });

    async function requestPermissions() {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          // Android 12 y versiones posteriores
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('Permisos Bluetooth denegados');
            return;
          }
        } else if (Platform.Version >= 23) {
          // Android 6 a 11
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Permiso de ubicación denegado');
            return;
          }
        }
      }
    }

    requestPermissions();

    const handleDiscoverPeripheral = (peripheral: any) => {
      console.log('Discovered peripheral', peripheral);
    };

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);

    return () => {
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    };
  }, []);

  const scanDevices = () => {
    BleManager.scan([], 5, true).then((results) => {
      console.log('Scanning...');
    });
  };

  return (
    <View>
      <Button title="Scan for Devices" onPress={scanDevices} />
    </View>
  );
};

export default MyBluetoothApp;
