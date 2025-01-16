// import type { Core } from '@strapi/strapi';
import { v4 as uuidv4 } from 'uuid';
import { timeStamp } from "console";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: any }) {
    if (!strapi.io) {
      const io = require('socket.io')(strapi.server.httpServer, {
        cors: {
          origin: 'hhttps://chat-app-drab-delta.vercel.app/', 
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Start new chat session with user association
        socket.on('startNewChat', async ({ user }) => {
          const sessionId = uuidv4(); // Generate a unique session ID
          // console.log('Starting new chat for user:', user);

          // Save the session with userId
          await strapi.db.query('api::session.session').create({
            data: {
              sessionId,
              createdAt: new Date(),
              lastMessage: '', // Initially no message
              messagesCount: 0,
              userId: user.id, // Save user ID when creating session
            },
          });

          // Emit the new session ID to the frontend
          socket.emit('newSessionStarted', { sessionId });
        });

        // Fetch all sessions (filtered by the current logged-in user)
        socket.on('getSessionList', async ({ user }) => {
          // Fetch sessions only for the current logged-in user
          const sessions = await strapi.db.query('api::session.session').findMany({
            where: { userId: { id: user.id } }, // Filter by userId (socket.user.id is assumed to be set)
          });
          socket.emit('sessionList', sessions); // Send the session list to the client
        });

        // Fetch chat history for a session
        socket.on('loadChatHistoryForSession', async (sessionId) => {
          // console.log('Fetching chat history for session:', sessionId);
          const session = await strapi.db.query('api::session.session').findOne({
            where: { sessionId: sessionId },
          });

          const messages = await strapi.db.query('api::message.message').findMany({
            where: { sessionId: { id: session?.id } },
            limit: 100,
          });

          socket.emit('loadChatHistory', messages); // Send the chat history to the client
        });

        // Handle incoming messages
        socket.on('sendMessage', async (message) => {
          const { content, sender, sessionId } = message;

          const session = await strapi.db.query('api::session.session').findOne({
            where: { sessionId: sessionId },
          });

          if (!session) {
            throw new Error('Session not found');
          }

          // Save the message
          const savedMessage = await strapi.db.query('api::message.message').create({
            data: {
              content,
              timestamp: new Date(),
              sender: sender.id, // Ensure the sender ID is correctly saved
              sessionId: session.id,
            },
          });

          // Update session metadata (last message and message count)
          const messageCount = await strapi.db.query('api::message.message').count({
            where: { sessionId: { id: session.id } },
          });

          await strapi.db.query('api::session.session').update({
            where: { id: session.id },
            data: {
              lastMessage: content,
              messagesCount: messageCount,
            },
          });

          // Broadcast the message to all clients
          io.emit('receiveMessage', { message: savedMessage.content, sender: sender.id });
        });

        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });

      strapi.io = io;
      console.log('Socket.IO server initialized');
    } else {
      console.log('Socket.IO server already initialized');
    }
  },
};
