// 自機キャラクター定義 (3 種)
//
// CHARACTERS は表示順 = 選択画面でのカーソル順 (witch / miko / maid)。
// startGame で selectedCharacter を見て該当データを読み出し、player にステ
// ータスを焼き付ける。
// 既存挙動と互換: bulletPower=1, homingEnabled=true, homingRate=1, bombPower=1,
// bombRange=1, bulletSpread='standard'、speed=4 が「魔女 = 既定値」。
//   - 巫女: 速度低め、弾威力高、ホーミングなし、ボム威力高、中央寄せ密集弾
//   - メイド: 速度速い、弾威力据置、ホーミング高頻度、ボム範囲広、扇状 5 wayspread

const CHARACTERS = [
  {
    id: 'witch',
    name: '魔女',
    enName: 'Witch',
    description: 'バランス型。何でもこなせる王道。',
    enDescription: 'Balanced. Versatile and reliable.',
    color: '#cc88ff',
    speed: 4.0,
    bulletPower: 1.0,
    homingEnabled: true,
    homingRate: 1.0,
    bombPower: 1.0,
    bombRange: 1.0,
    bulletSpread: 'standard',
    frontImage: 'player_witch_front',
    backImage:  'player_witch_back'
  },
  {
    id: 'miko',
    name: '巫女',
    enName: 'Miko',
    description: '攻撃特化。火力で押し切る。',
    enDescription: 'Attack focused. High damage output.',
    color: '#aa66ff',
    speed: 3.5,
    bulletPower: 1.3,
    homingEnabled: false,
    homingRate: 0,
    bombPower: 1.5,
    bombRange: 1.0,
    bulletSpread: 'concentrated',
    frontImage: 'player_miko_front',
    backImage:  'player_miko_back'
  },
  {
    id: 'maid',
    name: 'メイド',
    enName: 'Maid',
    description: '機動型。素早く避けて広く撃つ。',
    enDescription: 'Mobility focused. Fast and wide-ranged.',
    color: '#88aaff',
    speed: 4.5,
    bulletPower: 1.0,
    homingEnabled: true,
    homingRate: 1.5,
    bombPower: 1.0,
    bombRange: 1.3,
    bulletSpread: 'wide',
    frontImage: 'player_maid_front',
    backImage:  'player_maid_back'
  }
];

// id (string) → CHARACTERS の要素。見つからなければ先頭 (witch) にフォールバック。
function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

// id → CHARACTERS の index。
function characterIndex(id) {
  const i = CHARACTERS.findIndex(c => c.id === id);
  return i >= 0 ? i : 0;
}
