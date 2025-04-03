from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    task_list_id: UUID

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    completed_by: Optional[UUID] = None

class TaskResponse(TaskBase):
    id: UUID
    task_list_id: UUID
    completed: bool = False
    completed_by: Optional[UUID] = None
    created_at: datetime

class TaskListBase(BaseModel):
    title: str

class TaskListCreate(TaskListBase):
    pass

class TaskListUpdate(BaseModel):
    title: Optional[str] = None

class TaskListResponse(TaskListBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    tasks: List[TaskResponse] = []

class TaskListMemberBase(BaseModel):
    user_id: UUID
    list_id: UUID
    role: str = "member"  # Can be "owner" or "member"

class TaskListMemberCreate(TaskListMemberBase):
    pass

class TaskListMemberResponse(TaskListMemberBase):
    id: UUID 