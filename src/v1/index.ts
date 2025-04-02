import { FastifyInstance } from 'fastify';

import friendsRoutes from './apis/friends.route.js';

export default async function routeV1(fastify: FastifyInstance) {
  fastify.register(friendsRoutes);
}
