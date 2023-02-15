import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Chats from "../screens/Chats";
import tab from "../navigation/tab";
import Settings from "../screens/Settings";
import Search from "../screens/Search";

const BottomTabs: FC = () => {
  return (
    <tab.Navigator
      id="tab"
      initialRouteName="Chats"
      screenOptions={(props) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
        },
        // tabBarLabelStyle: {
        //   margin: 0,
        //   padding: 0,
        //   fontSize: 14
        // }
      })}
    >
      <tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              <Ionicons name="search" size={32} color={focused ? "#DA832D" : "black"} />
              <Text style={{ color: focused ? "#DA832D" : "black" }}>Search</Text>
            </View>
          )
        }}
      />
      <tab.Screen
        name="Chats"
        component={Chats}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              <Ionicons name="md-chatbubbles" size={32} color={focused ? "#DA832D" : "black"} />
              <Text style={{ color: focused ? "#DA832D" : "black" }}>Chats</Text>
            </View>
          )
        }}
      />
      <tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tab}>
              <MaterialIcons name="settings" size={32} color={focused ? "#DA832D" : "black"} />
              <Text style={{ color: focused ? "#DA832D" : "black" }}>Settings</Text>
            </View>
          )
        }}
      />
    </tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tab: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 6
  }
})

export default BottomTabs;