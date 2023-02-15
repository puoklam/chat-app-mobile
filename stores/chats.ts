import create from "zustand";
import * as SQLite from "expo-sqlite";
import { Group } from "../models/group";
import { User } from "../models/user";
import fetcher from "../utils/fetcher";

export type DstType = "group" | "personal";

export type Message = {
  id: string;
  from_id: number;
  from_name: string;
  from_image_url?: string;
  dst: number;
  dst_type: DstType;
  content: string;
  timestamp: Date;
};

export type Chat = {
  id: number;
  type: DstType;
  name: string;
  image_url: string;
  unreadCount: number;
  messages: Message[];
};

class ChatNode {
  constructor(public chat: Chat, public prev?: ChatNode, public next?: ChatNode) {}
}

// interface ChatsState {
//   chat: () => Chat | undefined;
//   chats: Chat[];
//   chatsIdx: Map<number, number>;
//   currGroupId?: number;
//   // initGroups: (groups: Group[]) => void;
//   // initPersonals: (users: User[]) => void;
//   initChats: (groups: Group[], users: User[]) => void,
//   addGroup: (group: Group) => void;
//   addPersonal: (user: User) => void;
//   removeGroup: (value: Group | number) => void;
//   receive: (message: Message) => void;
//   setCurrGroupId: (value?: number | ((prev?: number) => number)) => void;
// };

// const db = SQLite.openDatabase("db.im");

// const useChatsStore = create<ChatsState>((set, get) => ({
//   chat: () => {
//     const { chats, chatsIdx, currGroupId } = get();
//     if (currGroupId === undefined) return undefined;
//     const idx = chatsIdx.get(currGroupId);
//     if (idx === undefined) return undefined;
//     return chats[idx];
//   },
//   chats: [],
//   chatsIdx: new Map(),
//   currGroupId: undefined,
//   // initGroups: async (groups) => {
//   //   const chats: Chat[] = [];
//   //   const idx: Map<number, number> = new Map();
//   //   for (const [i, { id, name, image_url }] of groups.entries()) {
//   //     const messages = await getMessages(id, "group");
//   //     const uc = await getUC(id, "group");
//   //     chats.push({
//   //       id,
//   //       name,
//   //       image_url,
//   //       type: "group",
//   //       unreadCount: uc,
//   //       messages: messages
//   //     });
//   //     idx.set(id, i);
//   //   }
//   //   set({
//   //     chats: chats,
//   //     chatsIdx: idx
//   //   });
//   // },
//   initChats: async (groups, users) => {
//     const chats: Chat[] = [];
//     const idx: Map<number, number> = new Map();
//     let i = 0;
//     for (const { id, name, image_url } of groups) {
//       const messages = await getMessages(id, "group");
//       const uc = await getUC(id, "group");
//       chats.push({
//         id,
//         name,
//         image_url,
//         type: "group",
//         unreadCount: uc,
//         messages: messages
//       });
//       idx.set(id, i);
//       i++;
//     }
//     for (const { id, displayname: name, image_url } of users) {
//       const messages = await getMessages(id, "personal");
//       const uc = await getUC(id, "personal");
//       chats.push({
//         id,
//         name,
//         image_url,
//         type: "personal",
//         unreadCount: uc,
//         messages: messages
//       });
//       idx.set(id, i);
//       i++;
//     }
//     set({
//       chats: chats,
//       chatsIdx: idx
//     });
//   },
//   addGroup: (group) => set(({ chats, chatsIdx }) => {
//       if (chatsIdx.has(group.id)) return {};
//       const chat: Chat = {
//         id: group.id,
//         type: "group",
//         name: group.name,
//         image_url: group.image_url,
//         unreadCount: 0,
//         messages: []
//       };
//       const idx = chats.length;
//       chatsIdx.set(chat.id, idx);
//       chats.push(chat);
//       return {
//         chats,
//         chatsIdx
//       };
//   }),
//   addPersonal: (user) => set(({ chats, chatsIdx }) => {
//     if (chatsIdx.has(user.id)) return {};
//     const chat: Chat = {
//       id: group.id,
//       type: "group",
//       name: group.name,
//       image_url: group.image_url,
//       unreadCount: 0,
//       messages: []
//     };
//     const idx = chats.length;
//     chatsIdx.set(chat.id, idx);
//     chats.push(chat);
//     return {
//       chats,
//       chatsIdx
//     };
//   }),
//   removeGroup: (value) => set(({ chats, chatsIdx }) => {
//     const id = typeof value === "number" ? value : value.id;
//     const idx = chatsIdx.get(id);
//     if (idx === undefined) return {};
//     chatsIdx.delete(id);
//     for (let i = idx + 1; i < chats.length; i++) {
//       chatsIdx.set(chats[i].id, i - 1);
//     }
//     return {
//       chats: [...chats.slice(0, idx), ...chats.slice(idx + 1)],
//       chatsIdx: chatsIdx
//     };
//   }),
//   receive: async (message) => {
//     const { chats, chatsIdx, currGroupId } = get();
//     let chat: Chat;
//     let idx = chatsIdx.get(message.dst) ?? chats.length;
//     if (idx === chats.length) {
//       chatsIdx.set(message.dst, idx);
//       try {
//         const resp = await fetcher.get(`groups/${message.dst}`);
//         const json = await resp.json();
//         const messages = await getMessages(message.dst, message.dst_type);
//         const uc = await getUC(message.dst, message.dst_type);
//         chat = {
//           id: message.dst,
//           type: message.dst_type,
//           name: json["name"],
//           // TODO: get image url
//           image_url: "https://cencup.com/wp-content/uploads/2019/07/avatar-placeholder.png",
//           unreadCount: uc,
//           messages: messages
//         };
//       } catch(e) {
//         console.log(e);
//         return;
//       }
//     } else {
//       chat = chats[idx];
//     }
//     if (chat.id !== currGroupId) {
//       chat.unreadCount++;
//       incUC(chat.id, chat.type);
//     }
//     // setStorage(chat.id, message.dst_type, message);
//     saveMessage(message);
//     chat.messages.push(message);
//     set({
//       chats: [...chats.slice(0, idx), chat, ...chats.slice(idx + 1)],
//       chatsIdx
//     });
//   },
//   setCurrGroupId: (value) => set(({ chats, chatsIdx, currGroupId }) => {
//     const id = typeof value === "function" ? value.call(this, currGroupId) : value;
//     if (id === undefined) return { currGroupId: undefined };
//     const idx = chatsIdx.get(id);
//     if (idx == undefined) return { currGroupId: id };
//     const chat = chats[idx];
//     chat.unreadCount = 0;
//     clearUC(chat.id, chat.type);
//     return {
//       chats: [...chats.slice(0, idx), chat, ...chats.slice(idx + 1)],
//       currGroupId: id
//     };
//   })
// }));



