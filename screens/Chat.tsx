import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FC, memo, useCallback, useLayoutEffect, useState } from "react";
import { GestureResponderEvent, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Avatar } from "react-native-elements";
import { RootStackParamList } from "../navigation/param";
import fetcher from "../utils/fetcher";
import useAuthStore from "../stores/auth";
import useChatsStore from "../stores/chats";
import MessageList from "../components/MessageList";
import { IMAGE_FALLBACK_URL } from "../utils/image";

type ScreenProps = NativeStackScreenProps<RootStackParamList, "Chat">;

const Chat: FC = () => {
  const navigation = useNavigation<ScreenProps["navigation"]>();
  const route = useRoute<ScreenProps["route"]>();
  const [input, setInput] = useState("");
  const { user, pushToken } = useAuthStore();
  const { getChat } = useChatsStore();
  const { id, type } = route.params;
  const chat = getChat(id, type);

  const newLine = () => {
    setInput((input) => input + "\n");
  };

  const send = async () => {
    if (input.length === 0) return;
    Keyboard.dismiss();
    try {
      await fetcher.post(`${type === "group" ? "groups" : "users"}/${id}/messages`, {
        body: JSON.stringify({
          message: input
        })
      });
      setInput("");
    } catch(e) {
      console.log(e);
    }
  };

  const handleHeaderClick = (e: GestureResponderEvent) => {
    e.preventDefault();
    if (chat === undefined) return;
    navigation.push(type === "group" ? "Group" : "User", { id: chat.id });
  };
  
  const handleAvatarPress = useCallback((user_id: number) => navigation.navigate("User", { id: user_id }), []);

  useLayoutEffect(() => {
    if (chat === undefined) return;
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity onPress={handleHeaderClick}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar rounded source={{ uri: chat.image_url || IMAGE_FALLBACK_URL }} />
            <Text style={{ marginLeft: 10, fontWeight: "700" }}>{chat.name}</Text>
          </View>
        </TouchableOpacity>
      ),
      title: chat.name
    });
  }, [navigation]);
  
  if (chat === undefined) return <></>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            {/* <FlatList
              inverted
              removeClippedSubviews
              style={styles.messages}
              data={chats[idx].messages.slice().reverse()}
              keyExtractor={(item, i) => i.toString()}
              renderItem={renderItem}
            /> */}
            {/* shopify <FlashList /> */}
            <MessageListMemo
              inverted
              user={user}
              messages={chat.messages.slice().reverse()}
              handleAvatarPress={handleAvatarPress}
            />
            <View style={styles.footer}>
              <View style={styles.inputContainer}>
                <TextInput
                  editable={true}
                  multiline={true}
                  placeholder="Message..."
                  textAlignVertical="center"
                  style={styles.input}
                  value={input}
                  onChangeText={(text) => setInput(text)}
                  onSubmitEditing={() => newLine()}
                />
              </View>
              <TouchableOpacity activeOpacity={0.5} onPress={() => send()}>
                <Ionicons name="send" size={24} />
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>

        {/* <Button
          title="NAV"
          onPress={() => {
            navigation.push("Chat", {type: "group", id: route.params.id});
          }}
        /> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const MessageListMemo = memo(MessageList, (prev, next) => {
  if (prev.inverted !== next.inverted) return false;
  if (prev.user?.id !== next.user?.id) return false;
  if (prev.messages.length !== next.messages.length) return false;
  return true;
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  input: {
    // backgroundColor: "#C5C4C3",
    // height: 20,
    // lineHeight: 30,
    fontSize: 16
    // borderRadius: 20,
    // paddingHorizontal: 20,
    // marginRight: 12,
    // flex: 1
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#C5C4C3",
    // height: 40,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12
  }
});
export default Chat;