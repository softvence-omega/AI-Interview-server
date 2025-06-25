import { QuestionBankModel } from "../mock_interviews/mock_interviews.model"

// Interface for the output result
interface QuestionBankResult {
    _id: string;
    questionBank_name: string;
  }
  
  const getAllPositions = async (): Promise<QuestionBankResult[]> => {
    try {
      const result = await QuestionBankModel.aggregate([
        // Match non-deleted documents
        { $match: { isDeleted: false } },
        // Group by questionBank_name (case-insensitive) to ensure uniqueness
        {
          $group: {
            _id: { $toLower: "$questionBank_name" }, // Normalize for case-insensitive uniqueness
            questionBank_name: { $first: "$questionBank_name" }, // Keep original case
            original_id: { $first: "$_id" } // Keep first _id for the name
          }
        },
        // Project to shape the output
        {
          $project: {
            _id: 0,
            id: "$original_id", // Temporary field to avoid duplicate _id
            questionBank_name: 1
          }
        },
        // Sort alphabetically by questionBank_name
        { $sort: { questionBank_name: 1 } }
      ]);
  
      // Map to match QuestionBankResult interface
      const formattedResult: QuestionBankResult[] = result.map(({ id, questionBank_name }) => ({
        _id: id.toString(), // Ensure _id is string
        questionBank_name
      }));
  
      return formattedResult;
    } catch (error: any) {
      console.error("Error fetching unique question banks:", error);
      throw new Error(error.message || "Failed to fetch question banks");
    }
  };
  

const positionServices ={
    getAllPositions
}
export default positionServices