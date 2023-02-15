import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { FC, useCallback, useLayoutEffect, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import ChatList from "../components/ChatList";
import { RootTabParamList } from "../navigation/param";
import { StackNavigationProp } from "../navigation/stack";
import useAuthStore from "../stores/auth";
import useChatsStore from "../stores/chats";

type ScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "Chats">,
  StackNavigationProp
>;

const Chats: FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { me, user } = useAuthStore();
  const { head, listChats, initChats } = useChatsStore();
  // const stackNavigation = navigation.getParent<StackNavigationProp>();

  const onRefresh = useCallback(() => {
    (async () => {
      setRefreshing(true);
      me()
        .then((user) => {
          if (user === undefined) return;
          // initGroups(user.memberships.map((membership) => membership.group));
          initChats(user);
        })
        .catch((e) => console.log(e))
        .finally(() => setRefreshing(false));
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={32} color="#DA832D" />
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation]);

  return (
    <SafeAreaView>
      <View style={{ height: "100%" }}>
        <ChatList
          // extraData={head}
          chats={listChats()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onChatPress={(chat) => {
            navigation.navigate("Chat", { type: chat.type, id: chat.id });
          }}
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {setModalVisible(false)}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Button
              type="clear"
              title="Group"
              titleStyle={{ marginLeft: 8, color: "#DA832D" }}
              buttonStyle={{ backgroundColor: undefined }}
              icon={<MaterialIcons name="group-add" size={36} color="#DA832D" />}
              onPress={() => {setModalVisible(false); navigation.navigate("NewGroup")}}
            />
            <Button
              type="clear"
              title="User"
              titleStyle={{ marginLeft: 8, color: "#DA832D" }}
              buttonStyle={{ backgroundColor: undefined }}
              icon={<MaterialIcons name="person-add" size={36} color="#DA832D" />}
              onPress={() => {setModalVisible(false); navigation.navigate("NewGroup")}}
            />
            <Pressable style={{ position: "absolute", top: 8, right: 8 }} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-sharp" size={24} color="#DA832D" />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  bottomSheet: {
    backgroundColor: "white",
    padding: 10,
    alignItems: "center"
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    borderRadius: 10
  }
})

export default Chats;