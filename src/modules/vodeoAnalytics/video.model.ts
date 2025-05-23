import { model, Schema, Types, Document } from 'mongoose';

const AssessmentSchema = new Schema(
  {
    question_id: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionList',
      required: false,
    },
    interview_id: {
      type: Schema.Types.ObjectId,
      ref: 'MockInterview',
      required: true,
    },
    questionBank_id: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionBank',
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    islast: { type: Boolean, default: false },
    isSummary: { type: Boolean, default: false },
    video_url: { type: String },

    assessment: {
      articulation: {
        feedback: { type: String },
        score: { type: Number },
      },
      behavioural_cue: {
        feedback: { type: String },
        score: { type: Number },
      },
      problem_solving: {
        feedback: { type: String },
        score: { type: Number },
      },
      inprep_score: { type: Number },
      content_score: { type: Number },
      what_can_i_do_better: { type: String },
      overall_score: { type: Number },
    },
  },
  { timestamps: true }
);

// Pre-save hook to normalize assessment input
AssessmentSchema.pre('save', function (next) {
  const doc = this as Document & { assessment?: any };

  const a = doc.assessment;

  if (!a) return next();

  // Normalize casing if provided as alternative keys
  if (a.Articulation) {
    a.articulation = a.Articulation;
    delete a.Articulation;
  }
  if (a.Behavioural_Cue) {
    a.behavioural_cue = a.Behavioural_Cue;
    delete a.Behavioural_Cue;
  }
  if (a.Problem_Solving) {
    a.problem_solving = a.Problem_Solving;
    delete a.Problem_Solving;
  }
  if (a.Content_Score !== undefined) {
    a.content_score = a.Content_Score;
    delete a.Content_Score;
  }
  if (a.Inprep_Score && typeof a.Inprep_Score.total_score === 'number') {
    a.inprep_score = a.Inprep_Score.total_score;
    delete a.Inprep_Score;
  }

  // Normalize `what_can_i_do_better` to string
  if (a.what_can_i_do_better && typeof a.what_can_i_do_better === 'object') {
    a.what_can_i_do_better = a.what_can_i_do_better.overall_feedback || '';
  }

  next();
});

export const AssessmentModel = model('VideoAssessment', AssessmentSchema);
