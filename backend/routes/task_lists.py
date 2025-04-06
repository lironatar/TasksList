from fastapi import APIRouter, HTTPException, Depends, Form, Body, Request
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import uuid
import json
from db_config import execute_query
from routes.auth import get_current_user

router = APIRouter(prefix="/api/v1", tags=["tasks"])

# Models
class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"
    due_date: Optional[str] = None

class Task(TaskBase):
    id: str
    list_id: str
    created_at: str
    updated_at: str

class TaskListBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskListCreate(TaskListBase):
    tasks: Optional[List[TaskCreate]] = []

class TaskList(TaskListBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

# Task Lists Routes
@router.get("/task-lists")
async def get_task_lists(user = Depends(get_current_user)):
    """Get all task lists for the current user"""
    # Query for task lists
    query = """
    SELECT tl.id, tl.title, tl.description, tl.created_at, tl.user_id
    FROM task_lists tl
    WHERE tl.user_id = %s
    ORDER BY tl.created_at DESC
    """
    
    result = execute_query(query, (user['id'],))
    
    # For each task list, get the count of tasks and completed tasks
    for task_list in result:
        # Get total task count
        count_query = """
        SELECT COUNT(*) as task_count
        FROM tasks
        WHERE list_id = %s
        """
        count_result = execute_query(count_query, (task_list['id'],))
        task_list['task_count'] = count_result[0]['task_count'] if count_result else 0
        
        # Get completed task count
        completed_query = """
        SELECT COUNT(*) as completed_count
        FROM tasks
        WHERE list_id = %s AND status = 'completed'
        """
        completed_result = execute_query(completed_query, (task_list['id'],))
        task_list['completed_count'] = completed_result[0]['completed_count'] if completed_result else 0
    
    return result

@router.get("/task-lists/{list_id}")
async def get_task_list(list_id: str, user = Depends(get_current_user)):
    """Get a specific task list"""
    query = """
    SELECT * FROM task_lists
    WHERE id = %s AND user_id = %s
    """
    
    result = execute_query(query, (list_id, user['id']))
    
    if not result or len(result) == 0:
        raise HTTPException(status_code=404, detail="Task list not found")
    
    return result[0]

@router.post("/task-lists")
async def create_task_list(
    request: Request,
    user = Depends(get_current_user)
):
    """Create a new task list"""
    try:
        list_id = str(uuid.uuid4())
        
        # Determine content type
        content_type = request.headers.get("Content-Type", "")
        
        # Handle form data
        if content_type.startswith("multipart/form-data") or content_type.startswith("application/x-www-form-urlencoded"):
            form_data = await request.form()
            title = form_data.get("title")
            description = form_data.get("description")
            tasks = []
            
            if not title:
                raise HTTPException(status_code=400, detail="Title is required")
            
            print(f"Creating task list from form data: title={title.encode('ascii', 'replace').decode() if title else None}")
        else:
            # Handle JSON data
            try:
                data = await request.json()
                title = data.get("title")
                description = data.get("description")
                tasks = data.get("tasks", [])
                
                if not title:
                    raise HTTPException(status_code=400, detail="Title is required")
                
                print(f"Creating task list from JSON: title={title.encode('ascii', 'replace').decode() if title else None}, tasks count={len(tasks)}")
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON data")
        
        # Insert into database
        query = """
        INSERT INTO task_lists (id, user_id, title, description)
        VALUES (%s, %s, %s, %s)
        """
        
        execute_query(query, (list_id, user['id'], title, description), fetch=False)
        
        # Create tasks if provided
        if tasks:
            print(f"Creating {len(tasks)} tasks for list {list_id}")
            for i, task in enumerate(tasks):
                try:
                    task_id = str(uuid.uuid4())
                    
                    # Get task fields
                    task_title = task.get("title") if isinstance(task, dict) else None
                    task_description = task.get("description") if isinstance(task, dict) else None
                    task_priority = task.get("priority", "medium") if isinstance(task, dict) else "medium"
                    task_status = task.get("status", "pending") if isinstance(task, dict) else "pending"
                    task_due_date = task.get("due_date") if isinstance(task, dict) else None
                    
                    if not task_title:
                        continue  # Skip tasks without a title
                    
                    # Print safe version of task title for logging
                    safe_title = task_title.encode('ascii', 'replace').decode() if task_title else None
                    print(f"Creating task {i+1}: {safe_title}")
                    
                    task_query = """
                    INSERT INTO tasks (id, list_id, title, description, priority, status, due_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    execute_query(
                        task_query, 
                        (
                            task_id, 
                            list_id, 
                            task_title, 
                            task_description, 
                            task_priority, 
                            task_status, 
                            task_due_date
                        ), 
                        fetch=False
                    )
                except Exception as e:
                    print(f"Error creating task {i+1}: {str(e).encode('ascii', 'replace').decode()}")
        
        # Return the created task list
        get_query = """
        SELECT * FROM task_lists
        WHERE id = %s
        """
        
        result = execute_query(get_query, (list_id,))
        return result[0]
    except Exception as e:
        error_msg = str(e).encode('ascii', 'replace').decode()
        print(f"Error creating task list: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Failed to create task list: {error_msg}")

@router.put("/task-lists/{list_id}")
async def update_task_list(list_id: str, task_list: TaskListBase, user = Depends(get_current_user)):
    """Update a task list"""
    # Check if the task list exists and belongs to the user
    check_query = """
    SELECT id FROM task_lists
    WHERE id = %s AND user_id = %s
    """
    
    check_result = execute_query(check_query, (list_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task list not found")
    
    # Update the task list
    update_query = """
    UPDATE task_lists
    SET title = %s, description = %s
    WHERE id = %s
    """
    
    execute_query(update_query, (task_list.title, task_list.description, list_id), fetch=False)
    
    # Return the updated task list
    get_query = """
    SELECT * FROM task_lists
    WHERE id = %s
    """
    
    result = execute_query(get_query, (list_id,))
    return result[0]

@router.delete("/task-lists/{list_id}")
async def delete_task_list(list_id: str, user = Depends(get_current_user)):
    """Delete a task list"""
    # Check if the task list exists and belongs to the user
    check_query = """
    SELECT id FROM task_lists
    WHERE id = %s AND user_id = %s
    """
    
    check_result = execute_query(check_query, (list_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task list not found")
    
    # Delete the task list
    delete_query = """
    DELETE FROM task_lists
    WHERE id = %s
    """
    
    execute_query(delete_query, (list_id,), fetch=False)
    
    return {"message": "Task list deleted successfully"}

# Tasks Routes
@router.get("/task-lists/{list_id}/tasks")
async def get_tasks(list_id: str, user = Depends(get_current_user)):
    """Get all tasks for a specific task list"""
    # Check if the task list exists and belongs to the user
    check_query = """
    SELECT id FROM task_lists
    WHERE id = %s AND user_id = %s
    """
    
    check_result = execute_query(check_query, (list_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task list not found")
    
    # Get the tasks
    query = """
    SELECT * FROM tasks
    WHERE list_id = %s
    ORDER BY created_at DESC
    """
    
    result = execute_query(query, (list_id,))
    return result

@router.post("/task-lists/{list_id}/tasks")
async def create_task(list_id: str, task: TaskCreate, user = Depends(get_current_user)):
    """Create a new task"""
    # Check if the task list exists and belongs to the user
    check_query = """
    SELECT id FROM task_lists
    WHERE id = %s AND user_id = %s
    """
    
    check_result = execute_query(check_query, (list_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task list not found")
    
    # Create the task
    task_id = str(uuid.uuid4())
    
    insert_query = """
    INSERT INTO tasks (id, list_id, title, description, priority, status, due_date)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    execute_query(
        insert_query, 
        (
            task_id, 
            list_id, 
            task.title, 
            task.description, 
            task.priority, 
            task.status, 
            task.due_date
        ), 
        fetch=False
    )
    
    # Return the created task
    get_query = """
    SELECT * FROM tasks
    WHERE id = %s
    """
    
    result = execute_query(get_query, (task_id,))
    return result[0]

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskBase, user = Depends(get_current_user)):
    """Update a task"""
    # Check if the task exists and belongs to a list owned by the user
    check_query = """
    SELECT t.*
    FROM tasks t
    JOIN task_lists l ON t.list_id = l.id
    WHERE t.id = %s AND l.user_id = %s
    """
    
    check_result = execute_query(check_query, (task_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get the current task data
    current_task = check_result[0]
    
    # Build the query dynamically based on what fields were provided
    update_fields = []
    update_values = []
    
    if task.title is not None:
        update_fields.append("title = %s")
        update_values.append(task.title)
    
    if task.description is not None:
        update_fields.append("description = %s")
        update_values.append(task.description)
    
    if task.priority is not None:
        update_fields.append("priority = %s")
        update_values.append(task.priority)
    
    if task.status is not None:
        update_fields.append("status = %s")
        update_values.append(task.status)
    
    if task.due_date is not None:
        update_fields.append("due_date = %s")
        update_values.append(task.due_date)
    
    # If no fields to update, return the current task
    if not update_fields:
        return current_task
    
    # Build and execute the update query
    update_query = f"""
    UPDATE tasks
    SET {", ".join(update_fields)}
    WHERE id = %s
    """
    
    # Add the task_id to the values
    update_values.append(task_id)
    
    execute_query(update_query, tuple(update_values), fetch=False)
    
    # Return the updated task
    get_query = """
    SELECT * FROM tasks
    WHERE id = %s
    """
    
    result = execute_query(get_query, (task_id,))
    return result[0]

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user = Depends(get_current_user)):
    """Delete a task"""
    # Check if the task exists and belongs to a list owned by the user
    check_query = """
    SELECT t.id
    FROM tasks t
    JOIN task_lists l ON t.list_id = l.id
    WHERE t.id = %s AND l.user_id = %s
    """
    
    check_result = execute_query(check_query, (task_id, user['id']))
    
    if not check_result or len(check_result) == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete the task
    delete_query = """
    DELETE FROM tasks
    WHERE id = %s
    """
    
    execute_query(delete_query, (task_id,), fetch=False)
    
    return {"message": "Task deleted successfully"} 