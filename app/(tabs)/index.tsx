import { Text, View, StyleSheet, TouchableOpacity, Image, InteractionManager, Pressable, ScrollView, Alert} from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';

import MyModal from '../components/modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forceTouchHandlerName } from "react-native-gesture-handler/lib/typescript/handlers/ForceTouchGestureHandler";
import { useAuth } from "../components/loginState";

// Add interfacing
export default function Index() {
  // Use context for login
  const { authState } = useAuth();
  
  const loggedIn = () => {
    return authState?.accessToken != null
  }

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
  const [favoriteIndicator, setFavoriteIndicator] = useState<"red" | "white">("white");

  // Axios Server Calling
  const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/";

  const [hikeData, setHikeData] = useState<Hike[]>([]);
  const [groupData, setGroupData] = useState<Group[]>([]);
  const [reviewData, setReviewData] = useState<Review[]>([]);

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

  //Declared Group Type
  type Group = {
    "created_at": string,
    "created_by": number,
    "group_description": string,
    "group_host": string,
    "group_id": number,
    "group_name": string,
    "start_time": string,
    "trail_id": number,
    "users_joined": Array<string>,   // list of usernames, change to list of user_id's if needed
  };


//Declared Review Type
  type Review = {
    "rating": number,
    "review_date": string,
    "review_id": number,
    "review_text": string,
    "trail_id": number,
    "username": string,
  };


  // Call this function to fetch a particular hikes reviews
  const fetchReviews = async (id: number) => {
    try {
      const revDB = await axios.get(API_URL + "reviews", {
        params:{
          trail_id: id,
        }
      });
      setReviewData(revDB.data);   
    }
    catch (error) {
      console.log(error);
    }    
  }

  // Fetch Hikes from Database
  useEffect(() => {
    const fetchHikeData = async () => {
      try {
        const hikeDB = await axios.get(API_URL + "hikes");
        setHikeData(hikeDB.data);
      }
      catch (error) {
        console.log(error);
      }    
    }
    fetchHikeData();
  }, []);

  // Callback passed to the modal after a successful review submission.
  const handleReviewSubmit = async (ratings: number, reviews: string) => {
    if (!reviews || ratings === 0) {
      Alert.alert('Error', 'Please provide a rating and review text.');
    }

    try {
      // Post to your backend. Replace with your real API endpoint.
      const response = await axios.post(API_URL + "reviews", {
          trail_id: hikeDetails.trail_id, 
          username: authState?.username,  
          rating: ratings,
          review_text: reviews,
        }
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Your review has been submitted!');
        fetchReviews(hikeDetails.trail_id);
      } else {
        Alert.alert('Error', 'There was an issue submitting your review.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while submitting your review.');
    }
    setModalVisible(false);
  };

  const reviewPage = (hikeDetails: Hike) => (
    <View style={styles.container}>
         
         {/* Review Button */}
          <TouchableOpacity style={styles.reviewButton} onPress={() => {
            if (loggedIn() == false){
              Alert.alert('Error', 'Please Sign in or Sign Up');
            }else{
              setModalVisible(true);
            }
          }}>
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
           {reviewData.map((rev, index) => (
             <View key={index} style={styles.reviewItem}>
               <View style={styles.reviewContent}>
                 <Text style={styles.userCame}>{rev.username}</Text>
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
                 <Text style={styles.reviewText}>{rev.review_text}</Text>
               </View>
             </View>
           ))}
         </ScrollView>
       </View>
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
    setReviewView("desc");
    useHikeBottom(true);
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
    setPathView(hikeData[key].routing_points.map((item)=>({latitude:item[0], longitude:item[1]})));
    setHike(hikeData[key]);
    // Check if hike selected is favorited
    if(loggedIn()){
      if(authState && authState!.favoriteHikes!.includes(hikeData[key].trail_name)){
        setFavoriteIndicator("red");
      }
      else{
        setFavoriteIndicator("white");
      }
    }
    // Update Sheet Ref
    try{
      sheetRef.current?.snapToIndex(1);
    }
    catch{
      console.error("Unable to update BottomSheet reference.");
    }
  }

  // Add/Remove favorites
  const updateUserFavorites = (hike_name: string) => {
    console.log(hike_name);
    try{
      if(authState){
        if(authState?.favoriteHikes?.includes(hike_name)){
          let idx = authState!.favoriteHikes!.indexOf(hike_name);
          if (idx > -1) {
            authState!.favoriteHikes!.splice(idx, 1);
          }
          setFavoriteIndicator("white");
        }
        else{
          authState!.favoriteHikes!.push(hike_name);
          setFavoriteIndicator("red");
        }
      }
    } catch(error){
      console.error(error);
    }
    console.log(authState?.favoriteHikes);
  }

  // Selecting between Hikes or Groups on the bottom sheet
  const [hikeBottom, useHikeBottom] = useState(true);

  // Hike View
  const hikeBottomSheet = (hike: Hike, index: number) => (
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
  );

  // Group View
  const groupBottomSheet = (group: Group) => (
    <View key={Number(group.trail_id)} style={styles.contentContainer}>
      <Text>
        Kendrick Ng
      </Text>
    </View>
  );


  // Select Review or Group View
  const [reviewView, setReviewView] = useState("desc");

  const descriptionPage = (hikeDetails: Hike) => (
    <View key={Number(hikeDetails.trail_id)} style={styles.contentContainer}>
      <Text style={styles.bottomButtonText}>
        Description Kendrick Ng: {hikeDetails.description}
      </Text>
      {/* display image from hike object */}
      {/* add any other useful description */}
    </View>
  );


  const groupPage = (hikeDetails: Group) => (
    <View key={Number(hikeDetails.trail_id)} style={styles.contentContainer}>
      <Text style={styles.bottomButtonText}>
        Group Kendrick Ng
      </Text>
    {/* show if available groups are present for this hike */}
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
          <View style = {styles.bottomButtonLayout}> 
              <Pressable 
                style = {[
                  styles.bottomButton, 
                  hikeBottom && styles.bottomButtonPressed
                ]}
                onPressIn = {() => useHikeBottom(true)}
              >
                <Text style={styles.bottomButtonText}>
                  Hikes
                </Text>
              </Pressable>
              <Pressable 
                style = {[
                  styles.bottomButton, 
                  !hikeBottom && styles.bottomButtonPressed
                ]}
                onPressIn = {() => useHikeBottom(false)}
              >
                <Text style={styles.bottomButtonText}>
                  Groups
                </Text>
              </Pressable>
            </View>
          <BottomSheetScrollView>
            {hikeBottom ? 
            hikeData.map( (hike, index) => (hikeBottomSheet(hike, index)) ) : 
            hikeData.map( (hike, index) => (hikeBottomSheet(hike, index)) )}
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
                  top: 0,
                  left: 13,
                }}
              />
          </TouchableOpacity>
          <Text style={styles.bottomSheetHeadline}>
            {hikeDetails.trail_name}
          </Text>
          <Text style={styles.hikeSubHeader}>
            {hikeDetails.difficulty} Hike {"\t"} Distance: {Number(hikeDetails.distance).toFixed(2)}
             mi {"\t"}    Duration: {hikeDetails.duration} min
          </Text>
          {loggedIn() ? 
          <TouchableOpacity
            style={styles.hikeFavorite}
            onPress={() => {updateUserFavorites(hikeDetails.trail_name)}}
            hitSlop={{ 
              top: 50, bottom: 20, left: 50, right: 20
            }}
            >
              <Icon
                name="heart"
                color={favoriteIndicator}
                size = {25}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 13,
                }}
              />
          </TouchableOpacity> : null
          }
          <View style = {styles.bottomHikeButtonLayout}> 
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (reviewView === 'desc') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => setReviewView("desc")}
            >
              <Text style={styles.bottomHikeButtonText}>
                Description
              </Text>
            </Pressable>
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (reviewView === 'rev') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => {
                fetchReviews(hikeDetails.trail_id);
                setReviewView("rev");
              }}
            >
              <Text style={styles.bottomHikeButtonText}>
                Reviews
              </Text>
            </Pressable>
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (reviewView === 'group') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => setReviewView("group")}
            >
              <Text style={styles.bottomHikeButtonText}>
                Groups
              </Text>
            </Pressable>
          </View>
          <BottomSheetScrollView>
            <View style = {styles.groupReviewView}>
                {/* {reviewView ? 
                hikeData.map( (hike, index) => (reviewPage()) ) : 
                hikeData.map( (hike, index) => (groupPage()) )} */}
                {
                  reviewView === 'desc' ? descriptionPage(hikeDetails) :
                  reviewView === 'rev' ? reviewPage(hikeDetails) :
                  reviewView === 'group' ? groupPage(hikeDetails) : null
                }
            </View>
          </BottomSheetScrollView>
        </SafeAreaView>
        )}
      </BottomSheet>

    </GestureHandlerRootView>
  );
}


