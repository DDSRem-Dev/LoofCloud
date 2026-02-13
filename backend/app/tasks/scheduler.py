"""APScheduler v4 异步任务调度器"""

import logging

from apscheduler import AsyncScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from app.tasks import jobs

logger = logging.getLogger("loofcloud.scheduler")

scheduler = AsyncScheduler()


async def start_scheduler():
    """注册所有定时任务并启动调度器"""

    # --- 间隔任务 ---
    await scheduler.add_schedule(
        jobs.cleanup_expired_tokens,
        IntervalTrigger(hours=1),
        id="cleanup_expired_tokens",
    )

    # --- 定时任务 (Cron) ---
    await scheduler.add_schedule(
        jobs.daily_stats_report,
        CronTrigger(hour=2, minute=0),  # 每天凌晨 2:00
        id="daily_stats_report",
    )

    await scheduler.start_in_background()
    logger.info("调度器已启动")


async def stop_scheduler():
    """优雅关闭调度器"""
    await scheduler.stop()
    logger.info("调度器已停止")
