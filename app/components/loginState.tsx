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
    onLogout?: () => Promise<any>;
}

// Login State
interface LoginState {
    accessToken?: any,
    refreshToken?: any,
    username?: string,
    email?: string,
    password?: string
}

// const [loginState, setLoginState] = useState<SessionProps>({});

// Create context for login
export const LoginContext = createContext<SessionProps>({});

export const useAuth = () => {
    return useContext(LoginContext);
}

const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loginState, setLoginState] = useState<LoginState>({});

    console.log("login state in provider: " + loginState);

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

            setLoginState({
                "accessToken": loginResponse.data.tokens.access,
                "refreshToken": loginResponse.data.tokens.refresh,
                "username": loginResponse.data.username,
                "email": email
            });
            
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginResponse.data.tokens.access;
            return loginResponse
        } catch(e) {
            return { error: true, msg: (e as any).response.data.msg };
        }
    }

    const logout = async (email: string, password: string) => {
        try{
            axios.defaults.headers.common['Authorization'] = "";
            setLoginState({});
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