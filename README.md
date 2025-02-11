
# Zebra Reciept Printer

A React Native project built with Expo that demonstrates scanning, connecting, and sending data via Bluetooth using the `react-native-bluetooth-classic` and `react-native-bluetooth-state-manager` libraries. This project allows you to scan for both paired and unpaired Bluetooth devices, connect to a device, and send data in either ZPL (for receipt printing) or plain text format.

## Installation

```bash
  clone this repo
  cd code-challenge
  npm install -g expo-cli
  npm install
  expo install
```

In app.json, ensure you have the required permissions in the Android section:

```bash
{
  "expo": {
    "android": {
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_CONNECT",
        "BLUETOOTH_SCAN",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

## Deployment

To run this project

```bash
  npx expo prebuild --platform android
  npx expo run:android
```

## Running Tests

I used putty to test the payload is actually being sent.

```bash
Open Bluetooth Devices.
If using Windows 11, navigate: Start-> Settings-> Bluetooth & devices-> Devices-> More Bluetooth settings.

From the COM Ports tab, click Add.
Ensure 'Incoming (device initiates the connection)' is selected then click OK.
Click OK.
```

```bash
Open Putty
In Session -> connection type -> Select Serial
In the hostname replace COM1 with the COM Port configured in the previous step
Press Open
The putty bash will open and you can see the Bluetooth payload.
```

## Links

[https://labelary.com/viewer.html](https://labelary.com/viewer.html)

[https://github.com/kenjdavidson/react-native-bluetooth-classic](https://github.com/kenjdavidson/react-native-bluetooth-classic)

[https://kenjdavidson.com/react-native-bluetooth-classic/api/](https://kenjdavidson.com/react-native-bluetooth-classic/api/)

[https://www.npmjs.com/package/react-native-bluetooth-state-manager](https://www.npmjs.com/package/react-native-bluetooth-state-manager)
