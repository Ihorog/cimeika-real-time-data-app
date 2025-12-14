import unittest

from backend.utils.orchestrator import (
    LOG_FILE,
    PriorityTaskScheduler,
    SimpleTaskExecutor,
    Task,
    TaskOrchestrator,
)


class PriorityTaskSchedulerTest(unittest.TestCase):
    def setUp(self):
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        LOG_FILE.write_text("")

    def test_tasks_are_sorted_by_priority(self):
        scheduler = PriorityTaskScheduler()
        scheduler.schedule(Task(id="low", module="podia", payload={}, priority=1))
        scheduler.schedule(Task(id="high", module="mood", payload={}, priority=3))
        scheduler.schedule(Task(id="medium", module="gallery", payload={}, priority=2))

        ordered = [task.id for task in iter(scheduler.next, None)]

        self.assertEqual(ordered, ["high", "medium", "low"])


class TaskOrchestratorStatusTest(unittest.TestCase):
    def setUp(self):
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        LOG_FILE.write_text("")

    def test_dispatch_logs_status_changes(self):
        orchestrator = TaskOrchestrator()
        orchestrator.register_handler("demo", lambda task: {"result": task.payload.get("value", 0)})

        orchestrator.dispatch(Task(id="t-1", module="demo", payload={"value": 42}, priority=5))

        self.assertTrue(LOG_FILE.exists())
        log_text = LOG_FILE.read_text()
        self.assertIn("t-1", log_text)
        self.assertIn("Scheduled task", log_text)
        self.assertIn("Completed task", log_text)

    def test_executor_marks_tasks_without_handlers(self):
        executor = SimpleTaskExecutor()
        task = Task(id="missing", module="unknown", payload={}, priority=1)

        result = executor.execute(task)

        self.assertEqual(result["status"], "skipped")
        self.assertEqual(result["message"], "No handler")
        self.assertEqual(task.status, "skipped")

    def test_executor_marks_tasks_with_handlers(self):
        executor = SimpleTaskExecutor()

        def handler(task: Task):
            return {"echo": task.payload.get("value")}

        executor.register_handler("demo", handler)
        task = Task(id="handled", module="demo", payload={"value": 123}, priority=1)

        result = executor.execute(task)

        self.assertEqual(result["status"], "complete")
        self.assertEqual(result["result"], {"echo": 123})
        self.assertEqual(task.status, "complete")


if __name__ == "__main__":
    unittest.main()
