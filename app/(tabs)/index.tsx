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

export default function Index() {

  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "50%", "90%"], []);

  const sheetRef = useRef<BottomSheet>(null);

  // Markers view

  const [markersShown, setMarkerState] = useState<boolean>(true);

  // Temp Data
  const hikes = [
    {
      "created_at": "2025-02-06 11:07:16",
      "creator_id": "1",
      "description": "Very Short",
      "difficulty": "Hard",
      "distance": "5.0",
      "duration": "10.0",
      "end_lat": "0.600000",
      "end_lng": "0.600000",
      "rating": "4.7",
      "routing_points": [
        [
          "0.530000",
          "0.530000"
        ],
        [
          "0.560000",
          "0.560000"
        ],
        [
          "0.580000",
          "0.580000"
        ]
      ],
      "start_lat": 36.97662628067844,
      "start_lng": -122.0739932398158,
      "tags": "None",
      "trail_id": "2",
      "trail_name": "Test Trail B"
    },
    {
      "created_at": "2025-02-06 11:07:16",
      "creator_id": "1",
      "description": "Cool",
      "difficulty": "Easy",
      "distance": "999.99",
      "duration": "5.0",
      "end_lat": "1.000000",
      "end_lng": "1.000000",
      "rating": "0.5",
      "routing_points": [
        [
          "0.100000",
          "0.100000"
        ],
        [
          "0.200000",
          "0.200000"
        ],
        [
          "0.300000",
          "0.300000"
        ],
        [
          "0.400000",
          "0.400000"
        ],
        [
          "0.500000",
          "0.500000"
        ],
        [
          "0.600000",
          "0.600000"
        ],
        [
          "0.700000",
          "0.700000"
        ],
        [
          "0.800000",
          "0.800000"
        ],
        [
          "0.900000",
          "0.900000"
        ]
      ],
      "start_lat": 36.986465872189676,
      "start_lng": -122.04846778753316,
      "tags": "None",
      "trail_id": "1",
      "trail_name": "Test Trail A"
    }
  ]

  const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

  const renderItem = useCallback(
    (item: any) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );

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

  // Handling marker selection
  const showMarkers = (state: boolean) => {
    setMarkerState(state);
  }

  const onMarkerSelection = (marker_coords: any, key: any) => {
    console.log(marker_coords);
    console.log(key);
    // Hide Markers
    showMarkers(false);
    // Update view of Map for marker
    const region = {
      latitude: marker_coords.latitude,
      longitude: marker_coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }

  //UI Setup
  return (
    <GestureHandlerRootView>

      <MapView 
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={initialRegion}
        ref = {mapRef}
        showsUserLocation
      >
        {markersShown ? hikes.map((hike, index) => (
          <Marker
          key={hike.trail_id} 
          coordinate={{
            longitude: hike.start_lng,
            latitude: hike.start_lat
          }}
          onPress={(event) => (
            onMarkerSelection(event.nativeEvent.coordinate, index)
          )}
          />
        )) : null}
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
            {data.map(renderItem)}
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
