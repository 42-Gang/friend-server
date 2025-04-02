import { FastifyReply, FastifyRequest } from 'fastify';
import FriendsService from './friends.service.js';
import { actionSchema, friendRequestSchema, } from './friends.schema.js'

export default class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  request = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = friendRequestSchema.parse(request.body);
      request.log.info(body, 'Friend request received');
      const result = await this.friendsService.request(body);
      reply.status(201).send(result);
    } catch (error) {
      request.log.error(error, 'Error in Friend request');
      reply.status(400).send({ error });
    }
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {};

  accept = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const body = actionSchema.parse(request.body);
      request.log.info(body, 'Accept request received');
      const { id } = request.params;
      const result = await this.friendsService.accept(parseInt(id));
      reply.status(200).send(result);
    } catch (error) {
      request.log.error(error, 'Error in Friend request');
      reply.status(400).send({ error });
    }
  };

}
