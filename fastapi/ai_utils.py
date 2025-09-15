import os
import PyPDF2
from openai import OpenAI
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file using PyPDF2.
    
    Args:
        file_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text from the PDF
    """
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract text from all pages
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
        
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

async def generate_summary(text: str, max_length: int = 500) -> str:
    """
    Generate a summary of the given text using OpenAI's GPT model.
    
    Args:
        text (str): The text to summarize
        max_length (int): Maximum length of the summary in words
        
    Returns:
        str: Generated summary
    """
    try:
        # Truncate text if it's too long (OpenAI has token limits)
        max_chars = 12000  # Roughly 3000 tokens
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
            logger.info(f"Text truncated to {max_chars} characters due to length")
        
        prompt = f"""
        Please provide a comprehensive summary of the following document. 
        The summary should be approximately {max_length} words and should capture the main points, key concepts, and important details.
        
        Document text:
        {text}
        
        Summary:
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates concise and informative summaries of academic and professional documents."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.3
        )
        
        summary = response.choices[0].message.content.strip()
        return summary
    
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise Exception(f"Failed to generate summary: {str(e)}")

async def answer_question_about_pdf(file_path: str, question: str) -> str:
    """
    Answer a question about the content of a PDF file using OpenAI's GPT model.
    
    Args:
        file_path (str): Path to the PDF file
        question (str): The question to answer
        
    Returns:
        str: Generated answer based on the PDF content
    """
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if not extracted_text.strip():
            raise Exception("No text could be extracted from the PDF")
        
        # Truncate text if it's too long (OpenAI has token limits)
        max_chars = 10000  # Leave room for question and response
        if len(extracted_text) > max_chars:
            extracted_text = extracted_text[:max_chars] + "..."
            logger.info(f"Text truncated to {max_chars} characters due to length")
        
        prompt = f"""
        Based on the following document content, please answer the user's question accurately and comprehensively. 
        If the answer cannot be found in the document, please say so clearly.
        
        Document content:
        {extracted_text}
        
        User's question: {question}
        
        Answer:
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on document content. Always base your answers on the provided document and be clear when information is not available in the document."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        answer = response.choices[0].message.content.strip()
        return answer
    
    except Exception as e:
        logger.error(f"Error answering question about PDF: {str(e)}")
        raise Exception(f"Failed to answer question: {str(e)}")

async def summarize_pdf(file_path: str, max_length: int = 500) -> dict:
    """
    Extract text from a PDF and generate a summary.
    
    Args:
        file_path (str): Path to the PDF file
        max_length (int): Maximum length of the summary in words
        
    Returns:
        dict: Contains 'text', 'summary', and 'word_count'
    """
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if not extracted_text.strip():
            raise Exception("No text could be extracted from the PDF")
        
        # Generate summary
        summary = await generate_summary(extracted_text, max_length)
        
        # Count words in original text
        word_count = len(extracted_text.split())
        
        return {
            "text": extracted_text,
            "summary": summary,
            "word_count": word_count,
            "summary_length": len(summary.split())
        }
    
    except Exception as e:
        logger.error(f"Error in summarize_pdf: {str(e)}")
        raise Exception(f"Failed to summarize PDF: {str(e)}")
