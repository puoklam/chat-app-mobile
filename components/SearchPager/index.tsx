import { FC, useRef, useState } from "react";
import { View } from "react-native";
import PagerView, { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import BackwardRels from "./BackwardRels";
import ForwardRels from "./ForwardRels";
import GroupSearch from "./GroupSearch";
import TabIndicator, { TabItem } from "./TabIndicator";
import UserSearch from "./UserSearch";

const SearchPager: FC = () => {
  const pagerRef = useRef<PagerView>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const tabItems: TabItem[] = [
    {
      index: 0,
      name: "groups",
      value: "groups"
    },
    {
      index: 1,
      name: "users",
      value: "users"
    },
    {
      index: 2,
      name: "pending",
      value: "pending"
    },
    {
      index: 3,
      name: "requests",
      value: "requests"
    }
  ];

  const onItemPress = (item: TabItem) => {
    pagerRef.current?.setPage(item.index);
  };

  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setTabIndex(e.nativeEvent.position);
  };

  return (
    <View>
      <TabIndicator items={tabItems} index={tabIndex} onItemPress={onItemPress} />
      <PagerView
        ref={pagerRef}
        initialPage={0} style={{ height: "100%" }}
        onPageSelected={onPageSelected}
      >
        <GroupSearch />
        <UserSearch />
        <ForwardRels />
        <BackwardRels />
      </PagerView>
    </View>
  );
};

export default SearchPager;