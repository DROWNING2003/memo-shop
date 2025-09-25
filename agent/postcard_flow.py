"""
明信片生成流程 - 使用PocketFlow封装明信片生成流程
对应 utils/message_processor.py 中的功能，但使用节点化设计
包含语音生成功能
"""

from pocketflow import Flow
from nodes import MQMessageProcessorNode, MQPostcardGenerationNode, MQPostcardSaveNode, MQVoiceGenerationNode, MQPostcardVoiceUpdateNode
import logging

logger = logging.getLogger(__name__)

def create_postcard_flow():
    """
    创建明信片生成流程（包含语音生成）
    
    流程设计：
    1. MQMessageProcessorNode: 验证MQ消息格式
    2. MQPostcardGenerationNode: 生成明信片内容
    3. MQPostcardSaveNode: 保存明信片到数据库
    4. MQVoiceGenerationNode: 生成语音文件
    5. MQPostcardVoiceUpdateNode: 更新明信片语音URL
    
    返回:
        Flow: 配置好的明信片生成流程
    """
    # 创建节点实例
    message_processor_node = MQMessageProcessorNode(max_retries=2, wait=2)
    postcard_generation_node = MQPostcardGenerationNode(max_retries=3, wait=5)
    postcard_save_node = MQPostcardSaveNode(max_retries=2, wait=3)
    voice_generation_node = MQVoiceGenerationNode(max_retries=3, wait=5)
    voice_update_node = MQPostcardVoiceUpdateNode(max_retries=2, wait=3)
    
    # 连接节点流程
    # 消息验证通过 -> 生成明信片 -> 保存明信片 -> 生成语音 -> 更新语音URL
    message_processor_node - "process_postcard" >> postcard_generation_node
    postcard_generation_node >> postcard_save_node
    postcard_save_node >> voice_generation_node
    voice_generation_node >> voice_update_node
    
    # 消息验证失败 -> 错误处理（直接结束流程）
    message_processor_node - "error" >> None
    
    # 创建流程，从消息处理节点开始
    flow = Flow(start=message_processor_node)
    
    logger.info("明信片生成流程（包含语音）创建完成")
    return flow

def process_mq_message_with_flow(mq_message):
    """
    使用PocketFlow流程处理MQ消息（包含语音生成）
    
    Args:
        mq_message: MQ消息字典，包含：
            - conversation_id: 会话ID
            - user_id: 用户ID
            - character_id: 角色ID
            - user_message: 用户消息
    
    Returns:
        dict: 处理结果，包含成功状态和相关信息
    """
    try:
        # 创建共享存储
        shared = {
            "mq_message": mq_message,
            "postcard_data": None,
            "postcard_saved": False,
            "voice_data": None,
            "voice_updated": False
        }
        
        # 创建并运行流程
        flow = create_postcard_flow()
        flow.run(shared)
        
        # 返回处理结果
        result = {
            "success": shared.get("postcard_saved", False),
            "conversation_id": mq_message.get("conversation_id"),
            "user_id": mq_message.get("user_id"),
            "character_id": mq_message.get("character_id"),
            "postcard_content": shared.get("postcard_data", {}).get("content") if shared.get("postcard_data") else None,
            "voice_generated": shared.get("voice_data") is not None,
            "voice_updated": shared.get("voice_updated", False),
            "voice_url": shared.get("voice_data", {}).get("voice_url") if shared.get("voice_data") else None
        }
        
        logger.info(f"明信片流程处理完成 - 会话: {result['conversation_id']}, 成功: {result['success']}, 语音生成: {result['voice_generated']}")
        return result
        
    except Exception as e:
        logger.error(f"明信片流程处理失败: {e}")
        return {
            "success": False,
            "error": str(e),
            "conversation_id": mq_message.get("conversation_id") if mq_message else "unknown"
        }

# 全局流程实例
postcard_flow = create_postcard_flow()

if __name__ == "__main__":
    # 测试明信片生成流程
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # 测试消息数据
    test_message = {
        "conversation_id": "test-conversation-123",
        "user_id": 1,
        "character_id": 1,
        "user_message": "你好，请帮我写一张生日祝福明信片"
    }
    
    print("开始测试明信片生成流程...")
    result = process_mq_message_with_flow(test_message)
    
    print(f"处理结果: {result}")
    
    if result["success"]:
        print("明信片生成成功!")
        print(f"明信片内容: {result['postcard_content']}")
    else:
        print("明信片生成失败!")
        if "error" in result:
            print(f"错误信息: {result['error']}")
