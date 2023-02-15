import { Membership } from "./membership";
import { User } from "./user";

export type Group = {
  id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  name: string;
  description: string;
  image_url: string;
  owner_id: number;
  owner: User;
  memberships?: Membership[];
};