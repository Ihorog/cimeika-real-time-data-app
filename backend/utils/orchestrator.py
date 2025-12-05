from collections import deque
from dataclasses import dataclass, field
from typing import Any, Callable, Deque, Dict, List, Optional


@dataclass
class Task:
    id: str
    module: str
    payload: Dict[str, Any]
    priority: int = 1
    status: str = "pending"


class PriorityTaskScheduler:
    def __init__(self):
        self.queue: Deque[Task] = deque()

    def schedule(self, task: Task) -> Task:
        insert_index = next((i for i, existing in enumerate(self.queue) if existing.priority < task.priority), len(self.queue))
        self.queue.insert(insert_index, task)
        return task

    def next(self) -> Optional[Task]:
        return self.queue.popleft() if self.queue else None

    def snapshot(self) -> List[Dict[str, Any]]:
        return [task.__dict__ for task in list(self.queue)]


class SimpleTaskExecutor:
    def __init__(self, handlers: Optional[Dict[str, Callable[[Task], Dict[str, Any]]]] = None):
        self.handlers = handlers or {}

    def register(self, module: str, handler: Callable[[Task], Dict[str, Any]]):
        self.handlers[module] = handler

    def execute(self, task: Task) -> Dict[str, Any]:
        handler = self.handlers.get(task.module)
        if not handler:
            task.status = "skipped"
            return {"id": task.id, "status": task.status, "message": "No handler"}
        task.status = "processing"
        result = handler(task)
        task.status = "complete"
        return {"id": task.id, "status": task.status, **result}


class TaskOrchestrator:
    def __init__(self):
        self.scheduler = PriorityTaskScheduler()
        self.executor = SimpleTaskExecutor()
        self.history: List[Dict[str, Any]] = []

    def register_handler(self, module: str, handler: Callable[[Task], Dict[str, Any]]):
        self.executor.register(module, handler)

    def dispatch(self, task: Task) -> Dict[str, Any]:
        self.scheduler.schedule(task)
        next_task = self.scheduler.next()
        if not next_task:
            return {"status": "idle"}
        result = self.executor.execute(next_task)
        self.history.append(result)
        return result

    def status(self) -> Dict[str, Any]:
        return {
            "pending": self.scheduler.snapshot(),
            "history": self.history[-10:],
        }
