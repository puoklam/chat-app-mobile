export type ChatParams = {
  type: "group" | "personal";
  id: number;
};

export type GroupParams = {
  id: number;
};

export type UserParams = {
  id: number;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Chat: ChatParams;
  Group: GroupParams;
  User: UserParams;
  Profile: undefined;
  NewGroup: undefined;
};

export type RootTabParamList = {
  Search: undefined;
  Chats: undefined;
  Settings: undefined;
};

// https://stackoverflow.com/questions/68667766/react-native-typescript-string-is-not-assignable-to-parameter-of-type-never