import logging
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Deque, Dict, List, Optional


LOG_FILE = Path(__file__).resolve().parents[2] / "data" / "orchestrator_status.log"

logger = logging.getLogger("backend.orchestrator")
if not logger.handlers:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(LOG_FILE)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


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
        logger.info("Scheduled task %s for module %s with priority %s", task.id, task.module, task.priority)
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
            logger.warning("Skipped task %s: no handler registered for module %s", task.id, task.module)
            return {"id": task.id, "status": task.status, "message": "No handler"}
        task.status = "processing"
        logger.info("Executing task %s for module %s", task.id, task.module)
        result = handler(task)
        task.status = "complete"
        logger.info("Completed task %s with status %s", task.id, task.status)
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
            logger.info("No task available for execution")
            return {"status": "idle"}
        logger.info("Dispatching task %s for module %s", next_task.id, next_task.module)
        result = self.executor.execute(next_task)
        self.history.append(result)
        logger.info("Task %s archived with result: %s", next_task.id, result.get("status"))
        return result

    def status(self) -> Dict[str, Any]:
        return {
            "pending": self.scheduler.snapshot(),
            "history": self.history[-10:],
        }
