# memo-shop/agent/voice/__init__.py

from .fish import FishVoiceModel

# 可选：添加包级别的文档字符串
__doc__ = """
语音处理模块

提供语音合成和自定义语音训练功能的Fish Audio SDK实现
"""

__all__ = [
    'FishVoiceModel',
]

# 可选：包版本信息
__version__ = '0.1.0'
