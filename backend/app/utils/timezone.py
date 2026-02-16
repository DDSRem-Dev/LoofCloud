from datetime import datetime, timezone
from zoneinfo import ZoneInfo


DEFAULT_TIMEZONE = "Asia/Shanghai"


class TimezoneUtils:
    """
    时区工具
    """

    @staticmethod
    def get_tz(timezone_name: str = DEFAULT_TIMEZONE) -> ZoneInfo:
        """
        返回指定时区

        :param timezone_name: 时区名称
        :return: ZoneInfo
        """
        return ZoneInfo(timezone_name)

    @staticmethod
    def now_utc() -> datetime:
        """
        当前时间 UTC

        :return: datetime 当前时间 UTC
        """
        return datetime.now(timezone.utc)

    @staticmethod
    def now_local(timezone_name: str = DEFAULT_TIMEZONE) -> datetime:
        """
        当前时间

        :param timezone_name: 时区名称
        :return: datetime 当前时间
        """
        return datetime.now(TimezoneUtils.get_tz(timezone_name))
