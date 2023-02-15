import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const isGranted = (status: Notifications.NotificationPermissionsStatus) => {
  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
  );
};


const allowsNotificationsAsync = async () => {
  const status = await Notifications.getPermissionsAsync();
  return isGranted(status);
};

const requestPermissionsAsync = async () => {
  const status = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true
    }
  });
  return isGranted(status);
};

const setChan = () => {
  if (Platform.OS !== "android") {
    return;
  }
  return Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C"
  });
};

const register = async (): Promise<string | undefined> => {
  let token;
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    setChan();
    return;
  }
  const preGranted = await allowsNotificationsAsync();
  let granted = preGranted;
  if (!granted) {
    granted = await requestPermissionsAsync();
  }
  if (!granted) {
    alert("Push notifications permision not granted");
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(`"expo push token: ${token}`);
  setChan();
  return token;
}

export {
  allowsNotificationsAsync,
  requestPermissionsAsync,
  register
};

// https://stackoverflow.com/questions/69257229/fcm-send-a-notification-to-ios-device-using-expo-react-native
// https://docs.expo.dev/versions/latest/sdk/notifications/#permission-schedule_exact_alarm
// https://docs.expo.dev/push-notifications/using-fcm/
// https://docs.expo.dev/push-notifications/sending-notifications/
// https://docs.expo.dev/versions/latest/sdk/notifications/#permission-schedule_exact_alarm
// https://docs.expo.dev/versions/latest/sdk/notifications/#fetching-information-about-notifications-related-permissions
// https://docs.expo.dev/versions/latest/sdk/notifications/#addnotificationresponsereceivedlistenerlistener-event-notificationresponse--void-void
// https://dev.to/collegewap/react-native-push-notifications-1596