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
    userId: number | undefined,
    friendId: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const Request = await this.friendRepository.findByUserIdAndFriendId(userId, friendId);
    console.log('🔹 Request Id:', Request?.id);
    if (Request) {
      throw new ConflictException('Friend Request already exists');
    }

    await this.friendRepository.create({
      userId,
      friendId,
      status: Status.PENDING,
    });

    return {
      status: STATUS.SUCCESS,
      message: 'Request processed successfully',
    };
  }

  async accept(
    userId: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.friendId !== userId) {
      throw new UnAuthorizedException('You are not authorized to perform this action');
    }
    if (friendRequest.status !== Status.PENDING) {
      throw new ConflictException('Only pending requests can be accepted');
    }

    const updatedFriendRequest = await this.friendRepository.update(id, {
      status: Status.ACCEPTED,
    });

    const reverseRequest = await this.friendRepository.findByUserIdAndFriendId(
      updatedFriendRequest.friendId,
      updatedFriendRequest.userId,
    );

    if (reverseRequest) {
      if (reverseRequest.status !== Status.PENDING) {
        throw new ConflictException('Only pending requests can be accepted');
      }
      await this.friendRepository.update(reverseRequest.id, { status: Status.ACCEPTED });
    } else if (!reverseRequest) {
      await this.friendRepository.create({
        userId: updatedFriendRequest.friendId,
        friendId: updatedFriendRequest.userId,
        status: Status.ACCEPTED,
      });
    }

    return {
      status: STATUS.SUCCESS,
      message: 'Friend request accepted successfully',
    };
  }

  async reject(
    userId: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.friendId !== userId) {
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
    userId: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.userId !== userId) {
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
    userId: number | undefined,
    id: number,
  ): Promise<z.infer<typeof friendResponseSchema>> {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const friendRequest = await this.friendRepository.findById(id);
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }
    if (friendRequest.userId !== userId) {
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

  // async getFriends(userId: number | undefined): Promise<z.infer<typeof friendListResponseSchema>> {
  //   if (!userId) {
  //     throw new NotFoundException('User not found');
  //   }
  // const friends = await this.friendRepository.findByUserIdAndStatus(userId, Status.ACCEPTED);
  // const friendIds = friends.map((f) => f.friendId);
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
