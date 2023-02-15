import { FC } from "react";
import { FlatList, GestureResponderEvent, ListRenderItem, SectionList, StyleSheet } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import { Membership } from "../models/membership";
import { IMAGE_FALLBACK_URL } from "../utils/image";

interface Props {
  memberships: Membership[];
  onMemberPress?: (member: Membership) => void;
};

const MemberList: FC<Props> = ({ memberships, onMemberPress }) => {
  const handleItemPress = (member: Membership) => (e: GestureResponderEvent) => {
    e.preventDefault();
    onMemberPress?.(member);
  }
  return (
    <>
      {memberships.map((membership) => (
        <MemberListItem key={membership.user_id} membership={membership} onPress={handleItemPress(membership)} />
      ))}
    </>
  );
};

interface ItemProps {
  membership: Membership,
  onPress?: (e: GestureResponderEvent) => void
};

const MemberListItem: FC<ItemProps> = ({ membership: { user }, onPress }) => (
  <ListItem onPress={onPress}>
    <Avatar rounded source={{ uri: IMAGE_FALLBACK_URL }} />
      <ListItem.Content>
        <ListItem.Title style={styles.title}>
          {user.displayname}
        </ListItem.Title>
      </ListItem.Content>
  </ListItem>
);

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

export default MemberList;