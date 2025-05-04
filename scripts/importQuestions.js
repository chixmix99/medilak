/**
 * Import Questions Script
 * 
 * This script imports USMLE questions from the MedQA-USMLE dataset
 * and converts them to the format required by the MediKalak app.
 */

const path = require('path');
const { parseQuestions } = require('../utils/questionParser');

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const datasetPath = path.resolve(projectRoot, '..', 'medQA-USMLE');
const outputPath = path.resolve(projectRoot, 'constants', 'medicalQuestions.js');

async function main() {
  console.log('Starting MediKalak USMLE Question Import');
  console.log('=======================================');
  console.log(`Dataset Path: ${datasetPath}`);
  console.log(`Output Path: ${outputPath}`);
  console.log('---------------------------------------');
  
  try {
    const count = await parseQuestions(datasetPath, outputPath);
    console.log('=======================================');
    console.log(`Import completed successfully! Imported ${count} questions.`);
    console.log('You can now use the USMLE questions in your app.');
  } catch (error) {
    console.error('=======================================');
    console.error('Error during import process:');
    console.error(error.message);
    console.error('---------------------------------------');
    console.error('Troubleshooting tips:');
    console.error('1. Ensure the medQA-USMLE dataset is in the correct location');
    console.error('2. Check that you have permissions to read/write the files');
    console.error('3. Verify the dataset structure contains US/4_options/*.jsonl files');
    process.exit(1);
  }
}

// Run the import process
main(); 