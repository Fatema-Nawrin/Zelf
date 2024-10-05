const fs = require('fs');
async function analyzeData() {
  let file = await fs.readFileSync('./data.json');
  let data = JSON.parse(file);
  let top_influencer = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    let followers = element.author_info.follower_count;
    let followerNumberInK = parseInt(followers.split('K')[0]);
    let likeCount = element.author_info.like_count;
    let likeCountInM = parseInt(likeCount.split('M')[0]);
    if (followers.includes('M') || followerNumberInK > 100) {
      if (likeCount.includes('M') && likeCountInM > 1) {
        top_influencer.push(element);
      }
    }
  }
  fs.writeFileSync('./top_influencer.json', JSON.stringify(top_influencer));
}

analyzeData();