interface ChatsState {
  head: ChatNode;
  currId: number;
  currType: DstType;
  getChat: (id: number, type: DstType) => Chat | undefined;
  listChats: () => Chat[];
  setCurrentChat: (user: User, id: number, type: DstType) => void;
  map: Map<string, ChatNode>
  initChats: (user: User) => void;
  addChat: (chat: Chat, user: User) => void;
  removeChat: (id: number, type: DstType) => void;
  receive: (message: Message, user: User) => void;
};

const db = SQLite.openDatabase("db.im");

const useChatsStore = create<ChatsState>((set, get) => ({
  head: new ChatNode({ id: -1, type: "personal", name: "", image_url: "", unreadCount: 0, messages: [] }, undefined, undefined),
  currId: -1,
  currType: "personal",
  getChat: (id, type) => {
    const key = `${type}:${id}`;
    const node = get().map.get(key);
    return node?.chat;
  },
  listChats: () => {
    const chats: Chat[] = [];
    let curr = get().head.next;
    while (curr !== undefined) {
      chats.push(curr.chat);
      curr = curr.next;
    }
    return chats;
  },
  setCurrentChat: (user, id, type) => set(({ head, getChat }) => {
    const chat = getChat(id, type);
    if (chat === undefined) return { currId: id, currType: type };
    chat.unreadCount = 0;
    clearUC(user.id, chat.id, chat.type);
    return {
      head: { ...head },
      currId: id,
      currType: type
    };
  }),
  map: new Map<string, ChatNode>,
  initChats: async (user: User) => {
    const { head, map } = get();
    let curr = head;
    curr.next = undefined;
    const chats = await listUC(user);
    for (const [i, { dst: id, dst_type: type, count }] of chats.entries()) {
      try {
        const messages = await getMessages(user.id, id, type);
        const resp = await fetcher.get(`${type === "group" ? "groups" : "users"}/${id}`);
        const json = await resp.json();
        const node = new ChatNode(
          {
            id,
            type,
            name: type === "group" ? json["name"] : json["displayname"],
            image_url: json["image_url"],
            unreadCount: count,
            messages: messages
          },
          curr,
          undefined
        );
        curr.next = node;
        const key = `${type}:${id}`;
        map.set(key, node);
        curr = curr.next;
      } catch(e) {
        console.log(e);
      }
    }
    set({
      head: { ...head },
      map
    });
  },
  addChat: (chat: Chat, user: User) => set(({ head, map }) => {
    const { id, type } = chat;
    const key = `${type}:${id}`;
    if (map.get(key) !== undefined) return {};
    const node = new ChatNode(chat, head, head.next);
    if (head.next !== undefined) {
      head.next.prev = node;
    }
    head.next = node;
    map.set(key, node);
    incUC(user.id, id, type);
    return {
      head: { ...head },
      map: map
    };
  }),
  removeChat: () => {

  },
  receive: async (message, user) => {
    const { head, map, currId, currType } = get();
    const id = message.dst;
    const type = message.dst_type;
    const key = `${type}:${id}`;
    let chat = map.get(key)?.chat;
    if (chat === undefined) {
      try {
        const resp = await fetcher.get(`${message.dst_type === "group" ? "groups" : "users"}/${message.dst}`);
        const json: Group | User = await resp.json();
        const messages = await getMessages(user.id, message.dst, message.dst_type);
        const uc = await getUC(user.id, message.dst, message.dst_type);
        chat = {
          id,
          type,
          name: "name" in json ? json.name : json.displayname,
          image_url: json.image_url,
          unreadCount: uc,
          messages: messages
        };
      } catch(e) {
        console.log(e);
        return;
      }
      const node = new ChatNode(chat, head, head.next);
      if (head.next !== undefined) {
        head.next.prev = node;
      }
      head.next = node;
      map.set(key, node);
    }
    if (chat.id !== currId || chat.type !== currType) {
      chat.unreadCount++;
      incUC(user.id, chat.id, chat.type);
    }
    saveMessage(message, user.id);
    chat.messages.push(message);
    set({
      head: { ...head },
      map
    });
  }
}));

