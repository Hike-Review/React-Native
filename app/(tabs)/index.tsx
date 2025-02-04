import { Text, View, StyleSheet } from "react-native";
import React, { useRef, useCallback, useMemo } from 'react';
import MapView from 'react-native-maps';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  // BottomSheet properties
  const snapPoints: string[] = ["13%", "50%", "90%"];

  // const snapPoints = useMemo(() => ["13%", "50%", "90%"], []);

  const sheetRef = useRef<BottomSheet>(null);

  const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

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
          <Text style={styles.bottomSheetHeadline}>
            Near You{"\n"}
          </Text>
          <BottomSheetScrollView>
            {data.map(renderItem)}
          </BottomSheetScrollView>
        </SafeAreaView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '87%',
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
    fontSize: 24,
    paddingTop: 0,
  }
});
