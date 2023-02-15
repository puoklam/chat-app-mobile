import { FC } from "react";
import { FlatList, GestureResponderEvent, ListRenderItem, StyleSheet, View } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import { Group } from "../models/group";
import { IMAGE_FALLBACK_URL } from "../utils/image";

interface Props {
  groups: Group[];
  onGroupPress: (group: Group) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const GroupList: FC<Props> = ({ groups, onGroupPress, refreshing, onRefresh }) => {
  const handleItemPress = (group: Group) => (e: GestureResponderEvent) => {
    onGroupPress(group);
  };

  const renderItem: ListRenderItem<Group> = ({ item: group }) => <GroupListItem group={group} onPress={handleItemPress(group)} />

  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={groups}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

interface ItemProps {
  group: Group;
  onPress: (e: GestureResponderEvent) => void;
};

const GroupListItem: FC<ItemProps> = ({ group, onPress }) => {
  return (
    <ListItem onPress={onPress}>
      <Avatar rounded source={{ uri: group.image_url || IMAGE_FALLBACK_URL }} />
      <ListItem.Content>
        <ListItem.Title style={styles.title}>
          {group.name}
        </ListItem.Title>
        <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
          {group.description}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

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
  }
});

export default GroupList;