import {
    Alert,
  } from "react-native";
  
import RNFS from 'react-native-fs';

export const generateTextFile = async () => {
  const path = `${RNFS.DocumentDirectoryPath}/receipt.txt`;
  const content = `
    PRM-Parking Receipt
    ----------------------------
    Date: ${new Date().toLocaleDateString()}
    ----------------------------
    1. Widget A         $10.00
    2. Widget B         $15.00
    3. Widget C         $20.00
    ----------------------------
    Total:              $45.00
  `;

  try {
    await RNFS.writeFile(path, content, 'utf8');
    console.log('Text file written successfully!');
    return path;
  } catch (error) {
    console.error('Error writing text file:', error);
    throw error;
  }
};

export const sendTextFile = async (connectedDevice) => {
    try {
  if (!connectedDevice) {
    console.error('No device connected.');
    return;
  }
    const filePath = await generateTextFile();
    const fileData = await RNFS.readFile(filePath, 'utf8');
    if (await connectedDevice.isConnected()) {
        await connectedDevice.write(fileData);
        Alert.alert("Success", "Text file sent successfully.");
        console.log('Text file sent successfully!');
      } else {
        console.error('Device is not connected.');
        Alert.alert("Error", "Device is not connected.");
      }
  } catch (error) {
    console.error('Error sending text file:', error);
  }
};
