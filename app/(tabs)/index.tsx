import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';

import MyModal from './modal';

// Add interfacing

export default function Index() {

  // Add modal visibility state
  const [modalVisible, setModalVisible] = useState(false);


  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "25%", "50%", "90%"], []);

  const sheetRef = useRef<BottomSheet>(null);

  // Markers view
  const [markersShown, setMarkerState] = useState<boolean>(true);

  // Route view
  const [displayedPath, setPathView] = useState<LatLng[]>([]);
  const [hikeDetails, setHike] = useState<any>("ERROR");
  const [pathViewSelected, pathViewSelect] = useState<boolean>(false);

  // Temp Data
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
    setPathView(hikes[key].routing_points.map((item)=>({latitude:item[0], longitude:item[1]})));
    setHike(hikes[key]);
    // Update Sheet Ref
    try{
      sheetRef.current?.snapToIndex(1);
    }
    catch{
      console.error("Unable to update BottomSheet reference.");
    }
  }
  interface Review {
    id: number;
    user: string;
    review: string;
    rating: number;
    review_date: string;
  }
  // Hardcoded reviews to display
  const hardcodedReviews: Review[] = [
    { id: 1, user: "John Doe", review: "Amazing hike! Beautiful scenery.", rating: 5, review_date: "2025-02-25 14:30", trail_id: 101 },
    { id: 2, user: "Jane Smith", review: "A bit challenging but worth it!", rating: 4, review_date: "2025-02-24 10:15", trail_id: 102 },
    { id: 3, user: "Mike Brown", review: "Loved the peaceful atmosphere.", rating: 5, review_date: "2025-02-23 16:45", trail_id: 101 },
  ];

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewContainer}>
      <Text style={styles.reviewUser}>{review.user} - {review.review_date}</Text>
      <Text style={styles.reviewText}>{review.review}</Text>
      <Text style={styles.reviewRating}>⭐ {review.rating}/5</Text>
    </View>
  );
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
          hikes.map((hike, index) => (
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
            Near You{"\n"}
          </Text>
          <BottomSheetScrollView>
            {data.map(renderItem)}
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
            {hikeDetails.difficulty} Hike; Distance: {hikeDetails.distance}mi; Duration: {hikeDetails.duration}
          </Text>
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsHeader}>Reviews:</Text>
            {hardcodedReviews.map(renderReview)}
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.modalButton}>
            <Text style={{ color: 'white' }}>Show Modal</Text>
          </TouchableOpacity>
          <MyModal isOpen={modalVisible} onClose={() => setModalVisible(false)} />



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
  },
  hikeSubHeader: {
    fontSize: 12,
    color: "white"
  },
  hikeViewClose: {
    position: 'absolute',
    right: 333,
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 17,
    alignContent: "center",
  },
  modalButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  reviewsContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  reviewContainer: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  reviewUser: {
    fontWeight: "bold",
    color: "white",
  },
  reviewText: {
    color: "gray",
    marginTop: 2,
  },
  reviewRating: {
    color: "gold",
    marginTop: 2,
  },
  reviewsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
});
