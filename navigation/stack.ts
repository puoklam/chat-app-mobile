import { RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./param";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const stack = createNativeStackNavigator<RootStackParamList>();

export type StackProp = NativeStackScreenProps<RootStackParamList>;
// export type StackNavigationProp =  StackProp["navigation"];
// export type StackRouteProp = StackProp["route"];
export type StackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type StackRouteProp = RouteProp<RootStackParamList>
export default stack;