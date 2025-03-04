import { Stack } from "expo-router";
import LoginProvider from "./components/loginState";

const RootLayout = () => {
  return(
    <LoginProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false
            }} 
          />
      </Stack>
    </LoginProvider>
  );
};

export default RootLayout;