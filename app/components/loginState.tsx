import axios from "axios";
import { createContext, useContext, useState } from "react";
//import * as interfaces from "../assets/interfaces";

// API URL
const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/"

// Guest session
interface SessionProps {
    authState?: LoginState,
    onRegister?: (username: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: (hike_list: Array<string>) => Promise<any>;
};

// Group State
interface GroupAttendance {
    group_name: string,
    start_time: string,
    trail_name: string
};

// Login State
interface LoginState {
    accessToken?: any,
    refreshToken?: any,
    username?: string,
    email?: string,
    password?: string,
    favoriteHikes?: Array<string>,
    scheduledHikes?: Array<GroupAttendance>
}

// const [loginState, setLoginState] = useState<SessionProps>({});

// Create context for login
export const LoginContext = createContext<SessionProps>({});

export const useAuth = () => {
    return useContext(LoginContext);
}

const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loginState, setLoginState] = useState<LoginState>({});

    const register = async (username: string, email: string, password: string) => {
        try{
            // Register
            return await axios.post(API_URL + "auth/register", {
                "username": username, 
                "email": email,
                "password": password
            });
        } catch(e) {
            return { error: true, msg: (e as any).response.data.msg };
        }
    }

    const login = async (email: string, password: string) => {
        try{
            // Login
            const loginResponse = await axios.post(API_URL + "auth/login", {
              "username": "",
              "email": email,
              "password": password
            });

            if(loginResponse.status == 200){
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginResponse.data.tokens.access;
                axios.get(API_URL + "auth/identity").then(
                    (response) => {
                        console.log(response);
                        if(response.status == 200){
                            setLoginState({
                                "accessToken": loginResponse.data.tokens.access,
                                "refreshToken": loginResponse.data.tokens.refresh,
                                "username": response.data.user_details.username,
                                "email": email,
                                "favoriteHikes": response.data.user_details.favorite_hikes
                            });
                        }
                    }
                );  
            }
            return loginResponse
        } catch(e) {
            return { error: true, msg: (e as any).response.data.msg };
        }
    }

    const logout = async (hikes_list: Array<string>) => {
        try{
            // Push favorite hikes to DB
            await axios.post(API_URL + "favorite/hikes", {
                trail_names: hikes_list
            }).then(
                () => {
                    axios.defaults.headers.common['Authorization'] = "";
                    setLoginState({});
                }
            );
        } catch(e) {
            return { error: true, msg: (e as any).response.data.msg };
        }
    }

    const contextValue: any = {
      onRegister: register,
      onLogin: login,
      onLogout: logout,
      authState: loginState
    };

    console.log("Login Context: ");
    console.log(contextValue);

    return (
      <LoginContext.Provider value={contextValue}>
        {children}
      </LoginContext.Provider>
    );
  };

export default LoginProvider;