  export default [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::cors',
      config: {
        enabled: true,
        origin: ['https://chat-app-drab-delta.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], 
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'], 
        keepHeaderOnError: true,
        credentials: true 
      },
    },
    'strapi::security',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
