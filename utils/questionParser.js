const fs = require('fs');
const path = require('path');

/**
 * Parses USMLE questions from the dataset
 * @param {string} sourcePath - Path to the directory containing the USMLE questions
 * @param {string} outputPath - Path to save the processed questions
 * @returns {Promise<number>} - Number of questions processed
 */
async function parseQuestions(sourcePath, outputPath) {
  try {
    console.log(`Reading questions from ${sourcePath}...`);
    
    // Define the path to the English US 4_options questions
    const questionsDir = path.join(sourcePath, 'US', '4_options');
    
    if (!fs.existsSync(questionsDir)) {
      throw new Error(`Questions directory not found: ${questionsDir}`);
    }
    
    // Read all files in the directory
    const files = fs.readdirSync(questionsDir);
    const jsonFiles = files.filter(file => file.endsWith('.jsonl'));
    
    if (jsonFiles.length === 0) {
      throw new Error('No question files found in the specified directory');
    }
    
    // Process each file
    let allQuestions = [];
    let processedCount = 0;
    
    for (const file of jsonFiles) {
      const filePath = path.join(questionsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // JSONL files have one JSON object per line
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        try {
          const questionData = JSON.parse(line);
          
          // Ensure this is an English question
          if (questionData.language !== 'en') continue;
          
          // Format the question for the game
          const formattedQuestion = {
            question: questionData.question || '',
            options: [
              questionData.a || '',
              questionData.b || '',
              questionData.c || '',
              questionData.d || ''
            ],
            correctAnswer: ['a', 'b', 'c', 'd'].indexOf(questionData.answer.toLowerCase()) || 0,
            explanation: questionData.exp || '',
            category: questionData.meta_info || 'USMLE'
          };
          
          allQuestions.push(formattedQuestion);
          processedCount++;
        } catch (err) {
          console.warn(`Error parsing line in ${file}:`, err.message);
        }
      }
    }
    
    if (allQuestions.length === 0) {
      throw new Error('No valid questions found in the dataset');
    }
    
    // Shuffle the questions
    allQuestions = shuffleArray(allQuestions);
    
    // Save the processed questions
    const outputContent = `// Imported USMLE questions from MedQA-USMLE dataset
const medicalQuestions = ${JSON.stringify(allQuestions, null, 2)};

export default medicalQuestions;`;

    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log(`Successfully processed ${processedCount} questions and saved to ${outputPath}`);
    
    return processedCount;
  } catch (error) {
    console.error('Error parsing questions:', error.message);
    throw error;
  }
}

/**
 * Shuffles array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

module.exports = { parseQuestions }; 