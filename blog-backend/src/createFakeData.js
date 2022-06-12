// import Post from './models/post';

// export default function createFakeData() {
//   const posts = [...Array(3).keys()].map((i) => ({
//     title: `포스트 #${i}`,
//     body: '과제 선택 이유 블록체인 실습을 진행하는 과제를 받았다. 다양한 주제들 중 나는 DID를 활용한 백신접종증명서 개발을 선택하였다. 그 이유는 다음과 같다. DID는 블록체인 기술 중 현재 실생활에서 접목이 많이 되고 있는 기술이며 (특히 백신접종증명서는 전국민이 질리도록 사용했지 않은가?)해당 과제를 진행하면서 솔리디티 언어를 좀 더 많이 이해할 수 있게 되지 않을까 생각했다.',
//     tags: ['가짜', '데이터'],
//   }));
//   Post.insertMany(posts, (err, docs) => {
//     console.log(docs);
//   });
// }
