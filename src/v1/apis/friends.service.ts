import { z } from 'zod';

import { STATUS } from '../common/constants/status.js';
import { NotFoundException } from '../common/exceptions/core.error.js';
import FriendRepositoryInterface from '../storage/database/interfaces/friend.repository.interface.js';
import {
  friendCreateSchema,
  friendResponseSchema,
  friendListResponseSchema,
} from './friends.schema.js';
import { Status } from '@prisma/client';

export default class FriendsService {
  constructor(private readonly friendRepository: FriendRepositoryInterface) {}

  async request(
    data: z.infer<typeof friendCreateSchema>,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    await this.friendRepository.create({
      user_id: data.user_id,
      friend_id: data.friend_id,
      status: Status.PENDING,
    });

    return {
      status: STATUS.SUCCESS,
      message: 'Request processed successfully',
    };
  }

  async accept(id: number): Promise<z.infer<typeof friendResponseSchema>> {
    const updatedFriendRequest = await this.friendRepository.update(id, {
      status: Status.ACCEPTED,
    });

    const reverseRequest = await this.friendRepository.findByUserIdAndFriendId(
      updatedFriendRequest.friend_id,
      updatedFriendRequest.user_id,
    );

    if (reverseRequest) {
      await this.friendRepository.update(reverseRequest.id, { status: Status.ACCEPTED });
    } else if (!reverseRequest) {
      await this.friendRepository.create({
        user_id: updatedFriendRequest.friend_id,
        friend_id: updatedFriendRequest.user_id,
        status: Status.ACCEPTED,
      });
    }

    return {
      status: STATUS.SUCCESS,
      message: 'Friend request accepted successfully',
    };
  }

  async reject(id: number): Promise<z.infer<typeof friendResponseSchema>> {
    const updatedFriend = await this.friendRepository.update(id, {
      status: Status.REJECTED,
    });

    if (!updatedFriend) {
      throw new NotFoundException('Friend request not found');
    }

    return {
      status: STATUS.SUCCESS,
      message: 'Friend request rejected successfully',
    };
  }

  async block(id: number): Promise<z.infer<typeof friendResponseSchema>> {
    const updatedFriend = await this.friendRepository.update(id, { status: Status.BLOCKED });

    if (!updatedFriend) {
      throw new NotFoundException('Friend not found');
    }

    return {
      status: STATUS.SUCCESS,
      message: 'Friend has been blocked successfully',
    };
  }

  async unblock(id: number): Promise<z.infer<typeof friendResponseSchema>> {
    const updatedFriend = await this.friendRepository.update(id, { status: Status.ACCEPTED });

    if (!updatedFriend) {
      throw new NotFoundException('Friend not found');
    }

    return {
      status: STATUS.SUCCESS,
      message: 'Friend has been unblocked successfully',
    };
  }

  async listFriends(user_id: number): Promise<z.infer<typeof friendListResponseSchema>> {
    const friends = await this.friendRepository.findByUserIdAndStatus(user_id, Status.ACCEPTED);

    return {
      status: STATUS.SUCCESS,
      message: 'Friend list retrieved successfully',
      data: friends,
    };
  }

  // async listRequests()

  //Friend List의 돋보기 필드->인풋 검증 스키마 필요 string
  //ADD Friendvlfem->->인풋 검증 스키마 필요 string
}
