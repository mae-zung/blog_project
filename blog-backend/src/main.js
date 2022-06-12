require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import api from './api';
//import createFakeData from './createFakeData';
import jwtMiddleware from './lib/jwtMiddleware';

const { PORT, MONGO_URI } = process.env;

const app = new Koa();
const router = new Router();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB에 커넥됨');
    // createFakeData();
  })
  .catch((e) => {
    console.error(e);
  });

// 라우터 설정
router.get('/', (ctx) => {
  ctx.body = '홈';
});

router.use('/api', api.routes());

router.get('/about/:name?', (ctx) => {
  const { name } = ctx.params;
  ctx.body = name ? `${name}의 소개` : `소개`;
});

router.get('/posts', (ctx) => {
  const { id } = ctx.query;
  ctx.body = id ? `포스트 #${id}` : `포스트 아이디가 없습니다.`;
});

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
// 라우터 적용 전에 jwtMiddleware 적용
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port %d', port);
});
