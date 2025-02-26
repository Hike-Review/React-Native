import { createContext, useState } from "react";
//import * as interfaces from "../assets/interfaces";

// Guest session
interface SessionProps {
    accessToken?: any,
    refreshToken?: any,
    username?: string,
    email?: string,
    password?: string
}

// const [loginState, setLoginState] = useState<SessionProps>({});

// Create context for login
export const LoginContext = createContext({
    loginState: {},
    setLoginState: (newLoginState: SessionProps) => {
        console.log("New Login State: " + newLoginState);
    }
});

const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loginState, setLoginState] = useState({});

    console.log("login state in provider: " + loginState);

    const contextValue: any = {
      loginState,
      setLoginState,
    };

    return (
      <LoginContext.Provider value={contextValue}>
        {children}
      </LoginContext.Provider>
    );
  };

export default MyProvider;