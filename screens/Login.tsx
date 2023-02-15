import { useNavigation } from "@react-navigation/native";
import { FC, useRef, useState } from "react";
import { ActivityIndicator, GestureResponderEvent, Keyboard, KeyboardAvoidingView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Button, Image, Input } from "react-native-elements"
import useAuthStore from "../stores/auth";

// interface Props {
//   navigation: NavigationAction;
// };

const Login: FC = () => {
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const handleLogin = async (username: string, password: string) => {
    Keyboard.dismiss();
    if (loading) return;
    try {
      setLoading(true);
      await login(username, password);
    } catch(e) {
      setLoading(false);
    }
  };
  const handleLoginClick = (e: GestureResponderEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  };
  const handleRegisterClick = (e: GestureResponderEvent) => {
    e.preventDefault();
    navigation.navigate("Register");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Image
          // source={{
          //   uri: "https://png.pngtree.com/png-clipart/20210309/original/pngtree-signal-icon-logo-design-png-png-image_5870317.jpg"
          // }}
          source={require("../assets/icon.jpg")}
          style={{
            marginBottom: 20,
            width: 150,
            height: 150,
            borderRadius: 50
          }}
        />
        <View style={styles.inputContainer}>
          <Input
            placeholder="Username"
            autoCompleteType="username"
            autoComplete="username"
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
            secureTextEntry
            placeholder="Password"
            autoCompleteType="password"
            autoComplete="password"
            returnKeyType="go"
            returnKeyLabel="Go"
            ref={passwordRef}
            value={password}
            onChangeText={(t) => setPassword(t)}
            onSubmitEditing={() => handleLogin(username, password)}
          />
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Button buttonStyle={styles.btn} containerStyle={styles.btnContainer} disabled={loading} title="Login" onPress={handleLoginClick} />
            <Button buttonStyle={styles.btn} containerStyle={styles.btnContainer} disabled={loading} title="Register" onPress={handleRegisterClick} />
          </>
        )}
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

export default Login;