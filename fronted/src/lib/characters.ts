import { Character } from '@/types/character'

// 角色数据库
export const charactersDatabase: Record<string, Character> = {
  '1': {
    id: '1',
    name: '小樱',
    description: '温柔善良的魔法少女，总是带着治愈的笑容。\n擅长倾听他人的烦恼，用温暖的话语抚慰人心。',
    story: `小樱是一位拥有神奇魔法力量的少女，她的内心纯净如水晶般透明。从小就展现出对他人痛苦的敏感和同理心，总是能够察觉到身边人的情绪变化。

她相信每个人心中都有一片温暖的净土，只是有时候被生活的阴霾遮蔽了。通过她的魔法和温柔的话语，她帮助人们重新找回内心的光明。

在她的世界里，没有解决不了的烦恼，只有还没有找到合适方法的心灵。她愿意用自己的时间和耐心，陪伴每一个需要帮助的人走过人生的低谷。`,
    avatar: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg',
    rating: 4.9,
    likes: '8.9k',
    messages: '2.1k',
    tags: ['魔法少女', '治愈系', '温柔', '善良', '倾听者', '动漫角色'],
    isOnline: true,
    category: '动漫角色',
    conversations: [
      { time: '今天 14:30', preview: '谢谢你的鼓励，我感觉好多了...' },
      { time: '昨天 20:15', preview: '你说得对，我应该更相信自己' },
      { time: '3天前', preview: '和你聊天总是让我很放松' }
    ],
    similarCharacters: [
      { name: '子期', image: 'https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg' },
      { name: '艾米医生', image: 'https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg' },
      { name: '小魔女', image: 'https://static.paraflowcontent.com/public/resource/image/9975f440-e846-48e9-8dc0-93b4b7d5a454.jpeg' }
    ]
  },
  '2': {
    id: '2',
    name: '子期',
    description: '温文尔雅的古代文人，善于倾听内心声音。\n博学多才，总能用诗词歌赋表达深刻的人生感悟。',
    story: `子期是一位来自古代的文人雅士，他博览群书，精通诗词歌赋。在那个充满诗意的年代，他以其深厚的文学造诣和温和的性格赢得了众人的敬重。

他相信文字的力量能够治愈人心，每当有人向他倾诉烦恼时，他总能用恰当的诗句或典故来开导对方。他的话语如春风化雨，润物无声地滋养着每一个迷茫的心灵。

在现代社会中，子期依然保持着那份古典的优雅和智慧，他用传统文化的精髓来帮助现代人找到内心的平静与方向。`,
    avatar: 'https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg',
    rating: 4.8,
    likes: '7.2k',
    messages: '1.8k',
    tags: ['古代文人', '博学', '诗词', '温文尔雅', '智慧', '文学角色'],
    isOnline: true,
    category: '文学角色',
    conversations: [
      { time: '今天 16:45', preview: '这首诗的意境很美，让我想起了...' },
      { time: '昨天 21:30', preview: '古人云：山重水复疑无路，柳暗花明又一村' },
      { time: '2天前', preview: '人生如诗，需要细细品味其中的韵味' }
    ],
    similarCharacters: [
      { name: '小樱', image: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg' },
      { name: '李白', image: 'https://static.paraflowcontent.com/public/resource/image/6c76dadc-0b42-488e-8ea3-0b02531946d4.jpeg' },
      { name: '艾米医生', image: 'https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg' }
    ]
  },
  '3': {
    id: '3',
    name: '心理医生艾米',
    description: '专业的心理咨询师，耐心聆听每个故事。\n拥有丰富的临床经验，善于用科学的方法帮助他人。',
    story: `艾米医生是一位经验丰富的心理咨询师，她在心理学领域深耕多年，帮助过无数来访者走出心理困境。她深知每个人的内心世界都是独特而复杂的，因此总是以最大的耐心和专业态度对待每一位来访者。

她的咨询室温馨而安全，让人感到放松和信任。艾米医生善于运用各种心理治疗技术，包括认知行为疗法、人本主义疗法等，为不同的来访者提供个性化的治疗方案。

除了专业技能，艾米医生更以她的同理心和温暖著称。她相信每个人都有自我治愈的能力，她的作用就是帮助人们发现并激活这种内在的力量。`,
    avatar: 'https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg',
    rating: 4.9,
    likes: '6.5k',
    messages: '3.2k',
    tags: ['心理医生', '专业', '耐心', '科学', '治疗师', '现代角色'],
    isOnline: false,
    category: '治愈系',
    conversations: [
      { time: '今天 10:30', preview: '你的感受是完全可以理解的，让我们一起探讨...' },
      { time: '昨天 14:20', preview: '这种情况在心理学上有一个专业术语...' },
      { time: '3天前', preview: '记住，寻求帮助是勇敢的表现，不是软弱' }
    ],
    similarCharacters: [
      { name: '小樱', image: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg' },
      { name: '南丁格尔', image: 'https://static.paraflowcontent.com/public/resource/image/4c6d72fc-2430-4cd4-923c-9b037a28c86b.jpeg' },
      { name: '子期', image: 'https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg' }
    ]
  },
  '4': {
    id: '4',
    name: '橘猫小布',
    description: '慵懒可爱的小猫咪，陪你度过温暖时光。\n总是用它的纯真和可爱治愈着每一个疲惫的心灵。',
    story: `小布是一只温暖的橘色小猫，它有着圆圆的大眼睛和柔软的毛发。虽然只是一只猫咪，但小布似乎有着超乎寻常的共情能力，总能感知到人类的情绪变化。

当你感到疲惫时，小布会静静地蜷缩在你身边，用它温暖的体温和轻柔的呼噜声安慰你。当你开心时，它会活泼地在你周围转圈，分享你的快乐。

小布的世界很简单，就是阳光、温暖的午后、美味的小鱼干，还有最重要的——陪伴。它用最纯真的方式提醒着人们，有时候幸福就是这么简单。`,
    avatar: 'https://static.paraflowcontent.com/public/resource/image/936bf923-52ba-4b2a-a9f0-e5942fd186e7.jpeg',
    rating: 4.8,
    likes: '9.1k',
    messages: '1.5k',
    tags: ['可爱', '治愈', '陪伴', '温暖', '猫咪', '动物角色'],
    isOnline: true,
    category: '治愈系',
    conversations: [
      { time: '今天 15:20', preview: '喵~ 今天的阳光真舒服呢' },
      { time: '昨天 19:45', preview: '小布想和你一起看夕阳' },
      { time: '4天前', preview: '呼噜呼噜~ 小布在你身边哦' }
    ],
    similarCharacters: [
      { name: '小樱', image: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg' },
      { name: '小魔女', image: 'https://static.paraflowcontent.com/public/resource/image/9975f440-e846-48e9-8dc0-93b4b7d5a454.jpeg' },
      { name: '艾莎公主', image: 'https://static.paraflowcontent.com/public/resource/image/7d75e759-c50c-4392-a947-f3c2f33639d9.jpeg' }
    ]
  },
  '5': {
    id: '5',
    name: '艾莎公主',
    description: '优雅高贵的冰雪公主，拥有控制冰雪的神奇力量。\n学会了接纳自己，用爱融化一切冰冷。',
    story: `艾莎公主来自遥远的阿伦黛尔王国，她天生拥有控制冰雪的魔法力量。年幼时因为无法控制自己的力量而感到恐惧和孤独，但经历了种种考验后，她学会了接纳和拥抱真实的自己。

现在的艾莎已经成长为一位自信而优雅的女性，她明白真正的力量来自于爱与接纳。她用自己的经历告诉人们，每个人都有独特的天赋，关键是要学会正确地运用它们。

艾莎公主现在致力于帮助那些因为与众不同而感到困扰的人们，她用自己的故事鼓励大家勇敢做自己，不要害怕展现真实的内心。`,
    avatar: 'https://static.paraflowcontent.com/public/resource/image/7d75e759-c50c-4392-a947-f3c2f33639d9.jpeg',
    rating: 4.7,
    likes: '12.3k',
    messages: '2.8k',
    tags: ['公主', '魔法', '优雅', '自信', '成长', '经典IP'],
    isOnline: true,
    category: '经典IP',
    conversations: [
      { time: '今天 11:15', preview: 'Let it go~ 做真实的自己最重要' },
      { time: '昨天 17:30', preview: '每个人都有属于自己的独特之处' },
      { time: '2天前', preview: '爱是融化一切冰冷的力量' }
    ],
    similarCharacters: [
      { name: '小魔女', image: 'https://static.paraflowcontent.com/public/resource/image/9975f440-e846-48e9-8dc0-93b4b7d5a454.jpeg' },
      { name: '小樱', image: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg' },
      { name: '橘猫小布', image: 'https://static.paraflowcontent.com/public/resource/image/936bf923-52ba-4b2a-a9f0-e5942fd186e7.jpeg' }
    ]
  }
}

// 根据ID获取角色信息
export function getCharacterById(id: string): Character | null {
  return charactersDatabase[id] || null
}

// 获取所有角色
export function getAllCharacters(): Character[] {
  return Object.values(charactersDatabase)
}

// 根据分类获取角色
export function getCharactersByCategory(category: string): Character[] {
  return Object.values(charactersDatabase).filter(char => char.category === category)
}

// 搜索角色
export function searchCharacters(query: string): Character[] {
  const lowercaseQuery = query.toLowerCase()
  return Object.values(charactersDatabase).filter(char => 
    char.name.toLowerCase().includes(lowercaseQuery) ||
    char.description.toLowerCase().includes(lowercaseQuery) ||
    char.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}