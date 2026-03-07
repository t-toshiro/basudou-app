// ===== 名簿と設定データ =====
export const ROSTER = [
  { id: 1,  name: "田中 翔",   position: "front" ,gender:"male"},
  { id: 2,  name: "佐藤 健",   position: "back"  ,gender:"male"},
  { id: 3,  name: "鈴木 大輝", position: "front" ,gender:"male"},
  { id: 4,  name: "高橋 涼",   position: "back"  ,gender:"male"},
  { id: 5,  name: "伊藤 航",   position: "front" ,gender:"male"},
  { id: 6,  name: "渡辺 蓮",   position: "back"  ,gender:"male"},
  { id: 7,  name: "山本 颯",   position: "front" ,gender:"male"},
  { id: 8,  name: "中村 陸",   position: "back"  ,gender:"male"},
  { id: 9,  name: "小林 律",   position: "front" ,gender:"male"},
  { id: 10, name: "加藤 海斗", position: "back"  ,gender:"male"},
  { id: 11, name: "吉田 蒼",   position: "front" ,gender:"male"},
  { id: 12, name: "山田 悠",   position: "back"  ,gender:"male"},
  { id: 13, name: "松本 光",   position: "front" ,gender:"male"},
  { id: 14, name: "井上 空",   position: "back"  ,gender:"male"},
  { id: 15, name: "木村 晴",   position: "front" ,gender:"male"},
  { id: 16, name: "林 奏太",   position: "back"  ,gender:"male"},
  { id: 17, name: "清水 陽向", position: "front" ,gender:"male"},
  { id: 18, name: "斎藤 凌",   position: "back"  ,gender:"male"},
  { id: 19, name: "山口 湊",   position: "front" ,gender:"male"},
  { id: 20, name: "池田 蒼太", position: "back"  ,gender:"male"},
  { id: 21, name: "橋本 樹",   position: "front" ,gender:"male"},
  { id: 22, name: "石川 碧",   position: "back"  ,gender:"male"},
  { id: 23, name: "前田 悠真", position: "front" ,gender:"male"},
  { id: 24, name: "藤田 煌",   position: "back"  ,gender:"male"},
  { id: 25, name: "岡田 司",   position: "front" ,gender:"male"},
  { id: 26, name: "後藤 颯真", position: "back"  ,gender:"male"},
  { id: 27, name: "西村 朔",   position: "front" ,gender:"male"},
  { id: 28, name: "福田 蓮太", position: "back"  ,gender:"male"},
  { id: 29, name: "坂本 昊",   position: "front" ,gender:"male"},
  { id: 30, name: "遠藤 碧斗", position: "back"  ,gender:"male"},
];

export const TEAM_COLORS = [
  { bg: "#FF4757", light: "#FFE8EA", name: "1" },
  { bg: "#2ED573", light: "#E3FFF0", name: "2" },
  { bg: "#1E90FF", light: "#E3F2FF", name: "3" },
  { bg: "#FFA502", light: "#FFF5E3", name: "4" },
  { bg: "#A55EEA", light: "#F5EEFF", name: "5" },
  { bg: "#FF6B81", light: "#FFE8EC", name: "6" },
];

// チーム振り分けロジック
export function distributeTeams(presentMembers, numTeams) {
  const fronts = presentMembers.filter((m) => m.position === "front");
  const backs = presentMembers.filter((m) => m.position === "back");

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const sf = shuffle(fronts);
  const sb = shuffle(backs);

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    members: [],
  }));

  [...sf, ...sb].forEach((member, i) => {
    teams[i % numTeams].members.push(member);
  });

  return teams;
}

/** 2コート用：全チームの試合組み合わせを過不足なくラウンド分けする（1ラウンド最大2試合＝4チーム） */
export function getMatchSchedule(teams, courts = 2) {
  if (!teams || teams.length < 2) return [];

  const pairs = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }

  const rounds = [];
  const used = new Set();

  while (used.size < pairs.length) {
    const round = [];
    const teamsInRound = new Set();

    for (let i = 0; i < pairs.length; i++) {
      if (used.has(i)) continue;
      const [a, b] = pairs[i];
      if (teamsInRound.has(a.id) || teamsInRound.has(b.id)) continue;
      round.push([a, b]);
      teamsInRound.add(a.id);
      teamsInRound.add(b.id);
      used.add(i);
      if (round.length >= courts) break;
    }
    rounds.push(round);
  }

  return rounds;
}
