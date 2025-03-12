import { Text, View, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView, Modal, Alert} from "react-native";
import React, { useRef, useMemo, useState, useEffect } from 'react';
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Polyline} from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import { format, add, sub, endOfDay, parse, isPast } from 'date-fns';
import axios from 'axios';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from '@expo/vector-icons/FontAwesome';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import MyModal from '../components/reviewModal';
import { useAuth } from "../components/loginState";
import { GroupCreation } from "../components/groupCreation";
import { Hike, Group, Review } from '../components/interface';

// Axios Server Calling
const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/";


// Main
export default function Index() {
  
  // Group Select Handling
  const [groupDetails, setGroup] = useState<any>("Error");

  // Use context for login
  const { authState, updateFavorites, updateGroups } = useAuth();

  // Loading for group page
  const [loading, setLoading] = useState(false);

  // Acquire initial date range
  const [start, updateStart] = useState<Date>(new Date());
  const [end, updateEnd] = useState<Date>(endOfDay(add(start, {days:6})));

  // Add modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // BottomSheet properties
  const snapPoints = useMemo(() => ["8%", "24.5%", "50%", "90%"], []);
  const sheetRef = useRef<BottomSheet>(null);

  // Markers view
  const [markersShown, setMarkerState] = useState<boolean>(true);

  // Init region on map if not declared
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Route view w/ selected hike
  const [displayedPath, setPathView] = useState<LatLng[]>([]);
  const [hikeDetails, setHike] = useState<any>("ERROR");
  const [pathViewSelected, pathViewSelect] = useState<boolean>(false);
  const [favoriteIndicator, setFavoriteIndicator] = useState<"red" | "white">("white");

  // State Variables to grab database data
  const [hikeData, setHikeData] = useState<Hike[]>([]);
  const [groupData, setGroupData] = useState<Group[]>([]);
  const [reviewData, setReviewData] = useState<Review[]>([]);

   // Select between views once a hike is selected; initialized to description
   const [bottomView, setBottomView] = useState("desc");

   // Map properties initialization
  const mapRef = useRef<MapView | null>(null);

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

  //Get location permissions and set region
  useEffect(() => {
    const getCurrentLocation = async() => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});

      setInitialRegion ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });

    }
    getCurrentLocation();
  }, []);

  // Callback passed to the modal after a successful review submission.
  const handleReviewSubmit = async (ratings: number, reviews: string) => {
    if (!reviews || ratings === 0) {
      Alert.alert('Cannot Submit', 'Please provide a rating and review text.');
    }

    try {
      // Post to backend.
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
      Alert.alert('Error', 'An error occurred while submitting your review.');
    }
    setModalVisible(false);
  };

  // Helper function to check if loggin in
  const loggedIn = () => {
    return authState?.accessToken != null
  }

  // Review Page
  const reviewPage = () => (
    // Container
    <View style={styles.container}>
         
         {/* Review Button */}
          <TouchableOpacity style={styles.reviewButton} onPress={() => {
            if (loggedIn() == false){
              Alert.alert('Cannot Leave A Review', 'Please Log in or Sign Up');
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
    setBottomView("desc");

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
      Alert.alert("Error", "Unable to update BottomSheet reference.");
    }

    // Get group based on hike selected
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
      Alert.alert("Error", String(error));
    }
  }

  // Function to display pressables nodes for each hike in the database; appears on home screen
  const hikeBottomSheet = (hike: Hike, index: number) => (
      <View key={Number(hike.trail_id)} style={styles.contentContainer}>
      <TouchableOpacity
        onPress={() => (
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

  // Helper function to convert a string into a date object for formatting 
  const convertToDate = (dateString: string) => {
    return parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
  };

  // Function to display selectable group nodes
  const groupBottomSheet = (group: Group, index: number) => (
    <View key={Number(group.group_id)} style={styles.groupSelectContainer}>
      <TouchableOpacity
        style={styles.groupSelect}
        activeOpacity={0.8}
        onPress = {() => {
          setBottomView("join");
          setGroup(groupData[index]);
        }}
      >
        <Text style={styles.groupTitle}>
          {group.group_name}
        </Text>
        <Text style={styles.groupSubText}>
          {group.group_description} {"\n"}
          {format(convertToDate(group.start_time), "LLLL d, h:mm a")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Pop up to allow for joining selected group
  const joinGroup = () => (
    <View style={styles.contentContainer}>
      <Modal
        transparent = {true}
        animationType = "fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.joinGroupModal}> 
           <Text style={styles.joinGroupHeader}>
              Join Group  
            </Text>
            <Text style={styles.joinSubText}>
              <Text style={{ fontWeight: 'bold' }}>Name:</Text> {groupDetails.group_name} {"\n"}
              <Text style={{ fontWeight: 'bold' }}>Description:</Text> {groupDetails.group_description} {"\n"}
              <Text style={{ fontWeight: 'bold' }}>Start Time: </Text>{format(convertToDate(groupDetails.start_time), "LLLL d; h:mm a")} 
            </Text>
            <TouchableOpacity
              style={styles.closeGroupModal}
              onPress={() => setBottomView("group")}
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
          <TouchableOpacity 
            style={styles.join}
            onPress={() => {
              if(loggedIn()){
                groupJoin();
              }
              else{
                Alert.alert("Cannot Join Group", "Please Log in or Sign Up");
              }
            }}
            >
            <Text style={styles.joinText}>
              Join
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Axios method to join group based on selected group and user id
  const groupJoin = async () => {
    try {
      const join = await axios.post(API_URL + "join/group", {
        "group_id": groupDetails.group_id,
        "user_id": authState!.userId!, 
      })
      if (join.data.message == "already joined the group") {
        Alert.alert("Cannot Join Group", "Already Joined");
      }
      else{
        Alert.alert("Group Joined Successfully", groupDetails.name);
        await updateGroups!()
      }
      setBottomView("group");
    }
    catch (error) {
      console.error(error);
    }    
  };

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

  // Function to fetch a particular hikes reviews
  const fetchReviews = async (id: number) => {
    try {
      const revDB = await axios.get(API_URL + "reviews", {params: {trail_id: id}}).then(
        (response) => {
          setReviewData(response.data);
        }
      );
    }
    catch (error) {
      console.error(error);
    }
  };

  // Increment date range by a week
  const incrementDate = (id: string) => {
    // Temp Variables to call, deals with useState() batching
    const tempStart = add(start, {days:7});
    const tempEnd = endOfDay(add(end, {days:7}));

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);
  };

  // Decrement date range by a week
  const decrementDate = (id: string) => {
    // Temp Variables to call, deals with useState() batching
    const tempStart = sub(start, {days:7});
    const tempEnd = endOfDay(sub(end, {days:7}));

    // Check if going in the past
    if (isPast(tempEnd)) {
      Alert.alert("Unavailable", "Cannot Check Past Groups")
      return
    }

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);
  };

  // Reset date range to originial 
  const resetDate = (id: string) => {
    // Temp Variables to call, deals with useState() batching
    const tempStart = new Date();
    const tempEnd = endOfDay(add(tempStart, {days:6}));

    // Update start and end parameters
    updateStart(tempStart);
    updateEnd(tempEnd);

    // API call
    fetchGroups(id, tempStart, tempEnd);
  };

  // Function to fetch a particular hikes reviews
  const fetchGroups = async (id: string, startDate: Date, endDate: Date) => {
    // Enable loading modal
    setLoading(true);
    try {
      const groupDB = await axios.get(API_URL + "groups", {
        params: {
          start_date_range: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
          end_date_range: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
          trail_id: id,
        }
      }).then(
        (response) => {
          setGroupData(response.data);
          // Delay for processing
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      );
    }
    catch (error) {
      console.error(error);
      setLoading(false);
    }    
  };

  // Description page view on hike select
  const descriptionPage = () => (
    <ScrollView>
       <Image 
          source = {{uri: hikeDetails.trail_image}}
          style={styles.descImage}
        />
      <Text style={styles.descText}>
        {hikeDetails.description} {"\n"}
      </Text>
      {/* display image from hike object */}
    </ScrollView>
  );

  // Group page view, handles date ranges and uses groupBottomSheet to map groups
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
        {
          loading ? loadingModal() :
          (groupData.length) > 0 ? groupData.map((group, index) => (groupBottomSheet(group, index)) ) : (
            <Text style={styles.emptyGroup}>
              No Available Groups in Selected Range
            </Text>
          )
        }
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
        onPress={() => {
          if(loggedIn()){
            setBottomView("create");
          }
          else{
            Alert.alert("Cannot Create Group", "Please Log in or Sign Up");
          }
        }}
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

  // Return statement; sets the view for the app
  return (

    <GestureHandlerRootView>
      {/* // Show map */}
      <MapView 
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={initialRegion}
        ref = {mapRef}
        showsUserLocation
      >
        {/* Determine if markers should be shown and load appropriate view */}
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

      {/* // Button to reset view on the map to user location */}
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

      {/* // Start of the bottomsheet; same component for home and hike select */}
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
        {/* // Check if path view and load appropraite view */}
        { !pathViewSelected ? (
        <SafeAreaView style={styles.contentContainer}>
          <Text style={styles.bottomSheetHeadline}>
            Near You
          </Text>
          <BottomSheetScrollView>
            {/* Map database hike data using hikeBottomSheet function to display hike nodes */}
            {hikeData.map( (hike, index) => (hikeBottomSheet(hike, index)) ) } 
          </BottomSheetScrollView>
        </SafeAreaView>) : 
        (
        <SafeAreaView style={styles.contentContainer}>
          {/* Closing out of the hike will reset locaiton */}
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
          {/* Hike view header */}
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
          {/* Buttons set hike view bottom sheet (desc, review, group) */}
          <View style = {styles.bottomHikeButtonLayout}> 
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (bottomView === 'desc') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => setBottomView("desc")}
            >
              <Text style={styles.bottomHikeButtonText}>
                Description
              </Text>
            </Pressable>
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (bottomView === 'rev') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => {
                fetchReviews(hikeDetails.trail_id);
                setBottomView("rev");
              }}
            >
              <Text style={styles.bottomHikeButtonText}>
                Reviews
              </Text>
            </Pressable>
            <Pressable 
              style = {[
                styles.bottomHikeButtons, 
                (bottomView === 'group') && styles.bottomButtonPressed
              ]}
              onPressIn = {() => setBottomView("group")}
            >
              <Text style={styles.bottomHikeButtonText}>
                Groups
              </Text>
            </Pressable>
          </View>
          {/* Load view based on which button is selected */}
          {
            bottomView === 'desc' ? descriptionPage() :
            bottomView === 'rev' ? reviewPage() :
            bottomView === 'group' ? groupPage(hikeDetails.trail_id) : 
            bottomView === 'create' ? 
                <GroupCreation
                trail={hikeDetails.trail_id}
                viewReset={(view:string) => setBottomView(view)}
                dateReset={(id: string) => resetDate(id)}
                dateConverter={convertToDate}
              /> : 
            bottomView === 'join' ? joinGroup() :
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
    height: 170,
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
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'white', 
    width: "50%",
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
  },
  reviewList: {
    marginTop: 20,
    width: 350,
  },
  reviewItem: {
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 15, 
    borderRadius: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
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
    color: "black",
  },
  starDisplay: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 12,
    color: "black",
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
    padding: 20,
    backgroundColor: "lightblue",
    marginBottom: 10,
    borderRadius: 25,
    width: 320,
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
    textAlign: "center",
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
    textAlign: "center",
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
  join: {
    backgroundColor: "#023020",
    borderRadius: 20,
    position: "absolute",
    bottom: 10,
    width: "60%",
    height: "30%",
    justifyContent: 'center',
  },
  joinText: {
    color: "white",
    fontSize: 20,
    fontWeight: "ultralight",
    textAlign: "center",
  },
  joinSubText: {
    color: "black",
    fontSize: 15,
    textAlign: "center",
  },
  joinGroupModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    height: '25%', 
    alignItems: 'center',
  },
  joinGroupHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyGroup: {
    color: "white",
    fontSize: 20,
    alignSelf: "center",
    top: 120,
  },
  descImage: {
    height: 220,
    width: 370,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'center',
  },
  descText: {
    color: "white",
    fontSize: 17,
    fontWeight: "ultralight",
    padding: 15,
    textAlign: "center"
  },
});
