import { useNavigation } from "@react-navigation/native";
import { FC, useRef, useState } from "react";
import { GestureResponderEvent, Keyboard, KeyboardAvoidingView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Button, Input } from "react-native-elements";
import fetcher from "../utils/fetcher";

const Register: FC = () => {
  const navigation = useNavigation();
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const register = async () => {
    // const token = await getToken(messaging);
    // console.log(`TOKEN: ${token}`);
    let success = false;
    try {
      setLoading(true);
      const resp = await fetcher.post("auth/register", {
        body: JSON.stringify({
          username,
          password
        })
      });
      if (resp.status >= 400) throw new Error(await resp.text());
      const json = await resp.json();
      success = true;
    } catch(e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
    if (success) navigation.navigate("Login");
  };
  const handleRegisterClick = (e: GestureResponderEvent) => {
    e.preventDefault();
    register();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.inputContainer}>
          <Input
            enablesReturnKeyAutomatically
            disabled={loading}
            placeholder="Username"
            autoCompleteType="username"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="next"
            returnKeyLabel="Next"
            ref={usernameRef}
            value={username}
            onChangeText={(t) => setUsername(t)}
            onSubmitEditing={() => passwordRef.current?.focus()}
            />
          <Input
            enablesReturnKeyAutomatically
            secureTextEntry
            disabled={loading}
            placeholder="Password"
            autoCompleteType="password"
            autoComplete="password"
            returnKeyType="next"
            returnKeyLabel="Next"
            ref={passwordRef}
            value={password}
            onChangeText={(t) => setPassword(t)}
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <Input
            enablesReturnKeyAutomatically
            secureTextEntry
            disabled={loading}
            placeholder="Confirm Password"
            autoCompleteType="password"
            autoComplete="password"
            returnKeyType="go"
            returnKeyLabel="Go"
            ref={confirmRef}
            value={confirm}
            onChangeText={(t) => setConfirm(t)}
            onSubmitEditing={() => register()}
          />
        </View>
        <Button buttonStyle={styles.btn} containerStyle={styles.btnContainer} title="Register" disabled={loading} onPress={handleRegisterClick} />
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
    minWidth: 350,
  }
});

export default Register;