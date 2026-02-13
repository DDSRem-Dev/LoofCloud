"""定时任务定义"""

import logging

logger = logging.getLogger("loofcloud.jobs")


async def cleanup_expired_tokens():
    """清理 Redis 中过期的刷新令牌，每小时执行"""
    logger.info("执行: cleanup_expired_tokens")
    # TODO: 实现


async def daily_stats_report():
    """生成每日统计报告，每天 02:00 执行"""
    logger.info("执行: daily_stats_report")
    # TODO: 实现
