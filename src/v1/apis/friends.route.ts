import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { addRoutes, Route } from '../../plugins/router.js';
import FriendsController from './friends.controller.js';
import {
  friendRequestSchema,
  friendResponseSchema,
  actionSchema,
  updateFriendParamsSchema,
} from './friends.schema.js';

export default async function friendsRoutes(fastify: FastifyInstance) {
  const friendsController: FriendsController = fastify.diContainer.resolve('friendsController');

  const routes: Array<Route> = [
    {
      method: 'POST',
      url: '/requests',
      handler: friendsController.request,
      options: {
        schema: {
          tags: ['friends'],
          body: friendRequestSchema,
          response: {
            201: friendResponseSchema,
          },
        },
        auth: true,
      },
    },
    {
      method: 'PATCH',
      url: '/requests/:id',
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const { action } = actionSchema.parse(request.body);
        if (action === 'accept') return friendsController.acceptRequest(request, reply);
        else if (action === 'reject') return friendsController.rejectRequest(request, reply);
      },
      options: {
        schema: {
          tags: ['friends'],
          body: actionSchema,
          params: updateFriendParamsSchema,
          response: {
            200: friendResponseSchema,
          },
        },
        auth: true,
      },
    },
  ];

  await addRoutes(fastify, routes);
}
