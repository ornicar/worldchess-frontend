// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { join } from 'path';
import { access, constants, readFile, readFileSync } from "fs";

import { enableProdMode } from "@angular/core";
import * as fastify from 'fastify';
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';
import { INITIAL_CONFIG, renderModuleFactory } from "@angular/platform-server";

import { REQUEST, RESPONSE } from "@nguniversal/express-engine/tokens";
import { promisify } from "util";

const DIST_FOLDER = join(process.cwd(), 'dist', 'apps', 'skytaxi', 'browser');
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../dist/apps/skytaxi/server/main');
enableProdMode();

const PORT = process.env.PORT || String(4000);
const document = readFileSync(join(DIST_FOLDER, 'index.html')).toString();
const app = fastify();
app.decorateReply('renderNg', function (url) {
  renderModuleFactory(AppServerModuleNgFactory, {
    url,
    document,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP),
      { provide: REQUEST, useValue: this.request },
      { provide: RESPONSE, useValue: this },
      {
        provide: INITIAL_CONFIG,
        useValue: {
          document,
          url,
        }
      },
    ],
  })
    .then(html => {
      this.header('Content-Type', 'text/html').send(html);
    })
  ;
});

const staticCache: Map<string, Buffer> = new Map();

app.get('*', async function(request, reply) {
  if (staticCache.has(request.req.url)) {
    return staticCache.get(request.req.url);
  }
  try {
    const filePath = join(DIST_FOLDER, request.req.url);
    const resp = await promisify(access)(filePath, constants.F_OK);
    const buffer = await promisify(readFile)(filePath);
    staticCache.set(request.req.url, buffer);
    return buffer;
  } catch (e) {
    return reply['renderNg'](request.req.url);
  }
});

app.listen(PORT, function (err) {
  if (err) {
    throw err;
  }

  console.log(`server listening on ${app.server.address().port}`);
});