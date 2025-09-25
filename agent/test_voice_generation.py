#!/usr/bin/env python3
"""
语音生成功能测试脚本
测试明信片生成流程中的语音生成功能
"""

import sys
import os
import logging

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
