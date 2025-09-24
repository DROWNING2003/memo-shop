from openai import OpenAI
import os
from .prompts import BASE_SYSTEM_PROMPT
from .role_manager import get_role_manager

# Learn more about calling the LLM: https://the-pocket.github.io/PocketFlow/utility_function/llm.html
def call_llm(prompt, character_id=None, temperature=0.7, max_tokens=1000):
    """
    调用LLM进行对话，支持角色扮演
    
    Args:
        prompt: 用户输入的问题或对话内容
        character_id: 角色ID，从数据库获取角色信息
        temperature: 生成温度，控制随机性
        max_tokens: 最大生成token数
    
    Returns:
        AI回复内容
    """
    client = OpenAI(
        api_key="sk-ozqugiditsrmdfgpkihvlvruadjtyurfenwfcrsrdjzektop", 
        base_url="https://api.siliconflow.cn/v1"
    )
    
    # 构建消息列表
    messages = []
    
    # 添加系统提示词（优先使用数据库角色信息）
    if character_id:
        role_manager = get_role_manager()
        system_prompt = role_manager.get_character_role_prompt(character_id)
    else:
        system_prompt = BASE_SYSTEM_PROMPT
    
    messages.append({"role": "system", "content": system_prompt})
    
    # 添加用户消息
    messages.append({"role": "user", "content": prompt})
    
    # 调用API
    r = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.1",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return r.choices[0].message.content

def call_llm_with_context(prompt, context=None):
    """
    带上下文的LLM调用
    
    Args:
        prompt: 当前用户输入
        context: 对话历史上下文
    
    Returns:
        AI回复内容
    """
    client = OpenAI(
        api_key="sk-ozqugiditsrmdfgpkihvlvruadjtyurfenwfcrsrdjzektop", 
        base_url="https://api.siliconflow.cn/v1"
    )
    
    messages = []
    
    # 添加系统提示词
    system_prompt = BASE_SYSTEM_PROMPT
    
    messages.append({"role": "system", "content": system_prompt})
    
    # 添加上下文历史
    if context:
        for msg in context:
            messages.append(msg)
    
    # 添加当前用户消息
    messages.append({"role": "user", "content": prompt})
    
    # 调用API
    r = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.1",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    return r.choices[0].message.content

if __name__ == "__main__":
    # 测试基础功能
    prompt = "你好，请帮我写一张生日祝福明信片"
    response = call_llm(prompt)
    print("基础回复:")
    print(response)
    
    # 测试数据库角色功能（如果有角色的话）
    print("\n" + "="*50)
    try:
        from .role_manager import get_role_manager
        rm = get_role_manager()
        characters = rm.list_all_characters()
        if characters:
            test_char_id = characters[0]['id']
            response = call_llm(prompt, character_id=test_char_id)
            print(f"数据库角色 {test_char_id} 回复:")
            print(response)
        else:
            print("没有可用的数据库角色")
    except Exception as e:
        print(f"测试数据库角色功能失败: {e}")
