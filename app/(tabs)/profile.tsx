import { Text, View, StyleSheet, Button, ImageBackground, TouchableOpacity, Modal, Image } from "react-native";
import { GestureDetector, GestureHandlerRootView, RectButton, TextInput } from 'react-native-gesture-handler';
import { createContext, useContext, useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import axios from "axios";

//import LoginContext from '../loginState';
//import { LoginContext } from '../loginState';
//import MyProvider from "../loginState";
//import useAuth from '../loginState';
import { useAuth, LoginContext } from "../components/loginState";

import { SignUpComponent } from "../components/signup";

// TODO: Make a global interface file for all interfaces
// Guest session
interface SessionProps {
  accessToken?: any,
  refreshToken?: any,
  username?: string,
  email?: string,
  password?: string
}

// API URL
const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/";

export default function Profile() {

  // Use context for login
  const { authState, onLogin, onRegister, onLogout } = useAuth();

  // Login function
  const login = async (email: string, password: string) => {
    const result = await onLogin!(email, password);
    if (result && result.error) {
      console.error(result.msg);
    }
    return result;
  }

  // Sign up function
  const signup = async (username: string, email: string, password: string) => {
    const result = await onRegister!(username, email, password);
    if (result && result.error) {
      console.error(result.msg);
    } else {
      setSignUpState(false);
      onSubmit({"email": email, "password": password});
    }
    return result;
  }

  // Bandaid
  const [loggedIn, loginSuccessful] = useState<boolean>(false);

  // Login function
  /*async function login(emailInput:string, passwordInput:string): Promise<any> {
    try{
      const loginResponse = await axios.post(API_URL + "auth/login", {
        username: "",
        email: emailInput,
        password: passwordInput
      });
      return loginResponse
    }
    catch(error){
      console.error(error);
      return error
    }
  }*/

  // Logout function
  const logout = () => {
    loginSuccessful(false);
    onLogout!();
  }

  // Modal state
  const [loadingState, setLoadingState] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("Loading...");

  const [signUpState, setSignUpState] = useState<boolean>(false);

  //console.log("Login State: ");
  // console.log(loginState);

  // Login form
  const { control, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    // console.log('Submitted Data:', data); 
    clearErrors();
    setLoadingState(true);
    login(data.email, data.password).then(
      response => {
        // Login Successful
        if(response.status == 200){
          loginSuccessful(true);
        }
        else{
          console.log("login failed");
          setError("password", {type: 'manual'});
        }
        setLoadingState(false);
      }
    )
    // Reset login form
    reset();
  };

  // Log Errors
  const onInvalid = (err: any) => {
    console.error(err);
  }

  return (
    <GestureHandlerRootView>
      { !loggedIn ? 
      <ImageBackground 
        style ={styles.container}
        source = {require('../../assets/images/hikeimage2.avif')}
        resizeMode = 'cover'
      >
        <Text style={styles.title}> 
          Log In 
        </Text>
        <Modal
          visible={loadingState} 
          transparent 
          animationType="fade"
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text> {modalText} </Text>
            </View>
          </View>
        </Modal>
        <Modal
          visible={signUpState}
          transparent={false}
          animationType={"slide"}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <SignUpComponent
                signUp={(username: string, email: string, password: string) => 
                signup(username, email, password)}
                close={() => setSignUpState(false)}
              />
            </View>
          </View>
        </Modal>
        <View style={styles.form}>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input} 
                placeholder="Email" 
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
                placeholder="Password" 
                secureTextEntry={true} 
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
            {(errors.email) && <Text style={styles.errorText}> {"Please enter your email and password"} </Text>}
            {(errors.password) && <Text style={styles.errorText}> {"Invalid Credentials"} </Text>}
        </View>
        <View style = {styles.buttonlayout}> 
          <TouchableOpacity 
          style={styles.button}
          onPress={handleSubmit(onSubmit, onInvalid)}>
            <Text style={styles.buttontext}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={styles.button} 
          onPress={() => setSignUpState(true)}>
            <Text style={styles.buttontext}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      : 
      <ImageBackground 
        style ={styles.container}
        source = {require('../../assets/images/hikeimage2.avif')}
        resizeMode = 'cover'
      >
        <View style={styles.profileContainer}>
          <Image source={require('../../assets/images/default-profile-pic.jpg')} style={styles.profilePicture} />
          <Text style={styles.name}>{authState?.username ? authState?.username : null}</Text>
          <Text style={styles.email}>{authState?.email ? authState?.email : null}</Text>
          <TouchableOpacity 
          style={styles.logout}
          onPress={logout}>
            <Text style={styles.buttontext}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      }
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
  },
  errorText: {
    color: 'red',
    marginBottom: 2,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    minWidth: 300,
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 50,
    marginTop: 75,
    marginBottom: 20,
    backgroundColor: 'white'
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
  },
  logout: {
    position: 'absolute',
    backgroundColor: "#023020",
    bottom: 10,
    left: 0,
    right: 0,
    padding: 20,
    marginRight: 10,
    marginLeft: 10,
  }
});

