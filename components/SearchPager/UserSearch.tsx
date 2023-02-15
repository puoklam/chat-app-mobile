import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { FC, memo, useCallback, useEffect, useState } from "react";
import { FlatList, Keyboard, ListRenderItem, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import { User } from "../../models/user";
import { RootTabParamList } from "../../navigation/param";
import { StackNavigationProp } from "../../navigation/stack";
import fetcher from "../../utils/fetcher";
import { IMAGE_FALLBACK_URL } from "../../utils/image";

type NavigationProp = CompositeNavigationProp<BottomTabNavigationProp<RootTabParamList, "Search">, StackNavigationProp>;

const UserSearch: FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const keyExtractor = useCallback((item: User) => item.id.toString(), []);
  const renderItem: ListRenderItem<User> = useCallback(
    ({ item }) => (
      <UserListItemMemo user={item} onPress={(user) => navigation.navigate("User", { id: user.id })} />
    ),
    []
  );

  const search = async () => {
    try {
      const resp = await fetcher.get(`users?s=${keyword}`);
      const json = await resp.json();
      setUsers(json);
    } catch(e) {
      console.log(e);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    search().then(() => setRefreshing(false));
  }, [keyword]);

  useEffect(() => {
    search();
  }, []);


  return (
    <View style={{ height: "100%" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
          <View style={styles.searchBox}>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={18} style={{ marginRight: 8 }} color="black" />
              <TextInput
                editable={true}
                placeholder="Search..."
                textAlignVertical="center"
                keyboardType="default"
                returnKeyType="search"
                style={styles.searchInput}
                value={keyword}
                onChangeText={(text) => setKeyword(text)}
                onSubmitEditing={() => search()}
              />
            </View>
          </View>
          <FlatList
            data={users}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </>
      </TouchableWithoutFeedback>
    </View>
  );
};

type ItemProps = {
  user: User;
  onPress?: (user: User) => void
};

const UserListItem: FC<ItemProps> = ({ user, onPress }) => (
  <ListItem onPress={() => onPress?.(user)}>
    <Avatar rounded source={{ uri: user.image_url || IMAGE_FALLBACK_URL }} />
      <ListItem.Content>
        <ListItem.Title numberOfLines={1} ellipsizeMode="tail">
          {user.displayname}
        </ListItem.Title>
      </ListItem.Content>
  </ListItem>
);

const UserListItemMemo = memo(UserListItem);

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: "white",
    borderBottomColor: "#DFDFDF",
    borderBottomWidth: 1
  },
  searchBarContainer: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#C5C4C3",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginVertical: 6
  },
  searchInput: {
    // width: "100%",
    flex: 1,
    height: 24,
    // fontSize: 16
  },
});

export default UserSearch;