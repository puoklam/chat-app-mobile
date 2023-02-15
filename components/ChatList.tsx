import { FC } from "react";
import { FlatList, GestureResponderEvent, ListRenderItem, StyleSheet, Text, View } from "react-native";
import { Avatar, Badge, ListItem } from "react-native-elements";
import { Chat } from "../stores/chats";
import { IMAGE_FALLBACK_URL } from "../utils/image";

interface Props {
  chats: Chat[];
  onChatPress: (chat: Chat) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  extraData?: any
};

const ChatList: FC<Props> = ({ chats, onChatPress, refreshing, onRefresh, extraData }) => {
  const handleItemPress = (chat: Chat) => (e: GestureResponderEvent) => {
    onChatPress(chat);
  };

  const renderItem: ListRenderItem<Chat> = ({ item: chat, index, separators }) => <ChatListItem chat={chat} onPress={handleItemPress(chat)} />

  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={chats}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      extraData={extraData}
    />
  );
};

interface ItemProps {
  chat: Chat;
  onPress: (e: GestureResponderEvent) => void;
};

const ChatListItem: FC<ItemProps> = ({ chat, onPress }) => {
  return (
    <ListItem onPress={onPress}>
      <Avatar rounded size={54} source={{ uri: chat.image_url || IMAGE_FALLBACK_URL }} />
      <ListItem.Content>
        <ListItem.Title style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {chat.name}
        </ListItem.Title>
        <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
          {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : null}
        </ListItem.Subtitle>
      </ListItem.Content>
      {chat.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text>
            {chat.unreadCount}
          </Text>
        </View>
      )}
    </ListItem>
  );
};

const styles = StyleSheet.create({
  badge: {
    // backgroundColor: "#C5C4C3",
    backgroundColor: "#DA832D",
    borderRadius: 12,
    // width: 24,
    paddingHorizontal: 8,
    height: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    width: "100%",
    fontWeight: "700"
  }
});

export default ChatList;