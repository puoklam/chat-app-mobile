import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { FC, memo, useCallback, useEffect, useState } from "react";
import { FlatList, GestureResponderEvent, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import { RelStatus, User } from "../../models/user";
import { RootTabParamList } from "../../navigation/param";
import { StackNavigationProp } from "../../navigation/stack";
import useAuthStore from "../../stores/auth";
import useChatsStore from "../../stores/chats";
import fetcher from "../../utils/fetcher";
import { IMAGE_FALLBACK_URL } from "../../utils/image";

type NavigationProp = CompositeNavigationProp<BottomTabNavigationProp<RootTabParamList, "Search">, StackNavigationProp>;

const BackwardRels: FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { addChat, getChat } = useChatsStore();
  const { user: authUser } = useAuthStore();

  const updateRel = async (user: User, status: RelStatus) => {
    try {
      const resp = await fetcher.post(`relationships/${user.id}`, {
        body: JSON.stringify({
          status
        })
      });
      if (resp.status >= 400) throw new Error(await resp.text());
      if (status === "accepted" && getChat(user.id, "personal") === undefined) {
        addChat(
          {
            id: user.id,
            type: "personal",
            name: user.displayname,
            image_url: user.image_url,
            unreadCount: 0,
            messages: []
          },
          authUser
        );
      }
    } catch(e) {
      throw e;
    }
  };
  
  const handleItemPress = (user: User, i: number) => (e: GestureResponderEvent) => {
    e.preventDefault();
    navigation.push("User", { id: user.id })
  };

  const handleActionPress = (user: User, i: number, action: "accepted" | "removed") => async (e: GestureResponderEvent) => {
    e.preventDefault();
    try {
      updateRel(user, action);
      setUsers((users) => {
        return users.filter((user, idx) => i !== idx);
      });
    } catch(e) {
      console.log(e);
    }
  };
  
  const keyExtractor = useCallback((item: User, index: number) => item.id.toString(), []);

  const renderItem: ListRenderItem<User> = useCallback(
    ({ item: user, index }) => (
      <RelListItemMemo
        user={user}
        onPress={handleItemPress(user, index)}
        onAcceptPress={handleActionPress(user, index, "accepted")}
        onCancelPress={handleActionPress(user, index, "removed")}
      />
    ),
    []
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const rels = await getRels();
      setUsers(rels.map((rel: any) => rel.user1));
    } catch(e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };

  const getRels = async () => {
    try {
      const resp = await fetcher.get("auth/user/relationships/pendingbackward");
      if (resp.status >= 400) throw new Error(await resp.text());
      const json = await resp.json();
      return json;
    } catch(e) {
      throw e;
    }
  };

  useEffect(() => {
    getRels()
      .then((rels) => setUsers(rels.map((rel: any) => rel.user1)))
      .catch((e) => console.log(e));
  }, []);


  return (
    <View style={{ height: "100%" }}>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

interface ItemProps {
  user: User;
  onPress: (e: GestureResponderEvent) => void;
  onAcceptPress: (e: GestureResponderEvent) => void;
  onCancelPress: (e: GestureResponderEvent) => void;
};

const RelListItem: FC<ItemProps> = ({ user, onPress, onAcceptPress, onCancelPress }) => {
  return (
    <ListItem onPress={onPress}>
      <Avatar rounded source={{ uri: user.image_url || IMAGE_FALLBACK_URL }} />
      <ListItem.Content>
        <ListItem.Title style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {user.displayname}
        </ListItem.Title>
      </ListItem.Content>
      <TouchableOpacity>
        <Text style={styles.actionText} onPress={onAcceptPress}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.actionText} onPress={onCancelPress}>Cancel</Text>
      </TouchableOpacity>
    </ListItem>
  );
};

const RelListItemMemo = memo(RelListItem);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#C5C4C3",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    width: "100%",
    fontWeight: "700"
  },
  actionText: {
    color: "#DA832D"
  }
});

export default BackwardRels;