import { Prisma, Friend, Status } from '@prisma/client';
import { BaseRepositoryInterface } from './base.repository.interface.js';

export default interface FriendRepositoryInterface
  extends BaseRepositoryInterface<Friend, Prisma.FriendCreateInput, Prisma.FriendUpdateInput> {
  findByUserIdAndStatus(userId: number, status: Status): Promise<Friend[]>;
  findByFriendIdAndStatus(friendId: number, status: Status): Promise<Friend[]>;
  findByUserIdAndFriendId(userId: number, friendId: number): Promise<Friend | null>;
}
