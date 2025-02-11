import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';

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
  // Filter
  const [difficultyFilter, setDifficulty] = useState('');
  // User
  const [userData, setUserData] = useState(null);

  // Handle the checkbox change
  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value);
  };
  
  // Getting Hikes and Users
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
  
  // Hike rendering
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

  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "50%", "90%"], []);

  const sheetRef = useRef<BottomSheet>(null);

  /*const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

  const renderItem = useCallback(
    (item: any) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );*/

  // Map properties initialization
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] = useState<Location.LocationObject>({
    coords: {
      latitude: 37.78825,
      longitude: -122.4324,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  });

  const [initialRegion, setInitialRegion] = useState({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
  });


  //Get location permissions and set region
  useEffect(() => {
    const getCurrentLocation = async() => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      setInitialRegion ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });

    }
    getCurrentLocation();
  }, []);

  //Reset region for button
  const resetLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };


  const userIcon = () => {
    return(
      <Svg 
        height = {20}
        width = {20}
      >
      <Ellipse
        cx="10"
        cy="10"
        rx="10"
        ry="10"
        fill="blue"
        stroke="white"
        strokeWidth="2"
      />
      </Svg>

      )
  }


  //UI Setup
  return (
    <GestureHandlerRootView>
      <label>
        Easy: <input value="Easy" type="radio" checked={difficultyFilter == 'Easy'} onChange={handleDifficultyChange}></input>
      </label>
      <label>
        Moderate : <input value="Moderate" type="radio" checked={difficultyFilter == 'Moderate'} onChange={handleDifficultyChange}></input>
      </label>
      <label>
        Hard : <input value="Hard" type="radio" checked={difficultyFilter == 'Hard'} onChange={handleDifficultyChange}></input>
      </label>
      <MapView 
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={initialRegion}
        ref = {mapRef}
      >
        <Marker 
          coordinate={initialRegion}
        >  
          <View>
            {(userIcon())}
          </View>
        </Marker>

      </MapView>

      <TouchableOpacity
        style = {styles.button}
        onPress={resetLocation}
        hitSlop={{ 
          top: 50, bottom: 20, left: 50, right: 20
        }}
        >
          <Icon
            name="location-arrow"
            color={"white"}
            size = {30}
            style={{
              position: "absolute",
              top: 9,
              left: 13,
            }}
          />
      </TouchableOpacity>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={{
          backgroundColor: "black",
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        }}
        handleIndicatorStyle={{
          backgroundColor: "gray",
        }}
      >
        <SafeAreaView style={styles.contentContainer}>
          <Text style={styles.bottomSheetHeadline}>
            Near You{"\n"}
          </Text>
          <BottomSheetScrollView>
            {hikeData ? hikeData.map(renderHike) : "Loading Data..."}
          </BottomSheetScrollView>
        </SafeAreaView>
      </BottomSheet>

    </GestureHandlerRootView>
  );
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: "black",
    flex: 1,
    alignItems: "center",
    padding: 0,
  },
  bottomSheetHeadline: {
    fontSize: 17,
    paddingTop: 0,
    color: "white"
  },
  button: {
    position: 'absolute',
    top: 650,
    left: 333,
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 17,
    alignContent: "center"
  },
  sheet: {
    flex: 1,
  } 
});
