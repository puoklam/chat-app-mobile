import { useEffect, useRef, useState } from 'react';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking, NativeEventSubscription, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { register } from "./utils/notifications";
import useAuthStore from './stores/auth';
import Routes from './route';
import useChatsStore, { db, Message } from './stores/chats';
import { ChatParams } from './navigation/param';
import { StatusBar } from 'expo-status-bar';
import ThemeProvider from './providers/theme';
import fetcher from './utils/fetcher';
import { User } from './models/user';

// https://stackoverflow.com/questions/62768520/reconnecting-web-socket-using-react-hooks
// https://stackoverflow.com/questions/48619631/websocket-call-close-wont-trigger-onclose-handler
class WS {
  user: User;
  client?: WebSocket;
  unmount: boolean;

  reconnect(onReceive: (message: Message, user: User) => void) {
    this.client?.close();
    const ws = fetcher.ws("");
    this.client = ws;
    ws.onerror = (e) => {
      console.log(e);
      // ws.close(1000, "error occur, maybe 401");
    };
    ws.onmessage = (e) => {
      const { timestamp, ...others } = JSON.parse(e.data);
      const message: Message = {
        ...others,
        timestamp: new Date(timestamp / 1000000)
      };
      onReceive(message, this.user);
    };
    ws.onclose = (e) => {
      console.log(`ws connection closed ${e.reason}`);
      if (e.code === undefined) return;
      if (this.unmount) return;
      this.reconnect(onReceive);
    };
    ws.onopen = (e) => {
      console.log("connected");
    };
  }
  connect(resolve: (value: WS | PromiseLike<WS>) => void, onReceive: (message: Message, usr: User) => void) {
    const ws = fetcher.ws("");
    this.client = ws;
    ws.onerror = (e) => {
      console.log(e);
      // ws.close(1000, "error occur, maybe 401");
    };
    ws.onmessage = (e) => {
      const { timestamp, ...others } = JSON.parse(e.data);
      const message: Message = {
        ...others,
        timestamp: new Date(timestamp / 1000000)
      };
      onReceive(message, this.user);
    };
    ws.onclose = (e) => {
      // console.log(e.code);
      console.log(`ws connection closed ${e.reason}`);
      if (e.code === undefined) return;
      if (this.unmount) return;
      this.reconnect(onReceive);
    };
    ws.onopen = (e) => {
      console.log("connected");
      resolve(this);
    };
  }
  constructor(user: User) {
    this.unmount = false;
    this.client = undefined;
    this.user = user;
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true
  })
});

const stack = createNativeStackNavigator();

export default function App() {
  const { token, user, me, setPushToken } = useAuthStore();
  const { initChats, receive, setCurrentChat } = useChatsStore();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notiListener = useRef<NativeEventSubscription>();
  const respListener = useRef<NativeEventSubscription>();

  useEffect(() => {
    (async () => {
      const token = await register();
      // alert(token);
      setPushToken(token);
      notiListener.current = Notifications.addNotificationReceivedListener((noti) => {
        setNotification(noti);
      })
      respListener.current = Notifications.addNotificationResponseReceivedListener((resp) => {
        console.log(resp);
      })
    })();
    return () => {
      if (notiListener.current) {
        Notifications.removeNotificationSubscription(notiListener.current);
      }
      if (respListener.current) {
        Notifications.removeNotificationSubscription(respListener.current);
      }
    };
  }, []);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS messages (id text, user_id integer, from_id integer, from_name text, from_image_url text, dst integer, dst_type text, content text, timestamp datetime);"
      );
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS unread_count (user_id integer, dst integer, dst_type text, count integer, PRIMARY KEY (user_id, dst, dst_type));"
      );
    });
  }, []);

  useEffect(() => {
    me();
  }, [token]);

  useEffect(() => {
    if (user === undefined) return;

    // const groups = user.memberships.map((membership) => membership.group);
    // initGroups(groups);
    initChats(user);

    const connect = (user: User): Promise<WS> => new Promise((resolve, reject) => {
      const ws = new WS(user);
      ws.connect(resolve, receive);
    });
    
    const conn = connect(user);

    return () => {
      conn.then((ws) => {
        ws.unmount = true;
        ws.client?.close();
      });
    };
  }, [user?.id]);

  return (
    <ThemeProvider>
      <NavigationContainer
        linking={{
          // config: {

          // }
          prefixes: [
            "im://"
          ],
          // getInitialURL: async () => {
          //   let url = await Linking.getInitialURL();
          //   if (url != null) {
          //     return url;
          //   }
          //   const resp = await Notifications.getLastNotificationResponseAsync();
          //   url = resp?.notification.request.content.data["url"] as string | null;
          //   return url;
          // },
          // subscribe: (listener) => {
          //   const onReceiveURL = ({ url }: { url: string }) => listener(url);
          //   Linking.addEventListener("url", onReceiveURL);
          //   const subs = Notifications.addNotificationResponseReceivedListener((resp) => {
          //     const url = resp.notification.request.content.data["url"] as string | null;
          //     if (url) {
          //       listener(url);
          //     }
          //   });

          //   return () => {
          //     Linking.removeAllListeners("url");
          //     subs.remove();
          //   }
          // }
        }}
        onStateChange={(state) => {
          if (user === undefined) return;
          const len = state?.routes.length;
          if (!len) return;
          const last = state.routes[len - 1];
          if (last.name !== "Chat") {
            setCurrentChat(user, -1, "personal");
            // setCurrGroupId(undefined);
            return;
          }
          const params = last.params as ChatParams;
          // setCurrGroupId(params.id);
          setCurrentChat(user, params.id, params.type);
        }}
      >
        <StatusBar style="auto" />
        <Routes />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// https://stackoverflow.com/questions/71831601/ts2786-component-cannot-be-used-as-a-jsx-component
// https://stackoverflow.com/questions/71852153/type-is-not-assignable-to-type-reactnode
// https://stackoverflow.com/questions/71791347/npm-package-cannot-be-used-as-a-jsx-component-type-errors/71828113#71828113
// https://github.com/redwoodjs/redwood/issues/5104
// https://ithelp.ithome.com.tw/articles/10278318