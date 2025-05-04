<<<<<<< HEAD
# MediKalak

A medical knowledge quiz game for iOS and Android built with React Native and Expo. Test your medical knowledge with engaging, timed multiple-choice questions.

## Features

- Timed medical knowledge questions with multiple-choice answers
- Score tracking with high score records
- Categories based on medical specialties
- Educational explanations for correct answers
- Clean, modern medical-themed UI

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- For iOS development: Xcode and CocoaPods
- For Android development: Android Studio and Java Development Kit

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd MediKalak
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Using the MedQA-USMLE Dataset

This app can use the MedQA-USMLE dataset for high-quality medical questions. To import these questions:

1. Ensure the MedQA-USMLE dataset is available in the `MediKalak/MedQA-USMLE` directory
2. Run the import script:
   ```
   npm run import-questions
   ```
3. The questions will be imported and saved to `constants/medicalQuestions.js`
4. Restart the app to access the imported questions

### About the MedQA-USMLE Dataset

The MedQA-USMLE dataset contains high-quality medical questions from the US Medical Licensing Examination. The questions cover a wide range of medical topics and are categorized by difficulty and specialty.

For more information about the dataset, visit: [https://www.kaggle.com/datasets/moaaztameer/medqa-usmle/data](https://www.kaggle.com/datasets/moaaztameer/medqa-usmle/data)

## Development

### Project Structure

- `screens/`: Main application screens
- `components/`: Reusable UI components
- `constants/`: Game questions, theme, and colors
- `utils/`: Helper functions for storage and scoring
- `assets/`: Images and icons
- `MedQA-USMLE/`: External dataset (not included in repository)

### Key Files

- `App.js`: Main application with navigation setup
- `constants/medicalQuestions.js`: Imported USMLE questions
- `constants/questions.js`: Fallback questions if USMLE dataset is not available
- `utils/questionParser.js`: Parser for the USMLE dataset

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MedQA-USMLE dataset: Jin, Di, et al. "What Disease does this Patient Have? A Large-scale Open Domain Question Answering Dataset from Medical Exams." arXiv preprint arXiv:2009.13081 (2020). 
=======
# medilak
>>>>>>> 944efe515e351e5dc6fef81672034a6f523cb5ae
