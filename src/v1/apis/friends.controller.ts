import { FastifyReply, FastifyRequest } from 'fastify';
import { Status } from '@prisma/client';
import FriendsService from './friends.service.js';
import { actionSchema, friendRequestSchema, updateFriendParamsSchema } from './friends.schema.js'

export default class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  request = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
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
    } catch (error) {
      request.log.error(error, 'Error in Friend request');
      reply.status(400).send({ error });
    }
  };

  processRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
      const params = updateFriendParamsSchema.parse(request.params);
      const { action } = actionSchema.parse(request.body);

      let result;
      if (action === 'reject')
        result = await this.friendsService.reject(params.id);
      else if (action === 'accept')
        result = await this.friendsService.accept(params.id);
      request.log.info(`Friend request has been ${action === 'accept' ? 'accepted' : 'rejected'}.`);
      reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, 'Error in Friend request');
      reply.status(400).send({ error });
  }
  };
}
