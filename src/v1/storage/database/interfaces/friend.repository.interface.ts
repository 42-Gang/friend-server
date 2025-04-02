import { Prisma, Friend, Status } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface FriendRepositoryInterface
  extends BaseRepositoryInterface<Friend, Prisma.FriendCreateInput, Prisma.FriendUpdateInput> {
  findByUserIdAndStatus(user_id: number, status: Status): Promise<Friend[]>;
  findByFriendIdAndStatus(friend_id: number, status: Status): Promise<Friend[]>;
  findByUserIdAndFriendId(user_id: number, friend_id: number): Promise<Friend | null>;
}
