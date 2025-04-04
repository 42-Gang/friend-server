import { FastifyInstance } from 'fastify';

import { addRoutes, Route } from '../../plugins/router.js';
import FriendsController from './friends.controller.js'
import { friendRequestSchema, friendResponseSchema, actionSchema, updateFriendParamsSchema } from './friends.schema.js'

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
      },
    },
    {
      method: 'PATCH',
      url: '/requests/:id',
      handler: friendsController.processRequest,
      options: {
        schema: {
          tags: ['friends'],
          body: actionSchema,
          params: updateFriendParamsSchema,
          response: {
            200: friendResponseSchema,
          },
        },
      },
    },
    // {

    // },
  ];

  await addRoutes(fastify, routes);
}
