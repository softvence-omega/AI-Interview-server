import { AssessmentModel } from '../vodeoAnalytics/video.model';
import { Types } from 'mongoose';

type Scores = {
  Articulation: number;
  Behavioural_Cue: number;
  Problem_Solving: number;
  Inprep_Score: number;
  Content_Score: number;
  count: number;
};

const initScores = (): Scores => ({
  Articulation: 0,
  Behavioural_Cue: 0,
  Problem_Solving: 0,
  Inprep_Score: 0,
  Content_Score: 0,
  count: 0,
});

const calculatePercentageChange = (
  sortedKeys: string[],
  data: Record<string, any>
) => {
  const result: Record<string, any> = {};
  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = data[sortedKeys[i - 1]];
    const curr = data[sortedKeys[i]];
    result[sortedKeys[i]] = {
      Articulation: prev.Articulation ? +(((curr.Articulation - prev.Articulation) / prev.Articulation) * 100).toFixed(2) : 0,
      Behavioural_Cue: prev.Behavioural_Cue ? +(((curr.Behavioural_Cue - prev.Behavioural_Cue) / prev.Behavioural_Cue) * 100).toFixed(2) : 0,
      Problem_Solving: prev.Problem_Solving ? +(((curr.Problem_Solving - prev.Problem_Solving) / prev.Problem_Solving) * 100).toFixed(2) : 0,
      Inprep_Score: prev.Inprep_Score ? +(((curr.Inprep_Score - prev.Inprep_Score) / prev.Inprep_Score) * 100).toFixed(2) : 0,
      Content_Score: prev.Content_Score ? +(((curr.Content_Score - prev.Content_Score) / prev.Content_Score) * 100).toFixed(2) : 0,
    };
  }
  return result;
};

const calculateOverallAverage = (scores: Scores): number => {
  const total =
    scores.Articulation +
    scores.Behavioural_Cue +
    scores.Problem_Solving +
    scores.Inprep_Score +
    scores.Content_Score;
  return +(total / (5 * scores.count)).toFixed(2) || 0;
};

