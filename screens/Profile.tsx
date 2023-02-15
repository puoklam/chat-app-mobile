import { FC, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Avatar, Button, Input } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "../stores/auth";
import { IMAGE_FALLBACK_URL } from "../utils/image";
import fetcher from "../utils/fetcher";
import { Profile as Prof } from "../models/user";

const Profile: FC = () => {
  const { user, setProfile } = useAuthStore();
  const displaynameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const [displayname, setDisplayname] = useState(user?.displayname || "");
  const [bio, setBio] = useState(user?.bio || "");

  const updateProfile = async () => {
    try {
      const resp = await fetcher.patch(`users/${user?.id}`, {
        body: JSON.stringify({
          displayname,
          bio
        })
      });
      if (resp.status >= 400) throw new Error(await resp.text());
      const json: Prof = await resp.json();
      setProfile(json);
    } catch(e) {
      console.log(e);
    }
  }

  const uploadImage = async (image: ImagePicker.ImageInfo) => {
    const data = new FormData();
    const uri = image.uri;
    const fn = uri.split("/").pop();
    if (fn === undefined) throw new Error("undefined filename");
    const match = /\.(\w+)$/.exec(fn);
    const type = match ? `image/${match[1]}` : `image`;
    data.append("image", {
      uri,
      name: "test",
      type
    } as any);
    return fetcher.post(`users/${user?.id}/image`, {
      body: data
    });
  };

  const pickImage = async () => {
    const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!status.granted) {
      alert("permission not granted");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.cancelled) return;
    try {
      const resp = await uploadImage(result);
      if (resp.status >= 400) throw new Error(await resp.text());
      const json: Prof = await resp.json();
      setProfile(json);
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdatePress = () => {
    Keyboard.dismiss();
    updateProfile();
  };

  if (user === undefined) return <></>;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Avatar rounded size={150} containerStyle={styles.avatarContainer} source={{ uri: user.image_url || IMAGE_FALLBACK_URL }} />
        <Button onPress={() => pickImage()} title="Upload" />
        <View style={styles.inputContainer}>
          <Input
            placeholder="Displayname"
            autoCompleteType="off"
            autoComplete="off"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="next"
            returnKeyLabel="Next"
            ref={displaynameRef}
            value={displayname}
            onChangeText={(t) => setDisplayname(t)}
            onSubmitEditing={() => bioRef.current?.focus()}
          />
          <Input
            placeholder="Bio"
            autoCompleteType="off"
            autoComplete="off"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="done"
            returnKeyLabel="Done"
            ref={bioRef}
            value={bio}
            onChangeText={(t) => setBio(t)}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        <TouchableOpacity onPress={handleUpdatePress}>
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    backgroundColor: "white"
  },
  avatarContainer: {
    marginVertical: 24
  },
  label: {
    marginHorizontal: 8,
    marginVertical: 4,
    fontSize: 18
  },
  info: {
    backgroundColor: "white",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  inputContainer: {
    width: "80%",
    minWidth: 350,
  },
  updateText: {
    fontSize: 18,
    color: "#DA832D"
  }
});

export default Profile;