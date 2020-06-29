import * as fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as fastifyStatic from 'fastify-static';
import * as path from 'path';
import * as fetch from 'node-fetch';
import * as memoize from 'memoizee';

interface ITournamentResponse {
  title: string;
  additional_title: string;
  sharing_fb?: {
    full: string;
  };
  sharing_tw?: {
    full: string;
  };
}

let API_SERVER: string;

if (!process.env.SERVER_PORT) {
  console.log('\x1b[31m', 'Server port not specified.');
  console.log('\x1b[36m%s\x1b[0m', 'PROMPT: export SERVER_PORT=3000');
  process.exit();
}

if (process.env.API_SERVER) {
  API_SERVER = process.env.API_SERVER;
} else {
  console.log('\x1b[31m', 'API server url not specified.');
  console.log('\x1b[36m%s\x1b[0m', 'PROMPT: export API_SERVER=https://chess.usetech.ru/api/ url should be ended with slash');
  process.exit();
}

const DIST_FILES_DIR = 'dist';
const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({});
server.register(fastifyStatic, {
  root: path.join(__dirname, DIST_FILES_DIR)
});

const pageContent = fs.readFileSync(path.join(DIST_FILES_DIR, 'index.html'), 'utf8');

const getTournamentDataInjectToTemplate = async (tournament: string, url: string) => {
  let metaTags = '';
  let body: ITournamentResponse;

  try {
    let endpoint = '';
    if (url.indexOf('/arena/tournament') === -1) {
      endpoint = `${API_SERVER}tournaments/${tournament}/`;
      if (isNaN(+tournament)) {
        endpoint = `${API_SERVER}tournaments/slug/${tournament}/`;
      }
    } else {
      endpoint = `${API_SERVER}online/tournaments/${tournament}/`;
    }
    const httpResponse = await fetch(endpoint);
    body = await httpResponse.json();
  } catch (error) { }

  if (body && body.title) {
    metaTags += `<meta property="og:title" content="${body.title}" />`;
    metaTags += `<meta property="twitter:title" content="${body.title}" />`;
    metaTags += '<meta name="twitter:card" content="summary_large_image"></meta>';
  }

  if (body && body.additional_title) {
    metaTags += `<meta property="og:description" content="${body.additional_title}" />`;
    metaTags += `<meta property="twitter:description" content="${body.additional_title}" />`;
  }

  if (body && body.sharing_fb && body.sharing_fb.full) {
    metaTags += `<meta property="og:image" content="${body.sharing_fb.full}" />`;
  }

  if (body && body.sharing_tw && body.sharing_tw.full) {
    metaTags += `<meta property="twitter:image" content="${body.sharing_tw.full}" />`;
  }

  metaTags += `<meta property="og:url" content="${url}" />`;

  metaTags += '</head>';
  return metaTags;
  // return new Promise(resolve => resolve(metaTags)); // memoizee почему-то не умеет обработать async функцию.
};

const spaSitePage = (request, reply) => {
  reply.code(200).type('text/html').send(pageContent);
};

const memoizedGetTemplateWithTournament = memoize(getTournamentDataInjectToTemplate, {
  promise: true,
  maxAge: 900000,
  primitive: true,
});

const getTournamentHandler = async (request, reply: fastify.FastifyReply<ServerResponse>) => {
  if (request.params.tournament) {
    const metaTags = await getTournamentDataInjectToTemplate(
      request.params.tournament,
      `${API_SERVER.replace('/api/', '')}${request.req.url}`
    );
    reply.code(200).type('text/html').send(pageContent.replace('</head>', metaTags));
  } else {
    reply.code(200).type('text/html').send(pageContent);
  }
};

server.get('/', spaSitePage);
server.setNotFoundHandler(spaSitePage);
server.get('/tournament/:tournament', getTournamentHandler);
server.get('/tournament/:tournament/*', getTournamentHandler);
server.get('/arena/tournament/:tournament', getTournamentHandler);
server.get('/arena/tournament/:tournament/*', getTournamentHandler);

server.listen(Number(process.env.SERVER_PORT), '0.0.0.0');
