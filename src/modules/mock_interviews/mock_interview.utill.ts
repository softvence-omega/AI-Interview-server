const generateQuestions = async (prompt: string) => {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: Prompt must be a non-empty string');
    }
  
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://freepik.softvenceomega.com/in-prep/api/v1/q_generator/generate-questions?topic=${encodedPrompt}`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: '',
      });
  
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();

  
      return data;

  
 
    } catch (error: any) {
      console.error('Error generating questions:', { prompt, error: error.message });
      throw new Error(`Failed to generate questions: ${error.message || 'Unknown error'}`);
    }
  };
  
  const mockInterviewUtill={
    generateQuestions
  }
  
  export default mockInterviewUtill;