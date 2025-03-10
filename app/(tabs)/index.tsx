import { Text, View, StyleSheet, TouchableOpacity, Image, InteractionManager, Pressable, ScrollView, Modal, Touchable, Button} from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, {Path, Circle, Ellipse} from 'react-native-svg'
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureDetector, GestureHandlerRootView, RectButton, TextInput } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Icon from '@expo/vector-icons/FontAwesome';

import { Review } from '../modal';
import MyModal from '../modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forceTouchHandlerName } from "react-native-gesture-handler/lib/typescript/handlers/ForceTouchGestureHandler";
import { format, add, sub, endOfDay, parse } from 'date-fns';
import reanimatedJS from "react-native-reanimated/lib/typescript/js-reanimated";
import { registerWebModule } from "expo";
import RNDateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from "../components/loginState";


// Add interfacing

export default function Index() {
  // Use context for login
  const { authState, updateFavorites } = useAuth();
  
  const loggedIn = () => {
    return authState?.accessToken != null
  }

  // Loading for group page
  const [loading, setLoading] = useState(false);

  // Acquire initial date range
  const [start, updateStart] = useState<Date>(new Date());
  const [end, updateEnd] = useState<Date>(endOfDay(add(start, {days:6})));

  // Add modal visibility state
  const [modalVisible, setModalVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Callback passed to the modal after a successful review submission.
  const handleReviewSubmit = (newReview: Review) => {
    setReviews(prevReviews => [...prevReviews, newReview]);
    setModalVisible(false);
  };

  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "24.5%", "50%", "90%"], []);
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

  // Fetch Hikes from Database
  useEffect(() => {
    const fetchHikeData = async () => {
      try {
        const hikeDB = await axios.get(API_URL + "hikes");
        // const groupDB = await axios.get(API_URL + "groups");
        // setGroupData(groupDB.data);
        setHikeData(hikeDB.data);
      }
      catch (error) {
        console.error(error);
      }    
    }
    fetchHikeData();
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
    "trail_image": string,
    "trail_name": string,
  };

  //Declared Group Type
  type Group = {
    "created_at": string,
    "created_by": string,     //number or string?
    "group_description": string,
    "group_host": string,
    "group_id": string,       //number or string?
    "group_name": string,
    "start_time": string,
    "total_users_joined": number;
    "trail_id": string,
    "trail_name": string,
    "users_joined": Array<string>,   // list of usernames, change to list of user_id's if needed
  };

  //Declared Review Type
  // type Review = {
  //   "review_id": number,
  //   "trail_id": number,
  //   "username": string,
  //   "rating": number,
  //   "review_text": string,
  //   "review_date": string,
  // };

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

    // Reset Dates
    const tempStart = new Date();
    const tempEnd = endOfDay(add(tempStart, {days:6}));
    updateStart(tempStart);
    updateEnd(tempEnd);
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

    fetchGroups(hikeData[key].trail_id, start, end);
  }

  // Add/Remove favorites
  const updateUserFavorites = (hike_name: string) => {
    try{
      if(authState){
        if(authState?.favoriteHikes?.includes(hike_name)){
          let oldList = authState.favoriteHikes.slice();
          let idx = oldList.indexOf(hike_name);
          if (idx > -1) {
            oldList.splice(idx, 1);
            updateFavorites!(oldList);
          }
          setFavoriteIndicator("white");
        }
        else{
          let oldList = authState!.favoriteHikes!.slice();
          oldList.push(hike_name);
          updateFavorites!(oldList);
          setFavoriteIndicator("red");
        }
      }
    } catch(error){
      console.error(error);
    }
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
          source = {{uri: hike.trail_image}}
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

  const convertToDate = (dateString: string) => {
    // Convert a string into a date object for formatting 
    return parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
  };

  // Group Buttons
  const groupBottomSheet = (group: Group) => (
    <View key={Number(group.group_id)} style={styles.groupSelectContainer}>
      <TouchableOpacity
        style={styles.groupSelect}
        activeOpacity={0.8}
      >
        <Text style={styles.groupTitle}>
          {group.group_name}
        </Text>
        <Text style={styles.groupSubText}>
          {group.group_description} {"\n"}
          {format(convertToDate(group.start_time), "LLLL d, h a")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Modal to display "loading..."
  const loadingModal = () => (
    <View style={styles.contentContainer}>
      <Modal
        transparent = {true}
        animationType = "fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loading}> 
           <Text>
              Loading ...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )

  // Call this function to fetch a particular hikes reviews
  const fetchReviews = async (id: string) => {
    try {
      const revDB = await axios.get(API_URL + "reviews", {params: {trail_id: id}});
      // const revDB = await axios.get(API_URL + "reviews?trail_id=" + trail_id);
      setReviewData(revDB.data);
    }
    catch (error) {
      console.error(error);
    }    
  };

  const incrementDate = (id: string) => {
    // Enable loading modal
    setLoading(true);

    // Temp Variables to call, deals with useState() batching
    const tempStart = add(start, {days:7});
    const tempEnd = endOfDay(add(end, {days:7}));

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);

    //Wait 1 second (1000 ms) before removing loading modal
    setTimeout(() => {
      setLoading(false);
    }, 1000)
  };

  const decrementDate = (id: string) => {
    // Enable loading modal
    setLoading(true);

    // Temp Variables to call, deals with useState() batching
    const tempStart = sub(start, {days:7});
    const tempEnd = endOfDay(sub(end, {days:7}));

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);

    //Wait 1 second (1000 ms) before removing loading modal
    setTimeout(() => {
      setLoading(false);
    }, 1000)
  };

  const resetDate = (id: string) => {
    // Enable loading modal
    setLoading(true);

    // Temp Variables to call, deals with useState() batching
    const tempStart = new Date();
    const tempEnd = endOfDay(add(tempStart, {days:6}));

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);

    //Wait 1 second (1000 ms) before removing loading modal
    setTimeout(() => {
      setLoading(false);
    }, 1000)
  };
  
  const { control, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)

  const createGroup = () => (
    <View style={styles.contentContainer}>
      <Modal
        transparent = {true}
        animationType = "fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.createGroupModal}> 
           <Text style={styles.createGroupHeader}>
              New Group
            </Text>
            <View style={styles.form}>
              <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input} 
                  placeholder="Group Name" 
                  placeholderTextColor={'gray'}
                  onChangeText = {onChange}
                  value={value}
                  onBlur={() => {}}
                />
              )}
              name="email"
              rules = {
                {
                  required: true
                }
              }
              />
              <Controller
                control={control}
                render={({field: {onChange, value}}) => (
                  <TextInput 
                    style={styles.input} 
                    placeholder="Group Description" 
                    placeholderTextColor={'gray'}
                    onChangeText = {onChange}
                    value={value}
                    onBlur={() => {}}
                  />
                )}
                name="password"
                rules = {
                  {
                    required: true
                  }
                }
              /> 
                {(errors.email) && <Text> {"Please enter your email and password"} </Text>}
                {(errors.password) && <Text> {"Invalid Credentials"} </Text>}
            </View>
            <TouchableOpacity
              style={styles.closeGroupModal}
              onPress={() => setReviewView("group")}
            >
            <Icon
              name="close"
              color={"red"}
              size = {35}
              style={{
                position: "absolute",
                top: 6,
                left: 12,
              }}
            />
          </TouchableOpacity>
          <RNDateTimePicker
            style = {styles.datePicker}
            testID="dateTimePicker"
            value={date}
            minimumDate={new Date()}
            mode="datetime"
            display="default"
            textColor= "black"
            // onChange={onChange}
          />
          </View>
        </View>
      </Modal>
    </View>
  );

  // Call this function to fetch a particular hikes reviews
  const fetchGroups = async (id: string, startDate: Date, endDate: Date) => {
    try {
      const groupDB = await axios.get(API_URL + "groups", {
        params: {
          start_date_range: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
          end_date_range: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
          trail_id: id,
        }
      });
      setGroupData(groupDB.data);
    }
    catch (error) {
      console.log(error);
    }    
  };

  // Select Review or Group View
  const [reviewView, setReviewView] = useState("desc");

  const descriptionPage = (hikeDetails: Hike) => (
    <ScrollView>
      <Text style={styles.bottomButtonText}>
        Description: {hikeDetails.description} {"\n"}
      </Text>
      {/* display image from hike object */}
      <Image 
          source = {{uri: hikeDetails.trail_image}}
          style={styles.hikeBottomImage}
        />
      {/* add any other useful description */}
    </ScrollView>
  );

  const reviewPage = (hikeDetails: Hike) => (
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
    // <View key={Number(hikeDetails.trail_id)} style={styles.contentContainer}>
    //   <Text style={styles.bottomButtonText}>
    //     Review Kendrick Ng
    //   </Text>
    // {/* show each review similar to hikeBottomSheet function */}
    // </View>
  );

  const groupPage = (id: string) => (
    <View style={styles.rangeContainer}>
      <View style={styles.rangeTitle}>
        <TouchableOpacity
            style={styles.dateLeftRight}
            onPress={() => decrementDate(id)}
            >
            <Icon
              name="arrow-left"
              color={"white"}
              size = {25}
              style={{
                position: "absolute",
                top: 10,
                left: 13,
              }}
            />
          </TouchableOpacity>
          <Text style={styles.rangeText}>
            {format(start, 'LLL. do')} - {format(end, 'LLL. do')}
          </Text>
          <TouchableOpacity
            style={styles.dateLeftRight}
            onPress={() => incrementDate(id)}
            >
            <Icon
              name="arrow-right"
              color={"white"}
              size = {25}
              style={{
                position: "absolute",
                top: 10,
                left: 13,
              }}
            />
          </TouchableOpacity>
      </View>
      <ScrollView style={styles.groupBottom}>
        
        { loading ? loadingModal() : groupData.map((group) => (groupBottomSheet(group)) )}
        
      </ScrollView>
      <TouchableOpacity
        style={styles.resetDate}
        onPress={() => resetDate(id)}
        >
        <Icon
            name="refresh"
            color={"white"}
            size = {30}
            style={{
              position: "absolute",
              top: 13,
              left: 22,
            }}
          />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createGroup}
        onPress={() => setReviewView("create")}
        >
        <Icon
            name="plus"
            color={"white"}
            size = {30}
            style={{
              position: "absolute",
              top: 13,
              left: 23,
            }}
          />
      </TouchableOpacity>
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
          {
            reviewView === 'desc' ? descriptionPage(hikeDetails) :
            reviewView === 'rev' ? reviewPage(hikeDetails) :
            reviewView === 'group' ? groupPage(hikeDetails.trail_id) : 
            reviewView === 'create' ? createGroup() : 
            null
          }
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
    height: 160,
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
  groupBottom: {
    flex: 1,
    backgroundColor: "black",
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
    borderColor: 'white', 

  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
  },
  reviewList: {
    marginTop: 20,
  },
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
  dateLeftRight: {
    position: 'relative',
    backgroundColor: 'black',
    padding: 25,
    borderRadius: 17,
    alignContent: "center",
  },
  rangeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "ultralight",
    textAlign: "center",
  },
  rangeContainer: {
    backgroundColor: "black",
    flex: 1,
    width: "100%",
  },
  rangeTitle: {
    backgroundColor: "black",
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 25,
  },
  groupSelect: {
    padding: 6,
    margin: 6,
    backgroundColor: "lightblue",
    marginBottom: 15,
    borderRadius: 25,
    width: 320,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  loading: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '60%',
    height: '8%', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRangeTitle: {
    backgroundColor: "black",
    flexDirection: "row",
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    gap: 60,
  },
  bottomRangeButtons: {
    position: 'relative',
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 10,
    alignContent: "center",
  },
  bottomGroupButtonText: {
    color: "white",
    fontSize: 20,
    height: 25,
    fontWeight: "ultralight",
    textAlign: "center",
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Black",
    marginBottom: 2.5,
  },
  groupSubText: {
    textAlign: 'center'
  },
  groupSelectContainer: {
    backgroundColor: "black",
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  resetDate: {
    position: 'absolute',
    top: 430,
    bottom: 15,
    left: 10,
    right: 315,
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 20,
    alignContent: "center",
    justifyContent: "center",
  },
  createGroup: {
    position: 'absolute',
    top: 430,
    bottom: 15,
    left: 315,
    right: 10,
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 20,
    alignContent: "center",
    justifyContent: "center",
  },
  createGroupModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    height: '40%', 
    // justifyContent: 'center',
    alignItems: 'center',
  },
  closeGroupModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 17,
    alignContent: "center",
  },
  createGroupHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'white'
  },
  form: {
    gap: 10,
    width: '65%',
    height: "15%",
  },
  datePicker: {
    right: 5,
    top: 100,
    borderRadius: 17,
  },
});
