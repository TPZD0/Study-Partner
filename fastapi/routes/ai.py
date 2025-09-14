# routes/ai.py
from fastapi import APIRouter, HTTPException, Form
from fastapi.responses import JSONResponse
from ai_utils import summarize_pdf
from database import database
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/ai/summarize")
async def summarize_document(
    file_id: int = Form(...),
    max_length: int = Form(500)
):
    """
    Generate a summary for an uploaded PDF document.
    
    Args:
        file_id: The ID of the PDF file in the database
        max_length: Maximum length of the summary in words (default: 500)
    """
    try:
        # Get file information from database
        query = "SELECT * FROM pdf_files WHERE id = :file_id"
        file_record = await database.fetch_one(query=query, values={"file_id": file_id})
        
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = file_record["file_path"]
        
        # Check if file exists on disk
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF file not found on disk")
        
        # Generate summary
        result = await summarize_pdf(file_path, max_length)
        
        # Store summary in database (optional - you might want to cache summaries)
        update_query = """
        UPDATE pdf_files 
        SET summary = :summary, summary_generated_at = NOW()
        WHERE id = :file_id
        """
        await database.execute(
            query=update_query, 
            values={"summary": result["summary"], "file_id": file_id}
        )
        
        return JSONResponse({
            "file_id": file_id,
            "file_name": file_record["name"],
            "summary": result["summary"],
            "original_word_count": result["word_count"],
            "summary_word_count": result["summary_length"],
            "success": True
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing document {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@router.get("/ai/summary/{file_id}")
async def get_summary(file_id: int):
    """
    Retrieve an existing summary for a PDF file.
    """
    try:
        query = """
        SELECT id, name, summary, summary_generated_at, uploaded_at 
        FROM pdf_files 
        WHERE id = :file_id
        """
        file_record = await database.fetch_one(query=query, values={"file_id": file_id})
        
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")
        
        return JSONResponse({
            "file_id": file_record["id"],
            "file_name": file_record["name"],
            "summary": file_record["summary"],
            "summary_generated_at": file_record["summary_generated_at"].isoformat() if file_record["summary_generated_at"] else None,
            "uploaded_at": file_record["uploaded_at"].isoformat(),
            "has_summary": bool(file_record["summary"])
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving summary for file {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve summary: {str(e)}")

@router.get("/ai/files-with-summaries/{user_id}")
async def get_files_with_summaries(user_id: int, limit: int = 10):
    """
    Get recent PDF files for a user, indicating which ones have summaries.
    """
    try:
        query = """
        SELECT id, name, file_path, uploaded_at, 
               CASE WHEN summary IS NOT NULL THEN true ELSE false END as has_summary,
               summary_generated_at
        FROM pdf_files 
        WHERE user_id = :user_id 
        ORDER BY uploaded_at DESC 
        LIMIT :limit
        """
        files = await database.fetch_all(
            query=query, 
            values={"user_id": user_id, "limit": limit}
        )
        
        return [
            {
                "id": file["id"],
                "name": file["name"],
                "uploaded_at": file["uploaded_at"].isoformat(),
                "has_summary": file["has_summary"],
                "summary_generated_at": file["summary_generated_at"].isoformat() if file["summary_generated_at"] else None
            }
            for file in files
        ]
        
    except Exception as e:
        logger.error(f"Error retrieving files with summaries for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve files: {str(e)}")
