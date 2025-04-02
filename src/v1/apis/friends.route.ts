import { FastifyInstance } from 'fastify';

import { addRoutes, Route } from '../../plugins/router.js';
import FriendsController from './friends.controller.js'
import { friendRequestSchema, friendResponseSchema, actionSchema } from './friends.schema.js'

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
      options: {
        schema: {
          tags: ['friends'],
          body: actionSchema,
          response: {
            200: friendResponseSchema,
          },
        },
      },
      handler: async (request, reply) => {
        const { action } = actionSchema.parse(request.body);

        if (action === 'reject')
          return friendsController.reject;
        else if (action === 'accept')
          return friendsController.accept;
      },
    },
    // {

    // },
  ];
  await addRoutes(fastify, routes);
}
