import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';

import MyModal, { Review } from '../modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Add interfacing

export default function Index() {

  // Add modal visibility state
  const [modalVisible, setModalVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Callback passed to the modal after a successful review submission.
  const handleReviewSubmit = (newReview: Review) => {
    setReviews(prevReviews => [...prevReviews, newReview]);
    setModalVisible(false);
  };


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
          <View style={styles.container}>
          
          {/* Review Button */}
          <TouchableOpacity style={styles.reviewButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.reviewButtonText}>Leave a Review</Text>
          </TouchableOpacity>

          {/* Render the modal */}
          <MyModal
            isOpen={modalVisible}
            onClose={() => setModalVisible(false)}
            onReviewSubmit={handleReviewSubmit}
          />

          {/* Render submitted reviews */}
          <ScrollView style={styles.reviewList}>
            {reviews.map((rev, index) => (
              <View key={index} style={styles.reviewItem}>
                <Image source={{ uri: rev.userProfile }} style={styles.profileImage} />
                <View style={styles.reviewContent}>
                  <Text style={styles.userName}>{rev.userName}</Text>
                  <View style={styles.starDisplay}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name={star <= rev.rating ? "star" : "star-o"}
                        size={20}
                        color="gold"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>{rev.review}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
          

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
  reviewButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white', // You can use color names, HEX codes, or rgba values.
    
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
  },
  reviewList: {
    marginTop: 20,
  },
  //comments posted
  reviewItem: {
    flex: 500,
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  reviewContent: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  starDisplay: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 12,
  },
});
