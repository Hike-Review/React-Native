import { Text, View, StyleSheet } from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Define the type of a hike object
interface Hike {
  trail_id: number;
  trail_name: string;
  location: string;
  difficulty: string;
  distance: number;
  description: string;
  created_at: string;
}

export default function Index() {
  // Sync Server Data
  const [hikeData, setHikeData] = useState<Hike[] | null>(null);
  const [difficultyFilter, setDifficulty] = useState('');
  const [userData, setUserData] = useState(null);

  // Handle the checkbox change
  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value);
  };
  
  const fetchData = async () => {
    try {
      const [hikesResponse, usersResponse] = await Promise.all([
        axios.get('http://127.0.0.1:5000/hikes', {params:{difficulty:difficultyFilter},}),
        axios.get('http://127.0.0.1:5000/users')
      ]);
      setHikeData(hikesResponse.data);
      setUserData(usersResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [difficultyFilter]);

  // BottomSheet properties
  const snapPoints: string[] = ["10%", "50%", "90%"];

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

  const renderHike = useCallback(
    (record: any) => (
      <View key={record.trail_id} style={styles.itemContainer}>
        <Text>ID: {record.trail_id}</Text>
        <Text>Name: {record.trail_name}</Text>
        <Text>Location: {record.location}</Text>
        <Text>Difficulty: {record.difficulty}</Text>
        <Text>Distance: {record.distance} km</Text>
        <Text>Description: {record.description}</Text>
        <Text>Created At: {record.created_at}</Text>
      </View>
    ),
    []
  );
  
  return (
    <GestureHandlerRootView>
      {/* <MapView style={styles.map}></MapView> */}
      <label>
        Easy: <input value="Easy" type="radio" checked={difficultyFilter == 'Easy'} onChange={handleDifficultyChange}></input>
      </label>
      <label>
        Moderate : <input value="Moderate" type="radio" checked={difficultyFilter == 'Moderate'} onChange={handleDifficultyChange}></input>
      </label>
      <label>
        Hard : <input value="Hard" type="radio" checked={difficultyFilter == 'Hard'} onChange={handleDifficultyChange}></input>
      </label>

      {hikeData ? (
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
      >
        <SafeAreaView style={styles.contentContainer}>
          <Text style={styles.bottomSheetHeadline}
          >
            Title
          </Text>
          <BottomSheetScrollView>
            {hikeData.map(renderHike)}
          </BottomSheetScrollView>
        </SafeAreaView>
      </BottomSheet>
      ) : (
        <p>Loading data...</p>
      )}
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
