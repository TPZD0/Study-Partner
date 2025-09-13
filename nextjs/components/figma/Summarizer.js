import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Upload, FileText, Clock, Trash2, Edit2, Plus, ArrowLeft, BookOpen, Send, MessageCircle } from 'lucide-react';
// Converted from TSX to JS: removed type definitions
import { extractTextFromPDF } from '@/utils/pdfUtils';
import { generateSummaryFromContent } from '@/utils/summaryGenerator';

export function Summarizer({ summaryHistory, addSummary, deleteSummary, renameSummary, setCurrentPage }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedSummary(null);
    }
  };

  const generateSummary = async () => {
    if (!uploadedFile) {
      alert('Please select a file to upload first.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Check if it's a PDF file (by extension or MIME type)
      const isPdfByType = uploadedFile.type === 'application/pdf';
      const isPdfByName = uploadedFile.name.toLowerCase().endsWith('.pdf');
      
      if (isPdfByType || isPdfByName) {
        // Use smart PDF content analysis based on filename and metadata
        const extractedContent = await extractTextFromPDF(uploadedFile);
        
        // Generate summary from the analyzed content
        const generatedSummary = generateSummaryFromContent(extractedContent);
        
        // Save to history
        addSummary({
          title: 'Summary of ' + uploadedFile.name.replace(/\.pdf$/i, ''),
          fileName: uploadedFile.name,
          createdAt: new Date().toISOString(),
          content: generatedSummary.content,
          keyPoints: generatedSummary.keyPoints,
          wordCount: generatedSummary.wordCount
        });
      } else {
        // For non-PDF files, generate a generic summary
        const mockSummary = {
          title: 'Summary of ' + uploadedFile.name,
          content: `This document contains important information relevant to the uploaded file. The content has been processed and the key concepts have been identified for your review.

The document appears to cover various topics and provides detailed information that can be useful for study and reference purposes. The material is organized in a structured manner to facilitate understanding.

Please note that for the most accurate summary and quiz generation, PDF files are recommended as they allow for complete text extraction and analysis.`,
          keyPoints: [
            'Document contains relevant information for study purposes',
            'Content is structured for easy understanding',
            'Material covers various important topics',
            'Suitable for reference and learning',
            'PDF format recommended for best results'
          ],
          wordCount: 85
        };
        
        // Save to history
        addSummary({
          title: mockSummary.title,
          fileName: uploadedFile.name,
          createdAt: new Date().toISOString(),
          content: mockSummary.content,
          keyPoints: mockSummary.keyPoints,
          wordCount: mockSummary.wordCount
        });
      }
      
      // Reset upload state on success
      setUploadedFile(null);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setIsGenerating(false);
      
      // Don't reset the uploaded file so user can try again or upload a different file
      
      // Show specific error message
      let errorMessage = 'Error processing the file. Please try again.';
      if (error instanceof Error) {
        // Provide more helpful error messages
        if (error.message.includes('too large')) {
          errorMessage = error.message + ' Try compressing your PDF or using a smaller file.';
        } else if (error.message.includes('valid PDF')) {
          errorMessage = error.message + ' Make sure your file is a properly formatted PDF document.';
        } else if (error.message.includes('empty')) {
          errorMessage = error.message + ' Please check that your file is not corrupted.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show user-friendly error message
      alert(errorMessage);
    }
  };

  const openSummary = (summary) => {
    setSelectedSummary(summary);
    setChatMessages([]);
    setChatInput('');
  };

  const generateChatResponse = (question, summary) => {
    const lowerQuestion = question.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerQuestion.includes('what') && (lowerQuestion.includes('about') || lowerQuestion.includes('summary'))) {
      return `This summary is about ${summary.title.replace('Summary of ', '')}. The main content covers: ${summary.keyPoints.slice(0, 2).join(' and ')}.`;
    }
    
    if (lowerQuestion.includes('key point') || lowerQuestion.includes('main point')) {
      return `The key points from this summary are:\n${summary.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}`;
    }
    
    if (lowerQuestion.includes('explain') && lowerQuestion.includes('more')) {
      const randomPoint = summary.keyPoints[Math.floor(Math.random() * summary.keyPoints.length)];
      return `Let me elaborate on one of the key points: "${randomPoint}". This relates to the main themes discussed in the document and provides important context for understanding the overall content.`;
    }
    
    if (lowerQuestion.includes('how long') || lowerQuestion.includes('word count')) {
      return `This summary contains ${summary.wordCount} words and covers ${summary.keyPoints.length} key points. The original document was processed to extract the most important information.`;
    }
    
    if (lowerQuestion.includes('important') || lowerQuestion.includes('significant')) {
      const firstPoint = summary.keyPoints[0];
      return `One of the most important aspects highlighted in this summary is: "${firstPoint}". This forms a central part of the document's main message.`;
    }
    
    if (lowerQuestion.includes('help') || lowerQuestion.includes('study')) {
      return `To study this material effectively, focus on the ${summary.keyPoints.length} key points I've identified. You can also ask me specific questions about any part of the summary, like "What does [specific term] mean?" or "Explain more about [topic]".`;
    }
    
    // Check if question mentions any key point keywords
    for (const point of summary.keyPoints) {
      const pointWords = point.toLowerCase().split(' ');
      if (pointWords.some(word => word.length > 3 && lowerQuestion.includes(word))) {
        return `Regarding "${point}" - this is one of the key concepts in the summary. It relates to the main themes discussed in the document and is important for understanding the overall content.`;
      }
    }
    
    // Default responses
    const defaultResponses = [
      `Based on the summary, I can help explain concepts related to ${summary.title.replace('Summary of ', '')}. What specific aspect would you like me to clarify?`,
      `This summary covers several important points. You can ask me to explain any of the key points in more detail, or ask specific questions about the content.`,
      `I'm here to help you understand the material better. Try asking me about specific topics mentioned in the summary, or ask me to explain any key points in more detail.`,
      `Feel free to ask me about any specific part of the summary. I can help explain concepts, provide more detail on key points, or clarify anything that might be unclear.`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !selectedSummary) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: generateChatResponse(chatInput, selectedSummary),
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setIsChatting(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startNewUpload = () => {
    setSelectedSummary(null);
    setUploadedFile(null);
    setChatMessages([]);
    setChatInput('');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteSummary(id);
  };

  const handleEdit = (e, id, currentTitle) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameSummary(id, editingTitle);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle('');
  };

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
          <h1>AI Summarizer</h1>
        </div>
        <div className="flex items-center space-x-2">
          {selectedSummary && (
            <Button variant="outline" size="sm" onClick={startNewUpload}>
              <Plus className="h-4 w-4 mr-2" />
              New Upload
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div>
        {!selectedSummary ? (
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
                      Upload your study materials and get comprehensive summaries with key points
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
                            onClick={generateSummary} 
                            disabled={isGenerating}
                            className="px-8 py-3"
                          >
                            {isGenerating ? 'Generating Summary...' : 'Generate Summary'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Summaries Section */}
                {summaryHistory.length > 0 && (
                  <div>
                    <h3 className="mb-4">Previous Summaries</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {summaryHistory.map((summary) => (
                        <Card 
                          key={summary.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => openSummary(summary)}
                        >
                          <CardHeader className="pb-2">
                            <div className="space-y-3">
                              <div>
                                {editingId === summary.id ? (
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
                                        onClick={(e) => handleSaveEdit(e, summary.id)}
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
                                  <CardTitle className="break-words leading-tight">{summary.title}</CardTitle>
                                )}
                              </div>
                              {editingId !== summary.id && (
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(e, summary.id, summary.title);
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
                                      handleDelete(e, summary.id);
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
                                <span>{summary.fileName}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(summary.createdAt)}</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  {summary.wordCount} words • {summary.keyPoints.length} key points
                                </p>
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{selectedSummary.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-3">Summary</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {selectedSummary.content}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Ask Questions About This Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Ask me anything about this summary!</p>
                            <p className="text-sm mt-1">Try: "What are the key points?" or "Explain more about..."</p>
                          </div>
                        ) : (
                          chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.isUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleChatKeyPress}
                        placeholder="Ask a question about the summary..."
                        className="flex-1"
                        disabled={isChatting}
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isChatting}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <ul className="space-y-3">
                      {selectedSummary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                          <span className="text-muted-foreground leading-relaxed text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
