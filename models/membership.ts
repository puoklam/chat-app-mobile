import { Group } from "./group";
import { User } from "./user";

export type Membership = {
  user_id: number;
  group_id: number;
  created_at: Date;
  status: string;
  user: User;
  group: Group;
};