export const calculateDailyDetailedAveragesFromDB = async (userId: string) => {
  const assessments = await AssessmentModel.find({
    user_id: new Types.ObjectId(userId),
    isSummary: true,
  });

  const dailyMap = new Map<string, Scores>();
  const weeklyMap = new Map<string, Scores>();
  const total = initScores();
  const totalExcludingLast = initScores();

  // Initialize 4 weeks with zero scores
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 4; i++) {
    const weekKey = `Week ${i + 1}`;
    weeklyMap.set(weekKey, initScores());
  }

  if (!assessments.length) {
    const dailyAvg = {};
    const weeklyAvg = Object.fromEntries(
      [...weeklyMap.entries()].map(([k, v]) => [
        k,
        {
          Articulation: 0,
          Behavioural_Cue: 0,
          Problem_Solving: 0,
          Inprep_Score: 0,
          Content_Score: 0,
        },
      ])
    );
    const dailyOverallAverages : any[] = [];
    const weeklyOverallAverages = [...weeklyMap.entries()].map(([weekLabel, scores]) => ({
      date: weekLabel,
      average: 0,
    }));

    return {
      dailyAverages: dailyAvg,
      dailyPercentageChanges: {},
      weeklyAverages: weeklyAvg,
      weeklyPercentageChanges: {},
      totalAverage: {
        Articulation: 0,
        Behavioural_Cue: 0,
        Problem_Solving: 0,
        Inprep_Score: 0,
        Content_Score: 0,
        average: 0,
      },
      withoutLastAverage: {
        Articulation: 0,
        Behavioural_Cue: 0,
        Problem_Solving: 0,
        Inprep_Score: 0,
        Content_Score: 0,
        average: 0,
      },
      lastInterviewChangePercent: 0,
      totalInterviews: 0,
      dailyOverallAverages,
      weeklyOverallAverages,
      differenceBetweenTotalAndWithoutLast: {
        Articulation: 0,
        Behavioural_Cue: 0,
        Problem_Solving: 0,
        Inprep_Score: 0,
        Content_Score: 0,
      },
    };
  }

  const sorted = assessments.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  let weekStart = new Date(sorted[0].createdAt);
  weekStart.setUTCHours(0, 0, 0, 0);
  let weekIndex = 1; // Start with Week 1

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const a = entry.assessment;
    if (!a || typeof a !== 'object') continue;

    const articulation = a.Articulation?.score ?? null;
    const behavioral = a.Behavioural_Cue?.score ?? null;
    const problem = a.Problem_Solving?.score ?? null;
    const inprep = a.Inprep_Score?.total_score ?? null;
    const content = a.Content_Score ?? null;

    if ([articulation, behavioral, problem, inprep, content].some(score => typeof score !== 'number')) continue;

    const date = new Date(entry.createdAt);
    date.setUTCHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];

    // Determine the week key based on the date
    const daysSinceStart = (date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart >= 7) {
      weekIndex = Math.min(4, weekIndex + Math.floor(daysSinceStart / 7));
      weekStart = new Date(date);
      weekStart.setUTCHours(0, 0, 0, 0);
    }
    const weekKey = `Week ${weekIndex}`;

    const update = (map: Map<string, Scores>, key: string) => {
      const s = map.get(key) || initScores();
      s.Articulation += articulation!;
      s.Behavioural_Cue += behavioral!;
      s.Problem_Solving += problem!;
      s.Inprep_Score += inprep!;
      s.Content_Score += content!;
      s.count++;
      map.set(key, s);
    };

    update(dailyMap, dateKey);
    update(weeklyMap, weekKey);

    total.Articulation += articulation!;
    total.Behavioural_Cue += behavioral!;
    total.Problem_Solving += problem!;
    total.Inprep_Score += inprep!;
    total.Content_Score += content!;
    total.count++;

    if (i !== sorted.length - 1) {
      totalExcludingLast.Articulation += articulation!;
      totalExcludingLast.Behavioural_Cue += behavioral!;
      totalExcludingLast.Problem_Solving += problem!;
      totalExcludingLast.Inprep_Score += inprep!;
      totalExcludingLast.Content_Score += content!;
      totalExcludingLast.count++;
    }
  }

  const toAvg = (map: Map<string, Scores>) =>
    Object.fromEntries(
      [...map.entries()].map(([k, v]) => [
        k,
        {
          Articulation: +(v.Articulation / v.count).toFixed(2) || 0,
          Behavioural_Cue: +(v.Behavioural_Cue / v.count).toFixed(2) || 0,
          Problem_Solving: +(v.Problem_Solving / v.count).toFixed(2) || 0,
          Inprep_Score: +(v.Inprep_Score / v.count).toFixed(2) || 0,
          Content_Score: +(v.Content_Score / v.count).toFixed(2) || 0,
        },
      ])
    );

  const dailyAvg = toAvg(dailyMap);
  const weeklyAvg = toAvg(weeklyMap);

  const dailyPercentageChanges = calculatePercentageChange(Object.keys(dailyAvg).sort(), dailyAvg);
  const weeklyPercentageChanges = calculatePercentageChange(
    Object.keys(weeklyAvg).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])),
    weeklyAvg
  );

  const dailyOverallAverages = [...dailyMap.entries()].map(([date, scores]) => ({
    date,
    average: calculateOverallAverage(scores),
  }));

  const weeklyOverallAverages = [...weeklyMap.entries()]
    .sort((a, b) => parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]))
    .map(([weekLabel, scores]) => ({
      date: weekLabel,
      average: calculateOverallAverage(scores),
    }));

  const totalAverageValue = calculateOverallAverage(total);
  const withoutLastAverageValue = calculateOverallAverage(totalExcludingLast);
  const lastInterviewChangePercent = withoutLastAverageValue
    ? +(((totalAverageValue - withoutLastAverageValue) / withoutLastAverageValue) * 100).toFixed(2)
    : 0;

  const differenceBetweenTotalAndWithoutLast = {
    Articulation: totalExcludingLast.Articulation
      ? +(((total.Articulation / total.count - totalExcludingLast.Articulation / totalExcludingLast.count) /
          (totalExcludingLast.Articulation / totalExcludingLast.count)) * 100).toFixed(2)
      : 0,
    Behavioural_Cue: totalExcludingLast.Behavioural_Cue
      ? +(((total.Behavioural_Cue / total.count - totalExcludingLast.Behavioural_Cue / totalExcludingLast.count) /
          (totalExcludingLast.Behavioural_Cue / totalExcludingLast.count)) * 100).toFixed(2)
      : 0,
    Problem_Solving: totalExcludingLast.Problem_Solving
      ? +(((total.Problem_Solving / total.count - totalExcludingLast.Problem_Solving / totalExcludingLast.count) /
          (totalExcludingLast.Problem_Solving / totalExcludingLast.count)) * 100).toFixed(2)
      : 0,
    Inprep_Score: totalExcludingLast.Inprep_Score
      ? +(((total.Inprep_Score / total.count - totalExcludingLast.Inprep_Score / totalExcludingLast.count) /
          (totalExcludingLast.Inprep_Score / totalExcludingLast.count)) * 100).toFixed(2)
      : 0,
    Content_Score: totalExcludingLast.Content_Score
      ? +(((total.Content_Score / total.count - totalExcludingLast.Content_Score / totalExcludingLast.count) /
          (totalExcludingLast.Content_Score / totalExcludingLast.count)) * 100).toFixed(2)
      : 0,
  };

  return {
    dailyAverages: dailyAvg,
    dailyPercentageChanges,
    weeklyAverages: weeklyAvg,
    weeklyPercentageChanges,
    totalAverage: {
      ...toAvg(new Map([['total', total]])).total,
      average: totalAverageValue,
    },
    withoutLastAverage: {
      ...toAvg(new Map([['withoutLast', totalExcludingLast]])).withoutLast,
      average: withoutLastAverageValue,
    },
    lastInterviewChangePercent,
    totalInterviews: total.count,
    dailyOverallAverages,
    weeklyOverallAverages,
    differenceBetweenTotalAndWithoutLast,
  };
};