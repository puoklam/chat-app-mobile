import { forwardRef, useCallback, useRef, useState } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Input } from "react-native-elements";
import { Group } from "../models/group";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props {
  group: Group;
  onChange?: (index: number) => void;
  onSubmit?: (name: string, desc: string) => void;
};

const EditGroupBottomSheet = forwardRef<BottomSheet, Props>(({ group, onChange, onSubmit }, ref) => {
  const nameRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description);
  const [loading, setLoading] = useState(false);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
    />
  ), []);

  const handleUpdatePress = async () => {
    Keyboard.dismiss();
    onSubmit?.call(this, name, desc);
  };

  const onClose = () => {
    Keyboard.dismiss();
    setName(group.name);
    setDesc(group.description);
  };

  return (
    <BottomSheet
      enablePanDownToClose
      ref={ref}
      index={-1}
      snapPoints={["80%"]}
      backdropComponent={renderBackdrop}
      onChange={onChange}
      onClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Name"
              autoCompleteType="off"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="next"
              returnKeyLabel="Next"
              ref={nameRef}
              value={name}
              onChangeText={(t) => setName(t)}
              onSubmitEditing={() => descRef.current?.focus()}
            />
            <Input
              placeholder="Description"
              autoCompleteType="off"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="done"
              returnKeyLabel="Done"
              ref={descRef}
              value={desc}
              onChangeText={(t) => setDesc(t)}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
          <TouchableOpacity onPress={handleUpdatePress}>
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  btn: {},
  btnContainer: {
    width: "80%",
    minWidth: 350,
    marginTop: 10
  },
  container: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    padding: 10
  },
  inputContainer: {
    // width: "min(100%, 300px)"
    width: "80%",
    minWidth: 350,
  },
  updateText: {
    fontSize: 18,
    color: "#DA832D"
  }
});

export default EditGroupBottomSheet;