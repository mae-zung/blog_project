import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  try {
    const post = await Post.findById(id);
    //포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// POST /api/posts
// {
//   title: '제목',
//   body: '내용',
//   tags: ['태그1', '태그2']
// }

export const write = async (ctx) => {
  const schema = Joi.object().keys({
    //객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(), //문자열로 이루어진 배열
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  const { title, body, tags } = ctx.request.body;
  // 포스트 인스턴스를 만듦
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    // save() 함수를 실행시켜 데이터베이스에 저장
    // 반환 값이 Promise 이므로 async/await 문법으로 저장이 완료될 때까지 await를 사용해 대기함.
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET /api/posts

export const list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // username 또는 tag 값이 유효할 때만 객체 안에 해당 값을 넣겠다는 것을 의미
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };
  try {
    // 데이터 조회 시에는 모델 인스턴스의 find() 함수를 사용한다.
    // find() 함수를 호출한 후에는 exec()을 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find()
      .limit(10)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts
      .map((post) => post.toJSON())
      .map((post) => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

// GET /api/posts/:id

export const read = async (ctx) => {
  ctx.body = ctx.state.post;
};

// DELETE /api/posts/:id
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// PATCH /api/posts/:id
// {
//   title:'수정',
//   body: '수정 내용',
//   tags: ['수정', '태그']
// }
export const update = async (ctx) => {
  const { id } = ctx.params;
  const schema = Joi.object().keys({
    //객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()), //문자열로 이루어진 배열
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 업데이트된 데이터를 반환, false일 때는 업데이트 되기 전의 데이터를 반환
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// id로 찾은 포스트가 로그인 중인 사용자가 작성한 포스트인지 확인
export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  // 몽고DB에서 조회한 데이터의 id값을 문자열과 비교할 때는 반드시 .toString()을 해주어야 함.
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};