const listUC = (user: User) => new Promise<{ dst: number, dst_type: DstType, count: number }[]>((resolve, reject) => db.transaction(
  (tx) => tx.executeSql(
    "SELECT * FROM unread_count where user_id = ?",
    [user.id],
    (_, { rows: {_array } }) => resolve(_array),
    (_, err) => {
      reject(err);
      return false;
    },
  ),
  (err) => reject(err)
));

const getUC = (user_id: number, dst: number, dst_type: DstType) => new Promise<number>((resolve, reject) => db.transaction(
  (tx) => tx.executeSql(
    "SELECT count FROM unread_count WHERE user_id = ? AND dst = ? AND dst_type = ?",
    [user_id, dst, dst_type],
    (_, { rows: { _array } }) => resolve(_array?.[0]?.count ?? 0),
    (_, err) => {
      reject(err);
      return false;
    }
  ),
  (err) => reject(err)
));

const clearUC = (user_id: number, dst: number, dst_type: DstType) => db.transaction(
  (tx) => tx.executeSql(
    "UPDATE unread_count SET count = 0 WHERE user_id = ? AND dst = ? AND dst_type = ?",
    [user_id, dst, dst_type]
  ),
  (err) => console.log(err)
);

const incUC = (user_id: number, dst: number, dst_type: DstType) => db.transaction(
  (tx) => tx.executeSql(
    "INSERT INTO unread_count(user_id, dst, dst_type, count) VALUES(?, ?, ?, ?) ON CONFLICT(user_id, dst, dst_type) DO UPDATE SET count = count + 1",
    [user_id, dst, dst_type, 0],
    undefined,
    (_, err) => {
      console.log(err);
      return false;
    }
  ),
  (err) => console.log(err)
);

const getMessages = (user_id: number, id: number, type: DstType) => new Promise<Message[]>((resolve, reject) => db.transaction(
  (tx) => tx.executeSql(
    "SELECT * FROM messages WHERE user_id = ? AND dst = ? AND dst_type = ? ORDER BY timestamp ASC LIMIT 200;",
    [user_id, id, type],
    (_, { rows: { _array } }) => resolve(_array),
    (_, err) => {
      reject(err);
      return false;
    }
  ),
  (err) => reject(err)
));

const saveMessage = ({ id, from_id, from_name, from_image_url, dst, dst_type, content, timestamp }: Message, user_id: number) => db.transaction(
  (tx) => tx.executeSql(
    "INSERT INTO messages (id, user_id, from_id, from_name, from_image_url, dst, dst_type, content, timestamp) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);",
    [id, user_id, from_id, from_name, from_image_url ?? "", dst, dst_type, content, timestamp.toISOString()]
  ),
  (err) => console.log(err)
);

export default useChatsStore;
export { db };