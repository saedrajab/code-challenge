import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import BluetoothClassicScanner from "./components/BluetoothClassicScanner";

const App = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Image source={require("./assets/prm_logo.png")} style={styles.logo} />
      <Text style={styles.headerText}>Reciept Printer</Text>
    </View>
    <BluetoothClassicScanner />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default App;
