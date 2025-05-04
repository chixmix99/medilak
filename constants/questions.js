// Sample medical questions for the game
const questions = [
  {
    id: 1,
    question: "Which of the following is NOT a function of the liver?",
    options: [
      "Detoxification of drugs",
      "Production of insulin",
      "Storage of glycogen",
      "Synthesis of bile"
    ],
    correctAnswer: 1, // Index of correct answer (0-based)
    explanation: "The liver does not produce insulin. Insulin is produced by the beta cells of the pancreas.",
    category: "Physiology"
  },
  {
    id: 2,
    question: "Which cranial nerve is responsible for taste?",
    options: [
      "Facial nerve (VII)",
      "Trigeminal nerve (V)",
      "Glossopharyngeal nerve (IX)",
      "Vagus nerve (X)"
    ],
    correctAnswer: 0, // Index of correct answer (0-based)
    explanation: "The facial nerve (VII) is responsible for taste on the anterior two-thirds of the tongue.",
    category: "Anatomy"
  },
  {
    id: 3,
    question: "Which antibiotic class is associated with tendon rupture as a side effect?",
    options: [
      "Macrolides",
      "Fluoroquinolones",
      "Tetracyclines",
      "Penicillins"
    ],
    correctAnswer: 1, // Index of correct answer (0-based)
    explanation: "Fluoroquinolones can increase the risk of tendon rupture, particularly affecting the Achilles tendon.",
    category: "Pharmacology"
  },
  {
    id: 4,
    question: "Which heart chamber receives oxygenated blood from the lungs?",
    options: [
      "Right atrium",
      "Left atrium",
      "Right ventricle",
      "Left ventricle"
    ],
    correctAnswer: 1, // Index of correct answer (0-based)
    explanation: "The left atrium receives oxygenated blood from the lungs via the pulmonary veins.",
    category: "Anatomy"
  },
  {
    id: 5,
    question: "Which of the following is a common symptom of hypothyroidism?",
    options: [
      "Weight loss",
      "Heat intolerance",
      "Fatigue",
      "Increased sweating"
    ],
    correctAnswer: 2, // Index of correct answer (0-based)
    explanation: "Fatigue is a common symptom of hypothyroidism due to decreased metabolic rate.",
    category: "Endocrinology"
  },
];

export default questions;
