import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{ 
                tabBarActiveTintColor : "black", 
                tabBarStyle: {backgroundColor: "black"},
            }}
        >
            <Tabs.Screen 
                name="index"
                options = {{
                    title: "Home",
                    headerShown: false,
                    tabBarInactiveBackgroundColor: "black",
                    tabBarActiveBackgroundColor: "black",
                    tabBarActiveTintColor: "white",
                    tabBarIcon: ( { color } ) => <FontAwesome size={28} name="home" color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options = {{
                    title: "Profile",
                    headerShown: false,
                    tabBarInactiveBackgroundColor: "black",
                    tabBarActiveBackgroundColor: "black",
                    tabBarActiveTintColor: "white",
                    tabBarIcon: ( { color } ) => <FontAwesome size={28} name="user" color={color} />
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;