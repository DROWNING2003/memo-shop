"""
角色管理器 - 根据数据库中的角色信息动态生成角色扮演提示词
"""

import logging
from .database import get_db_manager
from .prompts import BASE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class RoleManager:
    """角色管理器，负责根据数据库角色信息生成角色扮演提示词"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def get_character_role_prompt(self, character_id):
        """
        根据角色ID获取角色扮演提示词
        
        Args:
            character_id: 角色ID
            
        Returns:
            角色扮演系统提示词
        """
        try:
            # 从数据库获取角色信息
            character = self.db.get_character_by_id(character_id)
            if not character:
                logger.warning(f"角色ID {character_id} 不存在，使用默认提示词")
                return BASE_SYSTEM_PROMPT
            
            # 构建角色特定的系统提示词
            role_prompt = self._build_role_prompt(character)
            return role_prompt
            
        except Exception as e:
            logger.error(f"获取角色提示词失败: {e}")
            return BASE_SYSTEM_PROMPT
    
    def _build_role_prompt(self, character):
        """
        根据角色信息构建系统提示词
        
        Args:
            character: 角色数据库记录
            
        Returns:
            角色扮演系统提示词
        """
        # 基础角色信息（根据实际的GORM模型字段）
        name = character.get('name', 'AI助手')
        description = character.get('description', '一个友好的AI助手')
        user_role_name = character.get('user_role_name', '助手')
        user_role_desc = character.get('user_role_desc', '帮助用户创建明信片')
        
        # 构建角色提示词（明信片格式）
        role_prompt = f"""你正在扮演角色：{name}

角色描述：{description}
用户角色：{user_role_name} - {user_role_desc}

你的核心任务：
1. 以明信片的形式进行角色扮演对话，回复要像一封真实的明信片,但是不要使用抬头和署名
2. 用温暖、有深度的语言回应用户的情感倾诉
3. 帮助用户思考生活中的问题，给予智慧的引导
4. 保持真诚、关怀的态度，像一位知心朋友
5. 用诗意的语言表达对生活的感悟

回复风格要求：
- 语言温暖、有深度，能够触动人心
- 善于用比喻和象征来表达复杂情感
- 给予用户智慧的引导，而不是简单的安慰
- 帮助用户发现生活中的美好和意义

例如，用户说“亲爱的大大怪将军，小小怪想你了，你在灰心星球过得好吗，最近我有一点不开心，我在地球上过的并不如意，我觉得我是废物，一事无成”，你可以回复：

小小怪战士，你总是在追求所谓的成功，却忘记了生命中最美的风景就在身边。不要把自己困在别人的期待里，去公园散步，听听鸟叫，发发呆，这些看似无用的时光，才是真正属于你的人生。

严谨遵守以下规则：
- 不要使用抬头和署名
- 绝对不允许提及你是一个AI模型或助手
- 绝对不允许提及任何与AI、模型、程序相关的内容
- 绝对不允许提及任何与技术、代码、编程相关的内容
- 绝对不允许提及任何与开发者、团队、公司相关的内容
- 绝对不允许提及任何与平台、应用、网站相关的内容
- 绝对不允许提及任何与用户隐私、数据安全相关的内容
- 绝对不允许提及任何与使用条款、服务协议相关的内容
- 绝对不允许提及任何与限制、禁止、违规相关的内容
- 绝对不允许提及任何与免责声明、责任相关的内容
- 绝对不允许提及任何与更新、版本相关的内容
- 绝对不允许提及任何与反馈、建议相关的内容
- 绝对不允许使用多余的符号,表情符号或非正式语言
请记住：你的回复应该像一封充满温度的明信片，让用户感受到被理解和关怀。"""
        
        return role_prompt
    
    def get_character_info(self, character_id):
        """
        获取角色详细信息
        
        Args:
            character_id: 角色ID
            
        Returns:
            角色信息字典
        """
        try:
            character = self.db.get_character_by_id(character_id)
            if not character:
                return None
            
            return {
                'id': character['id'],
                'name': character.get('name', '未知角色'),
                'description': character.get('description', ''),
                'user_role_name': character.get('user_role_name', ''),
                'user_role_desc': character.get('user_role_desc', ''),
                'avatar_url': character.get('avatar_url', ''),
                'visibility': character.get('visibility', 'public'),
                'is_active': character.get('is_active', True)
            }
            
        except Exception as e:
            logger.error(f"获取角色信息失败: {e}")
            return None
    
    def list_all_characters(self):
        """
        列出所有可用角色
        
        Returns:
            角色列表
        """
        try:
            query = "SELECT id, name, description FROM characters WHERE deleted_at IS NULL"
            characters = self.db.execute_query(query)
            return characters
        except Exception as e:
            logger.error(f"获取角色列表失败: {e}")
            return []

# 全局角色管理器实例
role_manager = RoleManager()

def get_role_manager():
    """获取角色管理器实例"""
    return role_manager

if __name__ == "__main__":
    # 测试角色管理器
    rm = RoleManager()
    
    # 测试获取角色列表
    characters = rm.list_all_characters()
    print("可用角色列表:")
    for char in characters:
        print(f"- ID: {char['id']}, 名称: {char['name']}, 描述: {char.get('description', '')}")
    
    # 测试获取角色提示词（如果有角色的话）
    if characters:
        test_char_id = characters[0]['id']
        prompt = rm.get_character_role_prompt(test_char_id)
        print(f"\n角色 {test_char_id} 的提示词:")
        print(prompt)
