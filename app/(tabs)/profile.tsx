import { Text, View, StyleSheet, Button, ImageBackground, TouchableOpacity } from "react-native";
import { GestureDetector, GestureHandlerRootView, RectButton, TextInput } from 'react-native-gesture-handler';

export default function Profile() {
  return (
    <GestureHandlerRootView>
      <ImageBackground 
        style ={styles.container}
        source = {require('../../assets/images/hikeimage2.avif')}
        resizeMode = 'cover'
      >
        <Text style={styles.title}> 
          Log In 
        </Text>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={'gray'} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} placeholderTextColor={'gray'}/>
        </View>
        <View style = {styles.buttonlayout}> 
          <TouchableOpacity style={styles.button} >
            <Text style={styles.buttontext}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} >
            <Text style={styles.buttontext}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    color: "white",
    fontSize: 40,
    height: "10%",
    fontWeight: "bold",
  },
  form: {
    gap: 10,
    width: '65%',
    height: "15%",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'white'
  },
  buttonlayout: {
    flexDirection: "row",
    gap: 10,
    height: "10%",
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
  },
  button: {
    backgroundColor: "#023020",
    borderRadius: 20,
    width: "120%",
    height: "65%",
    justifyContent: 'center',
  },
  buttontext: {
    color: "white",
    fontSize: 20,
    fontWeight: "ultralight",
    textAlign: "center",
    
  }
});

