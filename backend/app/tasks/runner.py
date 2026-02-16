from collections.abc import Callable, Coroutine
from typing import Any

from apscheduler import AsyncScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.logger import logger
from app.tasks import jobs


AsyncJob = Callable[[], Coroutine[Any, Any, None]]


class TaskRunner:
    """
    定时任务运行器
    """

    __slots__ = ("_scheduler",)

    def __init__(self) -> None:
        self._scheduler = AsyncScheduler()

    async def __aenter__(self) -> "TaskRunner":
        await self._scheduler.__aenter__()
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.stop()
        await self._scheduler.__aexit__(exc_type, exc_val, exc_tb)

    async def add_interval(
        self,
        job_id: str,
        func: AsyncJob,
        *,
        hours: float = 0,
        minutes: float = 0,
        seconds: float = 0,
    ) -> None:
        """
        注册按间隔执行的任务。

        :param job_id: 任务唯一 ID
        :param func: 无参 async 函数
        :param hours: 间隔小时数
        :param minutes: 间隔分钟数
        :param seconds: 间隔秒数
        """
        trigger = IntervalTrigger(hours=hours, minutes=minutes, seconds=seconds)
        await self._scheduler.add_schedule(func, trigger, id=job_id)

    async def add_cron(self, job_id: str, func: AsyncJob, **cron_kwargs: Any) -> None:
        """
        注册按 Cron 表达式执行的任务。

        :param job_id: 任务唯一 ID
        :param func: 无参 async 函数
        :param cron_kwargs: 传给 CronTrigger 的参数，如 hour=2, minute=0
        """
        trigger = CronTrigger(**cron_kwargs)
        await self._scheduler.add_schedule(func, trigger, id=job_id)

    async def register_all(self) -> None:
        """
        注册所有内置定时任务。需在 async with task_runner 内调用。
        """
        await self.add_interval(
            "cleanup_expired_tokens",
            jobs.cleanup_expired_tokens,
            hours=1,
        )
        await self.add_cron(
            "daily_stats_report",
            jobs.daily_stats_report,
            hour=2,
            minute=0,
        )
        logger.info("定时任务已注册")

    async def start_background(self) -> None:
        """
        在后台启动调度器。
        """
        await self._scheduler.start_in_background()

    async def stop(self) -> None:
        """
        优雅停止调度器。
        """
        await self._scheduler.stop()
        logger.info("调度器已停止")


task_runner = TaskRunner()
