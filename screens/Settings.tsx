import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { FC, useLayoutEffect, useState } from "react";
import { ActivityIndicator, GestureResponderEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import { RootTabParamList } from "../navigation/param";
import { StackNavigationProp } from "../navigation/stack";
import useAuthStore from "../stores/auth";

type ScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "Settings">,
  StackNavigationProp
>;

const Settings: FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleLogoutPress = async (e: GestureResponderEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await logout();
    } catch(e) {
      console.log(e);
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )
    });
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          // <Button disabled={loading} onPress={handleLogoutPress} title="Logout" />
          <TouchableOpacity onPress={handleLogoutPress}>
            <Text style={styles.signoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    // backgroundColor: "red",
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  container: {
    // flex: 1,
    height: "100%",
    alignItems: "center"
  },
  editText: {
    fontSize: 16,
    color: "#DA832D"
  },
  signoutText: {
    fontSize: 18,
    color: "#DA832D"
  }
});

export default Settings;