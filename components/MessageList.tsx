import { FC, memo, useCallback } from "react";
import { FlatList, ListRenderItem, StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-elements";
import { User } from "../models/user";
import { Message } from "../stores/chats";
import { IMAGE_FALLBACK_URL } from "../utils/image";

const MessageList: FC<{ inverted?: boolean, user?: User, messages: Message[], handleAvatarPress: (user_id: number) => void }> = ({ inverted, user, messages, handleAvatarPress }) => {
  
  const keyExtractor = useCallback((item: Message, index: number) => item.id, []);
  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item: message, index, separators }) => <MessageItemMemo message={message} user={user} onAvatarPress={() => handleAvatarPress(message.from_id)} />,
    []
  );
  return (
    <FlatList
      inverted={inverted}
      style={styles.messages}
      data={messages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

const MessageItem: FC<{ message: Message, user?: User, onAvatarPress?: () => void }> = ({ message, user, onAvatarPress }) => (
  <View
    style={[styles.message, message.from_id === user?.id ? styles.sender : styles.receiver]}
  >
    <Avatar
      rounded
      activeOpacity={1}
      onPress={onAvatarPress}
      source={{ uri: message.from_image_url || IMAGE_FALLBACK_URL }} />
    <View style={[styles.messageText, message.from_id === user?.id ? styles.senderText : styles.receiverText]}>
      <Text>{message.content}</Text>
    </View>
  </View>
);

const MessageItemMemo = memo(MessageItem);

const styles = StyleSheet.create({
  messages: {
    paddingHorizontal: 15
  },
  message: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6
  },
  sender: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse"
  },
  receiver: {
    alignSelf: "flex-start",
  },
  messageText: {
    borderRadius: 20,
    // height: "100%",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "80%"
  },
  senderText: {
    backgroundColor: "#DA832D",
    marginRight: 6
  },
  receiverText: {
    backgroundColor: "#ECECEC",
    marginLeft: 6
  }
});

export default MessageList;