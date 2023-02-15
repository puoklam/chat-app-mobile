import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { FC, useCallback, useEffect, useState } from "react";
import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Group } from "../../models/group";
import { RootTabParamList } from "../../navigation/param";
import { StackNavigationProp } from "../../navigation/stack";
import fetcher from "../../utils/fetcher";
import GroupList from "../GroupList";

type NavigationProp = CompositeNavigationProp<BottomTabNavigationProp<RootTabParamList, "Search">, StackNavigationProp>;

const GroupSearch: FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [keyword, setKeyword] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const search = async () => {
    try {
      const resp = await fetcher.get(`groups?s=${keyword}`);
      const json = await resp.json();
      setGroups(json);
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
          <GroupList
            refreshing={refreshing}
            onRefresh={onRefresh}
            groups={groups}
            onGroupPress={(group) => {
              navigation.navigate("Group", { id: group.id });
            }}
          />
        </>
      </TouchableWithoutFeedback>
    </View>
  );
};

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

export default GroupSearch;