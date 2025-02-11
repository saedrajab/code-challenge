import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { sendTextFile } from "../utils/GenerateTXT";
import { sendReceipt } from "../utils/GenerateZPL";

const BluetoothClassicScanner = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [viewMode, setViewMode] = useState("scan");

  //Check for necessary android permissions and active connection
  useEffect(() => {
    if (Platform.OS === "android") {
      requestBluetoothPermissions();
    }
    checkForActiveConnection();

    //cleanup on umount
    return () => {
      if (typeof RNBluetoothClassic.cancelDiscovery === "function") {
        RNBluetoothClassic.cancelDiscovery().catch((err) =>
          console.warn("Error canceling discovery on unmount:", err)
        );
      }

      if (connectedDevice) {
        connectedDevice
          .disconnect()
          .catch((err) =>
            console.warn("Error disconnecting device on unmount:", err)
          );
      }
    };
  }, []);

  //when a device is connected, listen for disconnection events
  useEffect(() => {
    const subscription = RNBluetoothClassic.onDeviceDisconnected((event) => {
      if (!connectedDevice) {
        return;
      }

      if (event && event.device && event.device.id === connectedDevice.id) {
        console.log(`Device ${event.device.name} disconnected.`);
        setConnectedDevice(null);
        setViewMode("scan");
        Alert.alert("Disconnected", `${event.device.name} has disconnected.`);
      } else {
        console.warn(
          "Received onDeviceDisconnected event that does not match the current device:",
          event
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [connectedDevice]);

  const checkForActiveConnection = async () => {
    try {
      const state = await BluetoothStateManager.getState();
      if (state !== "PoweredOn") return;

      const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
      console.log("Connected devices:", connectedDevices);
      if (connectedDevices.length > 0) {
        setConnectedDevice(connectedDevices[0]);
        setViewMode("connected");
      }
    } catch (error) {
      console.error("Error checking active connection:", error);
    }
  };

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ]);

        if (
          granted["android.permission.BLUETOOTH_CONNECT"] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted["android.permission.BLUETOOTH_SCAN"] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            "Permission Denied",
            "Bluetooth permissions are required for this app to work correctly."
          );
        }
      } catch (err) {
        console.warn("Permission request error:", err);
      }
    }
  };

  const enableBluetooth = async () => {
    try {
      const state = await BluetoothStateManager.getState();
      if (state !== "PoweredOn") {
        const enable = await BluetoothStateManager.requestToEnable();
        if (!enable) {
          Alert.alert(
            "Bluetooth Disabled",
            "Please enable Bluetooth to scan for devices."
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      Alert.alert("Error", "Could not check or enable Bluetooth.");
      return false;
    }
  };

  const startDiscovery = async () => {
    setLoading(true);
    try {
      const btEnabled = await enableBluetooth();
      if (!btEnabled) {
        setLoading(false);
        return;
      }

      if (typeof RNBluetoothClassic.cancelDiscovery === "function") {
        await RNBluetoothClassic.cancelDiscovery();
      } else {
        console.warn("cancelDiscovery method is not available.");
      }

      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      const unpairedDevices = await RNBluetoothClassic.startDiscovery();

      const allDevices = [...pairedDevices, ...unpairedDevices];
      const uniqueDevices = allDevices.filter(
        (device, index, self) =>
          index === self.findIndex((d) => d.id === device.id)
      );

      setDevices(uniqueDevices);
    } catch (err) {
      console.error("Discovery error:", err);
      Alert.alert("Error", "Failed to start discovery.");
    } finally {
      setLoading(false);
    }
  };

  const connectToDevice = async (device) => {
    setLoading(true);
    try {

      const isConnected = await device.isConnected();
      if (isConnected) {
        setConnectedDevice(device);
        setViewMode("connected");
        return;
      }

      await device.connect();
      console.log("Connected to device:", device);
      setConnectedDevice(device);
      setViewMode("connected");
    } catch (err) {
      console.error("Connection error:", err);
      Alert.alert(
        "Connection Error",
        "Failed to connect to the device. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromDevice = async () => {
    console.log("Attempting to disconnect from device:", connectedDevice);
    if (connectedDevice && connectedDevice.id) {
      try {
        await RNBluetoothClassic.unpairDevice(connectedDevice.id);
        setConnectedDevice(null);
        setViewMode("scan");
        console.log("Disconnected from device");
        Alert.alert("Success", "Successfully disconnected from device.");
        setDevices([]);
      } catch (err) {
        console.error("Disconnection error:", err);
        Alert.alert("Error", "Failed to disconnect from device.");
      }
    } else {
      Alert.alert("Error", "No device is connected.");
    }
  };

  return (
    <View style={styles.container}>
      {viewMode === "connected" ? (
        <View style={styles.connectionView}>
          <Text style={styles.title}>Connected to: {connectedDevice.name}</Text>
          <Text style={styles.subtitle}>Device ID: {connectedDevice.id}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={disconnectFromDevice}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => sendReceipt(connectedDevice)}
            >
              <Text style={styles.buttonText}>Send Receipt</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => sendTextFile(connectedDevice)}
            >
              <Text style={styles.buttonText}>Send as Text</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.scanView}>
          <TouchableOpacity style={styles.scanButton} onPress={startDiscovery}>
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#005081"
              style={styles.loading}
            />
          ) : (
            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.deviceItem}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => connectToDevice(item)}
                  >
                    <Text style={styles.buttonText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: "#f8f9fa",
  },
  connectionView: { alignItems: "center", justifyContent: "center", flex: 1 },
  scanView: { flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#005081",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "45%",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  scanButton: {
    backgroundColor: "#e50051",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  scanButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deviceItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    alignItems: "center",
  },
  deviceName: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  loading: { marginTop: 20 },
});

export default BluetoothClassicScanner;
