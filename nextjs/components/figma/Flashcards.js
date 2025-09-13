import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { Upload, FileText, RotateCcw, ChevronLeft, ChevronRight, Clock, Trash2, Edit2, Plus, ArrowLeft, Trophy } from 'lucide-react';
// Converted from TSX to JS: removed type definitions
import { extractTextFromPDF } from '@/utils/pdfUtils';
import { generateQuizFromContent } from '@/utils/quizGenerator';

export function Flashcards({ flashcardHistory, addFlashcardSet, deleteFlashcardSet, renameFlashcardSet, setCurrentPage, navigateToQuiz }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);


  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const generateQuiz = async () => {
    if (!uploadedFile) return;
    
    setIsGenerating(true);
    
    try {
      // Check if it's a PDF file
      if (uploadedFile.type === 'application/pdf') {
        // Use smart PDF content analysis based on filename and metadata
        const extractedContent = await extractTextFromPDF(uploadedFile);
        
        // Generate quiz questions from the analyzed content
        const generatedQuestions = generateQuizFromContent(extractedContent, uploadedFile.name);
        
        setQuizQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowAnswer(false);
        setQuizCompleted(false);
        setScore(0);
        
        // Save to history
        const newFlashcardSet = {
          title: uploadedFile.name.replace('.pdf', '') + ' Quiz',
          fileName: uploadedFile.name,
          createdAt: new Date().toISOString(),
          flashcards: generatedQuestions.map(q => ({
            id: q.id,
            question: q.question,
            answer: `${q.correctAnswer}. ${q.options[q.correctAnswer]}`
          })),
          quizQuestions: generatedQuestions,
          attempts: [],
          lastResult: undefined
        };
        addFlashcardSet(newFlashcardSet);
      } else
      
      // For non-PDF files
      {
        // For non-PDF files, generate questions based on file name
        const fileName = uploadedFile.name.toLowerCase();
        let mockQuizQuestions = [];

        if (fileName.includes('biology') || fileName.includes('science') || fileName.includes('plant')) {
          // Biology/Science related questions
          mockQuizQuestions = [
            {
              id: '1',
              question: 'What is the process by which plants make their own food?',
              options: {
                A: 'Respiration',
                B: 'Photosynthesis',
                C: 'Digestion',
                D: 'Fermentation'
              },
              correctAnswer: 'B'
            },
            {
              id: '2',
              question: 'Which organelle is primarily responsible for photosynthesis?',
              options: {
                A: 'Mitochondria',
                B: 'Nucleus',
                C: 'Chloroplast',
                D: 'Ribosome'
              },
              correctAnswer: 'C'
            },
            {
              id: '3',
              question: 'What gas do plants absorb from the atmosphere during photosynthesis?',
              options: {
                A: 'Oxygen',
                B: 'Nitrogen',
                C: 'Carbon dioxide',
                D: 'Hydrogen'
              },
              correctAnswer: 'C'
            },
            {
              id: '4',
              question: 'What is the main product of photosynthesis that plants use for energy?',
              options: {
                A: 'Oxygen',
                B: 'Glucose',
                C: 'Water',
                D: 'Carbon dioxide'
              },
              correctAnswer: 'B'
            },
            {
              id: '5',
              question: 'Which part of the plant cell contains chlorophyll?',
              options: {
                A: 'Cell wall',
                B: 'Nucleus',
                C: 'Chloroplast',
                D: 'Vacuole'
              },
              correctAnswer: 'C'
            },
            {
              id: '6',
              question: 'What happens to the oxygen produced during photosynthesis?',
              options: {
                A: 'It is stored in the roots',
                B: 'It is released into the atmosphere',
                C: 'It is converted to carbon dioxide',
                D: 'It is used by the plant for respiration'
              },
              correctAnswer: 'B'
            },
            {
              id: '7',
              question: 'In which part of the chloroplast do the light reactions occur?',
              options: {
                A: 'Stroma',
                B: 'Thylakoid',
                C: 'Outer membrane',
                D: 'Inner membrane'
              },
              correctAnswer: 'B'
            },
            {
              id: '8',
              question: 'What is the role of sunlight in photosynthesis?',
              options: {
                A: 'It provides heat for the reaction',
                B: 'It provides energy to drive the reaction',
                C: 'It breaks down glucose',
                D: 'It produces oxygen directly'
              },
              correctAnswer: 'B'
            },
            {
              id: '9',
              question: 'Which stage of photosynthesis does NOT require direct sunlight?',
              options: {
                A: 'Light reactions',
                B: 'Calvin cycle',
                C: 'Photolysis',
                D: 'ATP synthesis'
              },
              correctAnswer: 'B'
            },
            {
              id: '10',
              question: 'What would happen if a plant was kept in complete darkness for several days?',
              options: {
                A: 'It would grow faster',
                B: 'It would produce more oxygen',
                C: 'It would stop photosynthesis and eventually die',
                D: 'It would change color to red'
              },
              correctAnswer: 'C'
            }
          ];
        } else if (fileName.includes('math') || fileName.includes('algebra') || fileName.includes('calculus')) {
          // Mathematics related questions
          mockQuizQuestions = [
            {
              id: '1',
              question: 'What is the derivative of x²?',
              options: {
                A: 'x',
                B: '2x',
                C: 'x³',
                D: '2'
              },
              correctAnswer: 'B'
            },
            {
              id: '2',
              question: 'What is the slope of a line passing through points (2,3) and (4,7)?',
              options: {
                A: '1',
                B: '2',
                C: '3',
                D: '4'
              },
              correctAnswer: 'B'
            },
            {
              id: '3',
              question: 'What is the value of π (pi) approximately?',
              options: {
                A: '3.14',
                B: '2.71',
                C: '1.41',
                D: '1.73'
              },
              correctAnswer: 'A'
            },
            {
              id: '4',
              question: 'In the equation y = mx + b, what does m represent?',
              options: {
                A: 'Y-intercept',
                B: 'X-intercept',
                C: 'Slope',
                D: 'Constant'
              },
              correctAnswer: 'C'
            },
            {
              id: '5',
              question: 'What is the integral of 2x?',
              options: {
                A: 'x² + C',
                B: '2 + C',
                C: '2x² + C',
                D: 'x + C'
              },
              correctAnswer: 'A'
            },
            {
              id: '6',
              question: 'What is the Pythagorean theorem?',
              options: {
                A: 'a + b = c',
                B: 'a² + b² = c²',
                C: 'a × b = c',
                D: 'a/b = c'
              },
              correctAnswer: 'B'
            },
            {
              id: '7',
              question: 'What is the quadratic formula?',
              options: {
                A: 'x = -b ± √(b² - 4ac) / 2a',
                B: 'x = -b ± √(b² + 4ac) / 2a',
                C: 'x = b ± √(b² - 4ac) / 2a',
                D: 'x = -b ± √(b² - 4ac) / a'
              },
              correctAnswer: 'A'
            },
            {
              id: '8',
              question: 'What is the area of a circle with radius r?',
              options: {
                A: '2πr',
                B: 'πr²',
                C: 'πr',
                D: '2πr²'
              },
              correctAnswer: 'B'
            },
            {
              id: '9',
              question: 'What is log₁₀(100)?',
              options: {
                A: '1',
                B: '2',
                C: '10',
                D: '100'
              },
              correctAnswer: 'B'
            },
            {
              id: '10',
              question: 'What is the limit of (sin x)/x as x approaches 0?',
              options: {
                A: '0',
                B: '1',
                C: '∞',
                D: 'undefined'
              },
              correctAnswer: 'B'
            }
          ];
        } else {
          // General questions
          mockQuizQuestions = [
            {
              id: '1',
              question: 'What is the capital of France?',
              options: {
                A: 'London',
                B: 'Berlin',
                C: 'Paris',
                D: 'Madrid'
              },
              correctAnswer: 'C'
            },
            {
              id: '2',
              question: 'Which planet is known as the Red Planet?',
              options: {
                A: 'Venus',
                B: 'Mars',
                C: 'Jupiter',
                D: 'Saturn'
              },
              correctAnswer: 'B'
            },
            {
              id: '3',
              question: 'Who wrote "Romeo and Juliet"?',
              options: {
                A: 'Charles Dickens',
                B: 'Mark Twain',
                C: 'William Shakespeare',
                D: 'Jane Austen'
              },
              correctAnswer: 'C'
            },
            {
              id: '4',
              question: 'What is the largest mammal in the world?',
              options: {
                A: 'African Elephant',
                B: 'Blue Whale',
                C: 'Giraffe',
                D: 'Hippopotamus'
              },
              correctAnswer: 'B'
            },
            {
              id: '5',
              question: 'In which year did World War II end?',
              options: {
                A: '1944',
                B: '1945',
                C: '1946',
                D: '1947'
              },
              correctAnswer: 'B'
            },
            {
              id: '6',
              question: 'What is the chemical symbol for gold?',
              options: {
                A: 'Go',
                B: 'Gd',
                C: 'Au',
                D: 'Ag'
              },
              correctAnswer: 'C'
            },
            {
              id: '7',
              question: 'Which continent is the largest by land area?',
              options: {
                A: 'Africa',
                B: 'North America',
                C: 'Asia',
                D: 'Europe'
              },
              correctAnswer: 'C'
            },
            {
              id: '8',
              question: 'How many sides does a hexagon have?',
              options: {
                A: '5',
                B: '6',
                C: '7',
                D: '8'
              },
              correctAnswer: 'B'
            },
            {
              id: '9',
              question: 'What is the smallest unit of matter?',
              options: {
                A: 'Molecule',
                B: 'Cell',
                C: 'Atom',
                D: 'Electron'
              },
              correctAnswer: 'C'
            },
            {
              id: '10',
              question: 'Which ocean is the largest?',
              options: {
                A: 'Atlantic Ocean',
                B: 'Indian Ocean',
                C: 'Arctic Ocean',
                D: 'Pacific Ocean'
              },
              correctAnswer: 'D'
            }
          ];
        }
        
        setQuizQuestions(mockQuizQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowAnswer(false);
        setQuizCompleted(false);
        setScore(0);
        
        // Save to history (converting to flashcard format for storage)
        const flashcardFormat = mockQuizQuestions.map(q => ({
          id: q.id,
          question: q.question,
          answer: `Correct answer: ${q.correctAnswer}. ${q.options[q.correctAnswer]}`
        }));
        
        addFlashcardSet({
          title: `Quiz from ${uploadedFile.name}`,
          fileName: uploadedFile.name,
          createdAt: new Date().toISOString(),
          flashcards: flashcardFormat,
          quizQuestions: mockQuizQuestions,
          attempts: [],
          lastResult: undefined
        });
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setIsGenerating(false);
      
      // Show error message or fallback to mock questions
      alert('Error processing the file. Please try again or upload a different file.');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      // This is the last question, finish the quiz
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  const selectAnswer = (answer) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: answer });
    setShowAnswer(true);
  };

  const finishQuiz = () => {
    // Calculate final score
    let finalScore = 0;
    quizQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setQuizCompleted(true);
  };

  const resetCards = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowAnswer(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const startNewUpload = () => {
    setUploadedFile(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowAnswer(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteFlashcardSet(id);
  };

  const handleEdit = (e, id, currentTitle) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameFlashcardSet(id, editingTitle);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle('');
  };

  const openQuizDetail = (flashcardSet) => {
    if (flashcardSet.quizQuestions && flashcardSet.quizQuestions.length > 0) {
      navigateToQuiz(flashcardSet.id);
    }
  };



  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Button>
          <h1>Make Quiz</h1>
        </div>
        <div className="flex items-center space-x-2">
          {quizQuestions.length > 0 && (
            <>
              {!quizCompleted && (
                <Badge variant="outline">
                  {currentQuestionIndex + 1} of {quizQuestions.length}
                </Badge>
              )}
              {quizCompleted && (
                <Badge variant="default">
                  Quiz Complete
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={resetCards}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={startNewUpload}>
                <Plus className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div>
        {quizQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8">
            <div className="space-y-8">
              {/* Upload Section with Dotted Border */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Upload className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-medium">Upload PDF</h2>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Upload your study materials and get personalized quiz questions
                  </p>
                  
                  {!uploadedFile ? (
                    <div className="max-w-sm mx-auto">
                      <input
                        type="file"
                        accept=".txt,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="block">
                        <div className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors rounded-lg py-3 px-6 text-center font-medium">
                          Upload New Document
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <Button 
                          onClick={generateQuiz} 
                          disabled={isGenerating}
                          className="px-8 py-3"
                        >
                          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz Questions'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Quizzes Section */}
              {flashcardHistory.length > 0 && (
                <div>
                  <h3 className="mb-4">Previous Quizzes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flashcardHistory.map((set) => (
                      <Card 
                        key={set.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => openQuizDetail(set)}
                      >
                        <CardHeader className="pb-2">
                          <div className="space-y-3">
                            <div>
                              {editingId === set.id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    className="w-full px-2 py-1 border rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      onClick={(e) => handleSaveEdit(e, set.id)}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <CardTitle className="break-words leading-tight">{set.title}</CardTitle>
                              )}
                            </div>
                            {editingId !== set.id && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(e, set.id, set.title);
                                  }}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  Rename
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(e, set.id);
                                  }}
                                  className="h-8 px-3 text-xs text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>{set.fileName}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(set.createdAt)}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                {set.flashcards.length} questions
                              </p>
                              {set.lastResult && (
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Latest: {set.lastResult.score}/{set.lastResult.totalQuestions}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {set.attempts.length} attempts
                                  </span>
                                </div>
                              )}
                              {!set.lastResult && set.attempts.length === 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Not attempted
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        ) : quizCompleted ? (
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {score}/{quizQuestions.length}
                </div>
                <p className="text-lg text-muted-foreground">
                  You got {score} out of {quizQuestions.length} questions correct
                </p>
                <div className="text-2xl">
                  {score === quizQuestions.length ? '🎉 Perfect Score!' : 
                   score >= quizQuestions.length * 0.8 ? '🌟 Great Job!' :
                   score >= quizQuestions.length * 0.6 ? '👍 Good Work!' :
                   '📚 Keep Studying!'}
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={resetCards} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={startNewUpload}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg">{currentQuestion.question}</div>
              
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = key === currentQuestion.correctAnswer;
                  const showResult = showAnswer;
                  
                  let buttonVariant = "outline";
                  let className = "";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonVariant = "default";
                      className = "bg-green-100 border-green-500 text-green-800 hover:bg-green-100";
                    } else if (isSelected && !isCorrect) {
                      buttonVariant = "destructive";
                    }
                  } else if (isSelected) {
                    buttonVariant = "secondary";
                  }
                  
                  return (
                    <Button
                      key={key}
                      variant={buttonVariant}
                      className={`justify-start h-auto p-4 text-left whitespace-normal ${className}`}
                      onClick={() => !showAnswer && selectAnswer(key)}
                      disabled={showAnswer}
                    >
                      <span className="font-medium mr-3">{key}.</span>
                      <span>{value}</span>
                    </Button>
                  );
                })}
              </div>
              
              {showAnswer && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-green-800">
                    Correct Answer: {currentQuestion.correctAnswer}. {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                  {selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                    <p className="text-red-600 mt-2">
                      You selected: {selectedAnswer}. {currentQuestion.options[selectedAnswer]}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button 
                  onClick={nextQuestion}
                  disabled={!showAnswer}
                >
                  {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next'}
                  {currentQuestionIndex < quizQuestions.length - 1 && 
                    <ChevronRight className="h-4 w-4 ml-2" />
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
}
