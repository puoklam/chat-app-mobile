import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FC, useRef, useState } from "react";
import { GestureResponderEvent, Keyboard, KeyboardAvoidingView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Button, Input } from "react-native-elements";
import { RootStackParamList } from "../navigation/param";
import fetcher from "../utils/fetcher";

type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "NewGroup">;

const NewGroup: FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const nameRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const newGroup = async () => {
    try {
      setLoading(true);
      const resp = await fetcher.post("groups", {
        body: JSON.stringify({
          name,
          description
        })
      });
      if (resp.status >= 400) throw new Error(await resp.text());
      const json = await resp.json();
      navigation.replace("Chat", { type: "group", id: json["id"] });
    } catch(e) {
      console.log(e);
      setLoading(false);
    }
  };
  
  const handleSubmitClick = (e: GestureResponderEvent) => {
    e.preventDefault();
    newGroup();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Name"
              autoCompleteType="name"
              autoComplete="name"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="next"
              returnKeyLabel="Next"
              ref={nameRef}
              value={name}
              disabled={loading}
              onChangeText={(t) => setName(t)}
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
            <Input
              placeholder="Description"
              autoCompleteType="off"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="send"
              returnKeyLabel="Submit"
              ref={descriptionRef}
              value={description}
              disabled={loading}
              onChangeText={(t) => setDescription(t)}
              onSubmitEditing={() => newGroup()}
            />
          </View>
          <Button buttonStyle={styles.btn} containerStyle={styles.btnContainer} title="Submit" onPress={handleSubmitClick} />
        </>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


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
    justifyContent: "center",
    padding: 10
  },
  inputContainer: {
    // width: "min(100%, 300px)"
    width: "80%",
    minWidth: 350
  }
});

export default NewGroup;