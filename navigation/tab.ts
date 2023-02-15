import { BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { RootTabParamList } from "./param";

const tab = createBottomTabNavigator<RootTabParamList>();

export type TabProp = BottomTabScreenProps<RootTabParamList>;
// export type TabNavigationProp = TabProp["navigation"];
// export type TabRoutePorps = TabProp["route"];
export type TabNavigationProp = BottomTabNavigationProp<RootTabParamList>;
export type TabRouteProp = RouteProp<RootTabParamList>;
export default tab;