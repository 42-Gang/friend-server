import { FastifyReply, FastifyRequest } from 'fastify';
import { Status } from '@prisma/client';
import FriendsService from './friends.service.js';
import { friendRequestSchema, updateFriendParamsSchema } from './friends.schema.js';

export default class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  request = async (request: FastifyRequest, reply: FastifyReply) => {
    const user_id = request.userId;
    const body = friendRequestSchema.parse(request.body);
    const data = {
      user_id: Number(user_id),
      friend_id: body.friend_id,
      status: Status.PENDING,
    };
    request.log.info(body, 'Friend request received');
    const result = await this.friendsService.request(data);
    reply.status(201).send(result);
  };

  acceptRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = updateFriendParamsSchema.parse(request.params);
    request.log.info('Friend request has been accepted');
    const result = await this.friendsService.accept(params.id);
    reply.status(200).send(result);
  };

  rejectRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = updateFriendParamsSchema.parse(request.params);
    request.log.info('Friend request has been rejected');
    const result = await this.friendsService.reject(params.id);
    reply.status(200).send(result);
  };
}
