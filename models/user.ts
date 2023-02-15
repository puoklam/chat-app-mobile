import { Group } from "./group";
import { Membership } from "./membership";

export type User = {
  id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  username: string;
  displayname: string;
  image_url: string;
  bio: string;
  memberships: Membership[];
};

export type RelStatus = "default" | "removed" | "accepted" | "blocked";

export type Profile = {
  displayname: string;
  image_url: string;
  bio: string;
};