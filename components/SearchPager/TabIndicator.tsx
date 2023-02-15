import { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type TabItem = {
  index: number;
  name: string;
  value: string;
};

interface Props {
  items: TabItem[];
  index: number;
  onItemPress?: (item: TabItem) => void;
};


const TabIndicator: FC<Props> = ({ items, index, onItemPress }) => {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item.value}
          style={[styles.tab, index === item.index ? styles.tabSelected : {}]}
          onPress={() => onItemPress?.(item)}
        >
          <Text style={index === item.index ? styles.textSelected : {}}>{item.name}</Text>
        </Pressable>
      ))}
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5"
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 8
  },
  tabSelected: {
    borderBottomColor: "#DA832D",
    borderBottomWidth: 2
  },
  textSelected: {
    color: "#DA832D"
  }
})

export default TabIndicator;