import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FC, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Button } from "react-native-elements";
import { RelStatus, User as Usr} from "../models/user";
import { RootStackParamList } from "../navigation/param";
import useAuthStore from "../stores/auth";
import useChatsStore from "../stores/chats";
import fetcher from "../utils/fetcher";
import { IMAGE_FALLBACK_URL } from "../utils/image";

const User: FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "User">>();
  const route = useRoute<RouteProp<RootStackParamList, "User">>();
  const [user, setUser] = useState<Usr>();
  const [forwardStatus, setForwardStatus] = useState<RelStatus>();
  const [backwardStatus, setBackwardStatus] = useState<RelStatus>();
  const [notifications, setNotifications] = useState(false);
  const { user: authUser } = useAuthStore();
  const { getChat, addChat } = useChatsStore();

  const fetchRel = async () => {
    if (user === undefined) return;
    try {
      const resp = await fetcher.get(`relationships/${user.id}`);
      if (resp.status === 404) return;
      else if (resp.status >= 400) throw new Error(await resp.text());
      const json = await resp.json();
      if (json["user1_id"] === user.id) {
        setForwardStatus(json["backward_status"]);
        setBackwardStatus(json["forward_status"]);
        setNotifications(json["backward_notifications"]);
      } else {
        setForwardStatus(json["forward_status"]);
        setBackwardStatus(json["backward_status"]);
        setNotifications(json["forward_notifications"]);
      }
    } catch(e) {
      console.log(e);
    }
  };

  const updateRel = async (status: RelStatus) => {
    if (user === undefined || authUser === undefined) return;
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
      console.log(e);
    } finally {
      fetchRel();
    }
  };

  const toggleNotifications = () => {
    const update = async (val: boolean) => {
      if (user === undefined) return;
      try {
        const resp = await fetcher.post(`users/${user.id}/notifications`, {
          body: JSON.stringify({
            notifications: val
          })
        });
        if (resp.status >= 400) throw new Error(await resp.text());
      } catch(e) {
        console.log(e);
        // TODO: return noti and setstate
      }
    };
    setNotifications((noti) => {
      update(!noti);
      return !noti;
    });
  };

  const renderRelAction = useCallback(() => {
    let title: string | undefined;
    let onPress: (() => void) | undefined;
    switch(forwardStatus) {
      case "default":
        switch(backwardStatus) {
          case "accepted":
            title = "Accepted";
            onPress = () => updateRel("accepted");
            break;
            // return <Button containerStyle={styles.btnContainer} title="Accept" onPress={() => updateRel("accepted")} />;
          case "removed":
          case "blocked":
            title = "Add";
            onPress = () => updateRel("accepted");
            break;
            // return <Button containerStyle={styles.btnContainer} title="Add" onPress={() => updateRel("accepted")} />;
        }
        break;
      case "accepted":
        switch(backwardStatus) {
          case "removed":
            title = "Add";
            onPress = () => updateRel("accepted");
            break;
          case "default":
            title = "Cancel";
            onPress = () => updateRel("removed");
            break;
            // return <Button containerStyle={styles.btnContainer} title="Cancel" onPress={() => updateRel("removed")} />;
          case "accepted":
          case "blocked":
            title = "Remove";
            onPress = () => updateRel("removed");
            break;
            // return <Button containerStyle={styles.btnContainer} title="Remove" onPress={() => updateRel("removed")} />;
        }
        break;
      case "blocked":
        return null;
      case "removed":
      case undefined:
        title = "Add";
        onPress = () => updateRel("accepted");
        break;
        // return <Button containerStyle={styles.btnContainer} title="Add" onPress={() => updateRel("accepted")} />;
      default:
        // impossible
        return <Text>Error</Text>;
    }
    return (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    );
  }, [forwardStatus, backwardStatus, user]);

  useEffect(() => {
    if (user?.id === authUser?.id) return;
    fetchRel();
  }, [user?.id]);

  useEffect(() => {
    if (route.params.id === authUser?.id) {
      navigation.replace("Profile");
      return;
    };
    (async () => {
      try {
        const resp = await fetcher.get(`users/${route.params.id}`);
        if (resp.status >= 400) throw new Error(await resp.text());
        const json = await resp.json();
        setUser(json);
      } catch(e) {
        console.log(e);
      }
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: user?.displayname
    });
  }, [navigation, user]);

  if (user === undefined) return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <View style={{ alignItems: "center" }}>
          <Avatar rounded size={150} containerStyle={styles.avatarContainer} source={{ uri: user.image_url || IMAGE_FALLBACK_URL }} />
          <View style={styles.actions}>
            {renderRelAction()}
            {forwardStatus === "blocked" ? (
              <TouchableOpacity style={styles.action} onPress={() => updateRel("removed")}>
                <Text style={styles.actionText}>Unblock</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.action} onPress={() => updateRel("blocked")}>
                <Text style={styles.actionText}>Block</Text>
              </TouchableOpacity>
            )}
          </View>
          {forwardStatus === "accepted" && (
            <>
              <Text style={styles.label}>Notifications</Text>
              <Switch
                value={notifications}
                trackColor={{ false: "white", true: "#DA832D" }}
                thumbColor={notifications ? "white" : "#DA832D"}
                onValueChange={toggleNotifications}
              />
            </>
          )}
        </View>
        <Text style={styles.label}>Bio</Text>
        <Text style={styles.info}>{user.bio}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center"
    // justifyContent: "center"
  },
  avatarContainer: {
    marginVertical: 24
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  action: {
    marginHorizontal: 12
  },
  label: {
    marginHorizontal: 8,
    marginVertical: 4,
    fontSize: 18
  },
  info: {
    backgroundColor: "white",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  actionText: {
    fontSize: 22,
    color: "#DA832D"
  }
});

export default User;