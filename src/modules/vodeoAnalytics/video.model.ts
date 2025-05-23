import { model, Schema } from "mongoose";

const AssessmentSchema = new Schema({
    question_id:{ type: Schema.Types.ObjectId, required: false, ref: 'QuestionList' },
    interview_id: { type: Schema.Types.ObjectId, required: true, ref: 'MockInterview' },
    questionBank_id: { type: Schema.Types.ObjectId, required: true, ref: 'QuestionBank' },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    islast: { type: Boolean, required: false, default:false},
    isSummary:{ type: Boolean, required: false, default:false},
    video_url: { type: String, required:false , default:null },
  
    assessment: {
      Articulation: {
        feedback: { type: String, required: true },
        score: { type: Number, required: true },
      },
      Behavioural_Cue: {
        feedback: { type: String, required: true },
        score: { type: Number, required: true },
      },
      Problem_Solving: {
        feedback: { type: String, required: true },
        score: { type: Number, required: true },
      },
      Inprep_Score: {
        total_score: { type: Number, required: true },
      },
      what_can_i_do_better: {
        overall_feedback: { type: String, required: true },
      },
      Content_Score: { type: Number, required: true }, // ✅ Added this field
    }
  }, { timestamps: true });
  
  export const AssessmentModel = model('VideoAssessment', AssessmentSchema);