import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GestureResponderEvent, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Button } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BottomSheet from "@gorhom/bottom-sheet";
import { Group as Grp } from "../models/group";
import { RootStackParamList } from "../navigation/param";
import fetcher from "../utils/fetcher";
import EditGroupBottomSheet from "../components/EditGroupBottomSheet";
import useAuthStore from "../stores/auth";
import MemberList from "../components/MemberList";

type ScreenProps = NativeStackScreenProps<RootStackParamList, "Group">;

const Group: FC = () => {
  const navigation = useNavigation<ScreenProps["navigation"]>();
  const route = useRoute<ScreenProps["route"]>();
  const bsRef = useRef<BottomSheet>(null);
  const [edit, setEdit] = useState(false);
  const [group, setGroup] = useState<Grp>();
  const [joined, setJoined] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { user } = useAuthStore();

  const handlePresentModalPress = useCallback(() => {
    bsRef.current?.expand();
  }, []);

  const uploadImage = async (image: ImagePicker.ImageInfo) => {
    const data = new FormData();
    const uri = image.uri;
    const fn = uri.split("/").pop();
    if (fn === undefined) throw new Error("undefined filename");
    const match = /\.(\w+)$/.exec(fn);
    const type = match ? `image/${match[1]}` : `image`;
    data.append("image", {
      uri,
      name: "test",
      type
    } as any);
    return fetcher.post(`groups/${group?.id}/image`, {
      body: data,
      // headers: {
      //   "Content-Type": "multipart/form-data"
      // }
    });
  };

  const pickImage = async () => {
    const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!status.granted) {
      alert("permission not granted");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      quality: 1,
      base64: true
    });
    if (result.cancelled) return;
    try {
      const resp = await uploadImage(result);
      if (resp.status >= 400) throw new Error(await resp.text());
      const json = await resp.json();
      setGroup(json);
    } catch (e) {
      console.log(e);
    }
  };

  const handleJoinPress = async (e: GestureResponderEvent) => {
    e.preventDefault();
    if (group === undefined) return;
    try {
      const resp = await fetcher.post(`groups/${group.id}/join`);
      if (resp.status >= 400) throw new Error(await resp.text());
      // const json = await resp.json();
      setJoined(true);
    } catch(e) {
      console.log(e);
    }
  };

  const handleExitPress = async (e: GestureResponderEvent) => {
    e.preventDefault();
    if (group === undefined) return;
    try {
      const resp = await fetcher.post(`groups/${group.id}/exit`);
      if (resp.status >= 400) throw new Error(await resp.text());
      setJoined(false);
    } catch(e) {
      console.log(e)
    }
  };

  const toggleNotifications = () => {
    const update = async (val: boolean) => {
      if (group === undefined) return;
      try {
        const resp = await fetcher.post(`memberships/${group.id}/notifications`, {
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

  useEffect(() => {
    const id = route.params.id;
    (async () => {
      try {
        const resp = await fetcher.get(`groups/${id}`);
        if (resp.status >= 400) throw new Error(await resp.text());
        const json = await resp.json();
        if (json["joined"]) {
          setJoined(true);
        }
        if (json["notification"]) {
          setNotifications(true);
        }
        setGroup(json);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: group?.name,
      headerRight: (props) => {
        if (group === undefined) return null;
        if (group.owner_id !== user?.id) return null;
        return (
          <View>
            <TouchableOpacity onPress={() => edit ? bsRef.current?.close() : bsRef.current?.expand()}>
              <Text style={{ fontSize: 16, color: "#DA832D" }}>{edit ? "Cancel" : "Edit"}</Text>
            </TouchableOpacity>
          </View>
        );
      }
    });
  }, [edit, group]);

  if (group === undefined) return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }}>
        <View style={{ alignItems: "center" }}>
          <Avatar rounded size={150} containerStyle={styles.avatarContainer} source={{ uri: group.image_url }} />
          {group.owner_id === user?.id && <Button onPress={() => pickImage()} title="Upload" />}
          <TouchableOpacity onPress={joined ? handleExitPress : handleJoinPress}>
            <Text style={styles.joinText}>{joined ? "Exit" : "Join"}</Text>
          </TouchableOpacity>
          {joined && (
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
        <Text style={styles.label}>Name</Text>
        <Text style={styles.info}>{group.name}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.info}>{group.description}</Text>
        <Text style={styles.label}>Members</Text>
        {group.memberships && <MemberList memberships={group.memberships}/>}
      </ScrollView>
      {group.owner_id === user?.id && (
        <EditGroupBottomSheet
          ref={bsRef}
          group={group}
          onChange={(i) => setEdit(i == 0)}
          onSubmit={async (name, desc) => {
            try {
              const resp = await fetcher.patch(`groups/${group.id}`, {
                body: JSON.stringify({
                  name: name,
                  description: desc
                })
              });
              if (resp.status >= 400) throw new Error(await resp.text());
              const json = await resp.json();
              setGroup(json);
            } catch(e) {
              console.log(e);
            } finally {
              bsRef.current?.close();
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center"
  },
  avatarContainer: {
    marginVertical: 24
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
  joinText: {
    fontSize: 22,
    color: "#DA832D"
  }
});

export default Group;