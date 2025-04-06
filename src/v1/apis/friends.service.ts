import { z } from 'zod';

import { STATUS } from '../common/constants/status.js';
import {
  NotFoundException,
  UnAuthorizedException,
  ConflictException,
} from '../common/exceptions/core.error.js';
import FriendRepositoryInterface from '../storage/database/interfaces/friend.repository.interface.js';
import { friendResponseSchema } from './friends.schema.js';
import { Status } from '@prisma/client';

export default class FriendsService {
  constructor(private readonly friendRepository: FriendRepositoryInterface) {}

  async request(
    user_id: number | undefined,
    friend_id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!user_id) {
      throw new NotFoundException('User not found');
    }
    const Request = await this.friendRepository.findByUserIdAndFriendId(user_id, friend_id);
    console.log('🔹 Request Id:', Request?.id);
    if (Request) {
      throw new ConflictException('Friend Request already exists');
    }

    await this.friendRepository.create({
      user_id,
      friend_id,
      status: Status.PENDING,
    });

    return {
      status: STATUS.SUCCESS,
      message: 'Request processed successfully',
    };
  }

  async accept(
    user_id: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!user_id) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.friend_id !== user_id) {
      throw new UnAuthorizedException('You are not authorized to perform this action');
    }
    if (friendRequest.status !== Status.PENDING) {
      throw new ConflictException('Only pending requests can be accepted');
    }

    const updatedFriendRequest = await this.friendRepository.update(id, {
      status: Status.ACCEPTED,
    });

    const reverseRequest = await this.friendRepository.findByUserIdAndFriendId(
      updatedFriendRequest.friend_id,
      updatedFriendRequest.user_id,
    );

    if (reverseRequest) {
      if (reverseRequest.status !== Status.PENDING) {
        throw new ConflictException('Only pending requests can be accepted');
      }
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

  async reject(
    user_id: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!user_id) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.friend_id !== user_id) {
      throw new UnAuthorizedException('You are not authorized to perform this action');
    }
    if (friendRequest.status !== Status.PENDING) {
      throw new ConflictException('Only pending requests can be rejected');
    }

    await this.friendRepository.update(id, {
      status: Status.REJECTED,
    });

    return {
      status: STATUS.SUCCESS,
      message: 'Friend request rejected successfully',
    };
  }

  async block(
    user_id: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!user_id) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.user_id !== user_id) {
      throw new UnAuthorizedException('You are not authorized to perform this action');
    }
    if (friendRequest.status !== Status.ACCEPTED) {
      throw new ConflictException('Only accepted friends can be blocked');
    }

    await this.friendRepository.update(id, { status: Status.BLOCKED });

    return {
      status: STATUS.SUCCESS,
      message: 'Friend has been blocked successfully',
    };
  }

  async unblock(
    user_id: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!user_id) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.user_id !== user_id) {
      throw new UnAuthorizedException('You are not authorized to perform this action');
    }
    if (friendRequest.status !== Status.BLOCKED) {
      throw new ConflictException('Only blocked friends can be unblocked');
    }

    await this.friendRepository.update(id, { status: Status.ACCEPTED });

    return {
      status: STATUS.SUCCESS,
      message: 'Friend has been unblocked successfully',
    };
  }

  // async getFriends(user_id: number | undefined): Promise<z.infer<typeof friendListResponseSchema>> {
  //   if (!user_id) {
  //     throw new NotFoundException('User not found');
  //   }
  // const friends = await this.friendRepository.findByUserIdAndStatus(user_id, Status.ACCEPTED);
  // const friendIds = friends.map((f) => f.friend_id);
  // const friendProfiles = await this.userService.findManyByIds(friendIds);

  // return {
  //   status: STATUS.SUCCESS,
  //   message: 'Friend list retrieved successfully',
  //   data: friendProfiles,
  // };
  // }

  // async listRequests()

  //Friend List의 돋보기 필드->인풋 검증 스키마 필요 string
  //ADD Friendvlfem->->인풋 검증 스키마 필요 string
}
