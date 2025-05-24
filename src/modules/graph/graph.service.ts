import { AssessmentModel } from '../vodeoAnalytics/video.model';
import { Types } from 'mongoose';

type Scores = {
  Articulation: number;
  Behavioural_Cue: number;
  Problem_Solving: number;
  Inprep_Score: number;
  count: number;
};

const initScores = (): Scores => ({
  Articulation: 0,
  Behavioural_Cue: 0,
  Problem_Solving: 0,
  Inprep_Score: 0,
  count: 0,
});

export const calculateDailyDetailedAveragesFromDB = async (userId: string) => {
  const assessments = await AssessmentModel.find({ user_id: new Types.ObjectId(userId), isSummary: true });

  if (!assessments.length) return { dailyAverages: {}, weeklyAverages: {}, totalAverage: {}, totalInterviews: 0 };

  const dailyMap = new Map<string, Scores>();
  const weeklyMap = new Map<string, Scores>();
  const total = initScores();

  const sorted = assessments.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  let weekStart = new Date(sorted[0].createdAt);
  weekStart.setUTCHours(0, 0, 0, 0);
  let week = 1;

  for (const entry of sorted) {
    const a = entry.assessment;
    if (!a || typeof a !== 'object') continue;

    const articulation = a.Articulation?.score ?? null;
    const behavioral = a.Behavioural_Cue?.score ?? null;
    const problem = a.Problem_Solving?.score ?? null;
    const inprep = a.Inprep_Score?.total_score ?? null;

    if ([articulation, behavioral, problem, inprep].some(score => typeof score !== 'number')) continue;

    const date = new Date(entry.createdAt);
    date.setUTCHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];

    if ((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24) >= 7) {
      week++;
      weekStart = new Date(date);
    }

    const weekKey = `Week ${week}`;

    const update = (map: Map<string, Scores>, key: string) => {
      const s = map.get(key) || initScores();
      s.Articulation += articulation!;
      s.Behavioural_Cue += behavioral!;
      s.Problem_Solving += problem!;
      s.Inprep_Score += inprep!;
      s.count++;
      map.set(key, s);
    };

    update(dailyMap, dateKey);
    update(weeklyMap, weekKey);
    update(new Map([['total', total]]), 'total');
  }

  const toAvg = (map: Map<string, Scores>) =>
    Object.fromEntries(
      [...map.entries()].map(([k, v]) => [
        k,
        {
          Articulation: +(v.Articulation / v.count).toFixed(2),
          Behavioural_Cue: +(v.Behavioural_Cue / v.count).toFixed(2),
          Problem_Solving: +(v.Problem_Solving / v.count).toFixed(2),
          Inprep_Score: +(v.Inprep_Score / v.count).toFixed(2),
        },
      ])
    );

  return {
    dailyAverages: toAvg(dailyMap),
    weeklyAverages: toAvg(weeklyMap),
    totalAverage: toAvg(new Map([['total', total]])).total,
    totalInterviews: total.count,
  };
};
