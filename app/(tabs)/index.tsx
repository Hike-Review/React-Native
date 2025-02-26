import { Text, View, StyleSheet, TouchableOpacity, Image, InteractionManager} from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';
import { forceTouchHandlerName } from "react-native-gesture-handler/lib/typescript/handlers/ForceTouchGestureHandler";

// Add interfacing

export default function Index() {

  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "25%", "50%", "90%"], []);

  const sheetRef = useRef<BottomSheet>(null);

  // Markers view
  const [markersShown, setMarkerState] = useState<boolean>(true);

  // Route view
  const [displayedPath, setPathView] = useState<LatLng[]>([]);
  const [hikeDetails, setHike] = useState<any>("ERROR");
  const [pathViewSelected, pathViewSelect] = useState<boolean>(false);

  const hikes = [
    {
      "created_at": "2025-02-06 11:07:16",
      "creator_id": "1",
      "description": "Cool",
      "difficulty": "Easy",
      "distance": "999.99",
      "duration": "5.0",
      "end_lat": 36.98910805721358, 
      "end_lng": -122.04890606463675,
      "rating": "0.5",
      "routing_points": [
        [
          36.98910805721358, 
          -122.04890606463675
        ],
        [
          36.98762120726677, -122.04858956396757
        ],
        [
          36.986371602639785,
          -122.0483819712592,
        ]
      ],
      "start_lat": 36.986371602639785,
      "start_lng": -122.0483819712592,
      "tags": "None",
      "trail_id": "1",
      "trail_name": "Test Trail A"
    }
  ]

  //Axios Testing
  const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/";

  const [hikeData, setHikeData] = useState<Hike[]>(hikes);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hikeDB = await axios.get(API_URL + "hikes");
        setHikeData(hikeDB.data);
      }
      catch (error) {
        console.log(error);
      }    
    }
    fetchData();
  }, []);

  //Declared Hike Type
  type Hike = {
    "created_at": string,
    "creator_id": string,
    "description": string,
    "difficulty": string,
    "distance": string,
    "duration": string,
    "end_lat": number,
    "end_lng": number,
    "rating": string,
    "routing_points": Array<Array<number>>,
    "start_lat": number,
    "start_lng": number,
    "tags": string,
    "trail_id": string,
    "trail_name": string,
  };

  // console.log(hikeData.length)

  const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

  const renderBottomSheet = useCallback( 
    (item: any, index: number) => (
      <View key={Number(item.trail_id)} style={styles.itemContainer}>
        <TouchableOpacity
          onPress={(event) => (
            onMarkerSelection([item.start_lat, item.start_lng], index)
          )}
        >
          <Image source = {require('../../assets/images/exhike.jpg')}/>
          <Text>
            kendrick {item.trail_name}
          </Text>
        </TouchableOpacity>
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
    // Update Sheet Ref
    try{
      sheetRef.current?.snapToIndex(0);
    }
    catch{
      console.error("Unable to update BottomSheet reference.");
    }
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
    // Reset Hike display state
    setHike(null);
    setPathView([]);
    // Expose Markers
    setMarkerState(true);
    // Transition to Map View
    pathViewSelect(false);
  };

  // Handling marker selection
  const onBottomSelection = (marker_coords: any, key: any) => {
    // Transition to Path View
    pathViewSelect(true);
    // Hide Markers
    setMarkerState(false);
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
    // Display Path using hike details
    setPathView(hikeData[key].routing_points.map((item)=>({latitude:item[0], longitude:item[1]})));
    setHike(hikeData[key]);
    // Update Sheet Ref
    try{
      sheetRef.current?.snapToIndex(1);
    }
    catch{
      console.error("Unable to update BottomSheet reference.");
    }
  }

  // Handling marker selection
  const onMarkerSelection = (marker_coords: any, key: any) => {
    // Transition to Path View
    pathViewSelect(true);
    // Hide Markers
    setMarkerState(false);
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
    // Display Path using hike details
    setPathView(hikeData[key].routing_points.map((item)=>({latitude:item[0], longitude:item[1]})));
    setHike(hikeData[key]);
    // Update Sheet Ref
    try{
      sheetRef.current?.snapToIndex(1);
    }
    catch{
      console.error("Unable to update BottomSheet reference.");
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
        { markersShown ? 
          hikeData.map((hike, index) => (
            <Marker
            key={hike.trail_id} 
            coordinate={{
              longitude: hike.start_lng,
              latitude: hike.start_lat
            }}
            onPress={(event) => (
              onMarkerSelection(event.nativeEvent.coordinate, index)
            )}/>
          ))
         : null }
         <Polyline 
         coordinates={displayedPath}
         strokeColor={"#0088cc"}
         strokeWidth={10}
         />
      </MapView>

      <TouchableOpacity
        style = {styles.button}
        onPress={() => {resetLocation()}}
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
        { !pathViewSelected ? (
        <SafeAreaView style={styles.contentContainer}>
          <Text style={styles.bottomSheetHeadline}>
            Near You
          </Text>
          <BottomSheetScrollView>
            {/* {hikeData.map(renderBottomSheet)} */}
            {hikeData.map( (hike, index) => (
              <View key={Number(hike.trail_id)} style={styles.contentContainer}>
              <TouchableOpacity
                onPress={(event) => (
                  onMarkerSelection({latitude: hike.start_lat, longitude: hike.start_lng}, index)
                )}
                style = {styles.hikeBottomContainer}
                activeOpacity={0.8}
              >
                <Image 
                  source = {require('../../assets/images/exhike.jpg')}
                  style={styles.hikeBottomImage}
                />
                <Text style={styles.boldText}>
                  {hike.trail_name}
                </Text>
                <Text style={styles.hikeSubText}>
                  {hike.difficulty}{"\t"}{Number(hike.distance).toFixed(2)} mi{"\t"}    {hike.duration} min
                </Text>
              </TouchableOpacity>
            </View>
            ))
            }
          </BottomSheetScrollView>
        </SafeAreaView>) : (
        <SafeAreaView style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.hikeViewClose}
            onPress={resetLocation}
            hitSlop={{ 
              top: 50, bottom: 20, left: 50, right: 20
            }}
            >
              <Icon
                name="arrow-down"
                color={"white"}
                size = {25}
                style={{
                  position: "absolute",
                  top: 9,
                  left: 13,
                }}
              />
          </TouchableOpacity>
          <Text style={styles.bottomSheetHeadline}>
            {hikeDetails.trail_name}
          </Text>
          <Text style={styles.hikeSubHeader}>
            {hikeDetails.difficulty} Hike {"\t"} Distance: {Number(hikeDetails.distance).toFixed(2)}
             mi {"\t"}   Duration: {hikeDetails.duration}
          </Text>
        </SafeAreaView>
        )}
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
    fontSize: 20,
    paddingTop: 0,
    color: "white",
    fontWeight: "bold",
    marginBottom: 12,
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
  },
  hikeSubHeader: {
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
  hikeViewClose: {
    position: 'absolute',
    right: 333,
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 17,
    alignContent: "center",
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2.5,
  },
  hikeBottomContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "black",
    marginBottom: 15,
  },
  hikeSubText: {
    color: "white",
  },
  hikeBottomImage: {
    width: 350,
    borderRadius: 15,
    marginBottom: 5,
  },
});
