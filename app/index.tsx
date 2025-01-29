import { Text, View, StyleSheet } from "react-native";
import React, { useRef, useCallback, useMemo } from 'react';
import MapView from 'react-native-maps';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  // BottomSheet properties
  const snapPoints: string[] = ["10%", "50%", "90%"];

  const sheetRef = useRef<BottomSheet>(null);

  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );

  const renderItem = useCallback(
    (item: any) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  
  return (
    <GestureHandlerRootView>
      <MapView style={styles.map}></MapView>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
      >
        <SafeAreaView style={styles.contentContainer}>
          <Text style={styles.bottomSheetHeadline}
          >
            KENDRICK WAS HERE
          </Text>
        </SafeAreaView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create( {
  container: {
    flex: 1,
    paddingTop: 200
  },
  map: {
    width: '100%',
    height: '100%',
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
  contentContainer: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  bottomSheetHeadline: {
    fontSize: 24
  }
});
