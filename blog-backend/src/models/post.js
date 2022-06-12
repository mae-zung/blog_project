import mongoose from 'mongoose';

const { Schema } = mongoose;
const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String], //문자열로 이루어진 배열
  publishedDate: {
    type: Date,
    default: Date.now, //현재 날짜를 기본값으로 지정
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

// 모델 인스턴스를 만들어 export default를 통해 내보내 주었음
const Post = mongoose.model('Post', PostSchema); //--> 'Post': 스키마 이름, 'PostSchema': 스키마 객체
export default Post;