// Andres Modal
{/* <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.modalButton}>
  <Text style={styles.hikeSubHeader}>
    Leave A Review
  </Text>
</TouchableOpacity>
<MyModal isOpen={modalVisible} onClose={() => setModalVisible(false)} /> */}

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
    marginBottom: 20,
  },
  hikeViewClose: {
    position: 'absolute',
    right: 333,
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 17,
    alignContent: "center",
  },
  hikeFavorite: {
    position: 'absolute',
    left: 333,
    backgroundColor: 'black',
    padding: 10,
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
  bottomButtonLayout: {
    flexDirection: "row",
    gap: 30,
    height: "10%",
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bottomButton: {
    backgroundColor: "#222222",
    borderRadius: 13,
    width: "40%",
    height: "65%",
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "ultralight",
    textAlign: "center",
  },
  bottomButtonPressed: {
    backgroundColor: "#636363",
  },
  // modalButton: {
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  groupBox: {
    flex: 1,
    backgroundColor: "green",
  },
  groupReviewView: {
    flex: 1,
    gap: 50,
  },
  bottomHikeButtonLayout: {
    flexDirection: "row",
    gap: 15,
    height: "10%",
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30
  },
  bottomHikeButtons: {
    backgroundColor: "#222222",
    borderRadius: 13,
    width: "30%",
    height: "60%",
    justifyContent: 'center',
  },
  bottomHikeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "ultralight",
    textAlign: "center",
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
    width: '200%',
  },
  //comments posted
  reviewItem: {
    flexDirection: 'row', // Ensures layout is horizontal
    alignItems: 'center', // Align items properly
    width: '100%', // Expands width close to full screen
    marginVertical: 10,
    backgroundColor: '#f7f7f7',
    padding: 15, // More spacing inside
    borderRadius: 10, // Rounder edges for better look
    shadowColor: '#000', // Optional: Adds a subtle shadow
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow support
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
  userCame: {
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