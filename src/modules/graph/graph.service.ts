import path from 'path';
import fs from 'fs';
import { DailyAverage, GroupData, InterviewData } from './graph.interface';

export const calculateDailyDetailedAverages = (): {
  dailyAverages: Record<string, DailyAverage>;
  totalAverage: DailyAverage;
  weeklyAverages: Record<string, DailyAverage>;
  totalInterviews: number;
} => {
  // const filePath = path.join(__dirname, '..', 'graph', 'graph.json');
  const filePath = path.join(__dirname, './graph.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data: InterviewData[] = JSON.parse(rawData);

  const dailyGrouped: Record<string, GroupData> = {};
  const weeklyGrouped: Record<string, GroupData> = {};

  let totalArticulation = 0;
  let totalBehaviouralCue = 0;
  let totalProblemSolving = 0;
  let totalInprepScore = 0;
  let totalCount = 0;

  // Sort data by date descending for consistent weekly grouping
  data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Create week groupings
  let currentWeekStart = new Date(data[0].createdAt);
  currentWeekStart.setUTCHours(0, 0, 0, 0);

  const weekBuckets: { [weekLabel: string]: InterviewData[] } = {};
  let weekNumber = 1;

  for (let i = 0; i < data.length; i++) {
    const entryDate = new Date(data[i].createdAt);
    entryDate.setUTCHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentWeekStart.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 7) {
      weekNumber++;
      currentWeekStart = new Date(entryDate);
    }

    const weekLabel = `Week ${weekNumber}`;
    if (!weekBuckets[weekLabel]) weekBuckets[weekLabel] = [];
    weekBuckets[weekLabel].push(data[i]);

    // Daily grouping
    const dateKey = entryDate.toISOString().split('T')[0];

    if (!dailyGrouped[dateKey]) {
      dailyGrouped[dateKey] = {
        Articulation: 0,
        Behavioural_Cue: 0,
        Problem_Solving: 0,
        Inprep_Score: 0,
        count: 0,
      };
    }

    dailyGrouped[dateKey].Articulation += data[i].Articulation.score;
    dailyGrouped[dateKey].Behavioural_Cue += data[i].Behavioural_Cue.score;
    dailyGrouped[dateKey].Problem_Solving += data[i].Problem_Solving.score;
    dailyGrouped[dateKey].Inprep_Score += data[i].Inprep_Score.total_score;
    dailyGrouped[dateKey].count += 1;

    // Total aggregation
    totalArticulation += data[i].Articulation.score;
    totalBehaviouralCue += data[i].Behavioural_Cue.score;
    totalProblemSolving += data[i].Problem_Solving.score;
    totalInprepScore += data[i].Inprep_Score.total_score;
    totalCount += 1;
  }

  const dailyAverages: Record<string, DailyAverage> = {};
  for (const date in dailyGrouped) {
    const group = dailyGrouped[date];
    dailyAverages[date] = {
      Articulation: parseFloat((group.Articulation / group.count).toFixed(2)),
      Behavioural_Cue: parseFloat((group.Behavioural_Cue / group.count).toFixed(2)),
      Problem_Solving: parseFloat((group.Problem_Solving / group.count).toFixed(2)),
      Inprep_Score: parseFloat((group.Inprep_Score / group.count).toFixed(2)),
    };
  }

  const weeklyAverages: Record<string, DailyAverage> = {};
  for (const week in weekBuckets) {
    const group = {
      Articulation: 0,
      Behavioural_Cue: 0,
      Problem_Solving: 0,
      Inprep_Score: 0,
      count: 0,
    };

    weekBuckets[week].forEach((entry) => {
      group.Articulation += entry.Articulation.score;
      group.Behavioural_Cue += entry.Behavioural_Cue.score;
      group.Problem_Solving += entry.Problem_Solving.score;
      group.Inprep_Score += entry.Inprep_Score.total_score;
      group.count += 1;
    });

    weeklyAverages[week] = {
      Articulation: parseFloat((group.Articulation / group.count).toFixed(2)),
      Behavioural_Cue: parseFloat((group.Behavioural_Cue / group.count).toFixed(2)),
      Problem_Solving: parseFloat((group.Problem_Solving / group.count).toFixed(2)),
      Inprep_Score: parseFloat((group.Inprep_Score / group.count).toFixed(2)),
    };
  }

  const totalAverage: DailyAverage = {
    Articulation: parseFloat((totalArticulation / totalCount).toFixed(2)),
    Behavioural_Cue: parseFloat((totalBehaviouralCue / totalCount).toFixed(2)),
    Problem_Solving: parseFloat((totalProblemSolving / totalCount).toFixed(2)),
    Inprep_Score: parseFloat((totalInprepScore / totalCount).toFixed(2)),
  };

  return {
    totalInterviews: totalCount,
    dailyAverages,
    weeklyAverages,
    totalAverage
  };
};
