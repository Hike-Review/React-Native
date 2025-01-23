import { Text, View, StyleSheet } from "react-native";
import React from 'react';
import MapView from 'react-native-maps';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MapView style={style.map} />
    </View>
  );
}

const style = StyleSheet.create( {
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
