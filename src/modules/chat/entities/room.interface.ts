import { User } from "src/modules/users/entities/user.entity";

export interface Room {
  id?: string;
  participants?:User[];
  created_at?:Date;
  updated_at?:Date;
}