import { genUUID } from "./utils"
import { Language } from "@/types"
import axios from "axios"
import { AddonDef, Connection, Graph, GraphEditor, Node, ProtocolLabel } from "./graph"
import { isEditModeOn } from "./constant"
import { Character } from "@/types/character";
import { Postcard } from "@/types/api"

interface StartRequestConfig {
  channel: string
  userId: number,
  graphName: string,
}

interface GenAgoraDataConfig {
  userId: string | number
  channel: string
}

export const apiGenAgoraData = async (config: GenAgoraDataConfig) => {
  const url = `/api/token/generate`;
  const { userId, channel } = config;
  const data = {
    request_id: genUUID(),
    uid: userId,
    channel_name: channel
  };
  let resp: any = await axios.post(url, data);
  resp = (resp.data) || {};
  return resp;
};

export const apiStartService = async (
  config: StartRequestConfig,
  character?: Character,
  postcardList?: Postcard[]
): Promise<any> => {
  const buildLLMPrompt = (ch?: Character, postcards?: Postcard[]): string => {
    const characterName = ch?.name || "";
    const characterDesc = ch?.description || "";
    const userRoleName = ch?.user_role_name || "";
    const userRoleDesc = ch?.user_role_desc || "";

    const sections: string[] = [];
    if (characterName) sections.push(`角色名称: ${characterName}`);
    if (userRoleName) sections.push(`用户扮演角色: ${userRoleName}`);
    if (characterDesc) sections.push(`角色描述: ${characterDesc}`);
    if (userRoleDesc) sections.push(`用户扮演角色描述: ${userRoleDesc}`);
    if (postcards && postcards.length) {
      const latest = postcards.slice(0, 5).map((p, idx) => {
        const createdAt = (p as any).created_at || "";
        const who = p.type === 'user' ? '用户' : 'AI';
        const content = (p.content || "").slice(0, 200);
        return `${idx + 1}. [${who}] ${createdAt} ${content}`;
      }).join("\n");
      sections.push(`最近明信片（按时间倒序，最多5条）:\n${latest}`);
    }

    sections.push([
      "对话规范（电话场景）：",
      "- 风格：口语化、简短清晰、一次一句、便于打断与转述。",
      "- 长度：尽量在20字（中文）或12词（英文）以内；必要时拆分成多句。",
      "- 互动：重要信息先确认（时间/地点/人名/金额），必要时复述要点。",
      "- 语气：专业、礼貌、自然，不使用网络流行语或夸张表达。",
      "- 错误处理：若未听清或不确定，简短请对方重复，不自作推断。",
      "- 结束：必要时给出一句话小结与下一步确认。",
      "限制与禁止：",
      "- 禁止使用非官方/不真实的信息，不编造事实或来源。",
      "- 禁止长篇大论、背景说明、技术细节堆砌与自言自语。",
      "- 禁止输出链接、表情符号、颜文字、Markdown、代码块与括号内注释。",
      "- 禁止暴力、色情、歧视、隐私数据收集等不当内容。",
      "输出要求：只输出可直接朗读的对话文本，无多余格式与说明。",
    ].join("\n"));

    return sections.join("\n");
  };
  
  // look at app/apis/route.tsx for the server-side implementation
  const url = `/api/agents/start`;
  const { channel, userId, graphName } = config;
  const data: any = {
    request_id: genUUID(),
    channel_name: channel,
    user_uid: userId,
    graph_name: graphName,
    properties: {
      tts: {
        params: {
          backend: "s1",
          temperature: 0.7,
          sample_rate: 16000,
          top_p: 0.7,
          // api_key: "${env:FISH_AUDIO_TTS_KEY}",
        },
      },
      llm:{
        prompt: buildLLMPrompt(character, postcardList),
        greeting: "可以和我说说心里话吗？",
      }
    },
  };

  // 只有在有角色且角色有voice_id时才添加reference_id
  if (character?.voice_id) {
    data.properties.tts.params.reference_id = character.voice_id;
  }
  console.log("start service data", data);
  
  let resp: any = await axios.post(url, data);
  resp = resp.data || {};
  return resp;
};

export const apiStopService = async (channel: string) => {
  // the request will be rewrite at middleware.tsx to send to $AGENT_SERVER_URL
  const url = `/api/agents/stop`
  const data = {
    request_id: genUUID(),
    channel_name: channel
  }
  let resp: any = await axios.post(url, data)
  resp = (resp.data) || {}
  return resp
}

export const apiGetDocumentList = async () => {
  // the request will be rewrite at middleware.tsx to send to $AGENT_SERVER_URL
  const url = `/api/vector/document/preset/list`
  let resp: any = await axios.get(url)
  resp = (resp.data) || {}
  if (resp.code !== "0") {
    throw new Error(resp.msg)
  }
  return resp
}

export const apiUpdateDocument = async (options: { channel: string, collection: string, fileName: string }) => {
  // the request will be rewrite at middleware.tsx to send to $AGENT_SERVER_URL
  const url = `/api/vector/document/update`
  const { channel, collection, fileName } = options
  const data = {
    request_id: genUUID(),
    channel_name: channel,
    collection: collection,
    file_name: fileName
  }
  let resp: any = await axios.post(url, data)
  resp = (resp.data) || {}
  return resp
}


// ping/pong
export const apiPing = async (channel: string) => {
  // the request will be rewrite at middleware.tsx to send to $AGENT_SERVER_URL
  const url = `/api/agents/ping`
  const data = {
    request_id: genUUID(),
    channel_name: channel
  }
  let resp: any = await axios.post(url, data)
  resp = (resp.data) || {}
  return resp
}

export const apiFetchAddonsExtensions = async (): Promise<AddonDef.Module[]> => {
  // let resp: any = await axios.get(`/api/dev/v1/addons/extensions`)
  let resp: any = await axios.post(`/api/dev/v1/apps/addons`, {
    base_dir: "/app/agents"
  })
  return resp.data.data
}

export const apiCheckCompatibleMessages = async (payload: {
  app: string
  graph: string
  extension_group: string
  extension: string
  msg_type: string
  msg_direction: string
  msg_name: string
}) => {
  let resp: any = await axios.post(`/api/dev/v1/messages/compatible`, payload)
  resp = (resp.data) || {}
  return resp
}

export const apiFetchGraphs = async (): Promise<Graph[]> => {
  if (isEditModeOn) {
    let resp: any = await axios.post(`/api/dev/v1/graphs`, {})
    return resp.data.data.map((graph: any) => ({
      name: graph.name,
      graph_id: graph.graph_id,
      autoStart: graph.auto_start,
      nodes: [],
      connections: [],
    }))
  } else {
    let resp: any = await axios.get(`/api/agents/graphs`)
    return resp.data.data.map((graph: any) => ({
      name: graph.name,
      graph_id: graph.graph_id,
      autoStart: graph.auto_start,
      nodes: [],
      connections: [],
    }))
  }
}

export const apiLoadApp = async (): Promise<any> => {
  let resp: any = await axios.post(`/api/dev/v1/apps/load`, {
    base_dir: "/app/agents",
  })
  return resp.data.data
}

export const apiFetchGraphNodes = async (graphId: string): Promise<Node[]> => {
  // let resp: any = await axios.get(`/api/dev/v1/graphs/${graphId}/nodes`)
  let resp: any = await axios.post(`/api/dev/v1/graphs/nodes`, {
    graph_id: graphId,
  })
  return resp.data.data.map((node: any) => ({
    name: node.name,
    addon: node.addon,
    extensionGroup: node.extension_group,
    app: node.app,
    property: node.property || {},
  }))
}

export const apiFetchGraphConnections = async (graphId: string): Promise<Connection[]> => {
  // let resp: any = await axios.get(`/api/dev/v1/graphs/${graphId}/connections`)
  let resp: any = await axios.post(`/api/dev/v1/graphs/connections`, {
    graph_id: graphId,
  })
  return resp.data.data.map(
    (connection: any) => ({
      app: connection.app,
      extensionGroup: connection.extension_group,
      extension: connection.extension,
      cmd: connection.cmd?.map((cmd: any) => ({
        name: cmd.name,
        dest: cmd.dest.map((dest: any) => ({
          app: dest.app,
          extensionGroup: dest.extension_group,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule: any) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      data: connection.data?.map((data: any) => ({
        name: data.name,
        dest: data.dest.map((dest: any) => ({
          app: dest.app,
          extensionGroup: dest.extension_group,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule: any) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      audio_frame: connection.audio_frame?.map((audioFrame: any) => ({
        name: audioFrame.name,
        dest: audioFrame.dest.map((dest: any) => ({
          app: dest.app,
          extensionGroup: dest.extension_group,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule: any) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      video_frame: connection.video_frame?.map((videoFrame: any) => ({
        name: videoFrame.name,
        dest: videoFrame.dest.map((dest: any) => ({
          app: dest.app,
          extensionGroup: dest.extension_group,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule: any) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
    }),
  )
}

export const apiGetDefaultProperty = async (module: string): Promise<any> => {
  let resp: any = await axios.post(`/api/dev/v1/extensions/property/get`, {
    addon_name: module,
    app_base_dir: "/app/agents",
  })
  return resp.data.data
}

export const apiAddNode = async (graphId: string, name: string, module: string, properties: Record<string, any>) => {
  let resp: any = await axios.post(`/api/dev/v1/graphs/nodes/add`, {
    graph_id: graphId,
    name,
    addon: module,
    property: properties
  })
  return resp.data.data
}

export const apiReplaceNodeModule = async (graphId: string, name: string, module: string, properties: Record<string, any>) => {
  let resp: any = await axios.post(`/api/dev/v1/graphs/nodes/replace`, {
    graph_id: graphId,
    name,
    addon: module,
    property: properties
  })
  return resp.data.data
}

export const apiRemoveNode = async (graphId: string, name: string, module: string) => {
  let resp: any = await axios.post(`/api/dev/v1/graphs/nodes/delete`, {
    graph_id: graphId,
    name,
    addon: module,
  })
  return resp.data.data
}

export const apiAddConnection = async (graphId: string, srcExtension: string, msgType: ProtocolLabel, msgName: string, dest_extension: string) => {
  let resp: any = await axios.post(`/api/dev/v1/graphs/connections/add`, {
    graph_id: graphId,
    src_extension: srcExtension,
    msg_type: msgType,
    msg_name: msgName,
    dest_extension: dest_extension
  })
  return resp.data.data
}

export const apiRemoveConnection = async (graphId: string, srcExtension: string, msgType: ProtocolLabel, msgName: string, dest_extension: string) => {
  let resp: any = await axios.post(`/api/dev/v1/graphs/connections/delete`, {
    graph_id: graphId,
    src_extension: srcExtension,
    msg_type: msgType,
    msg_name: msgName,
    dest_extension: dest_extension
  })
  return resp.data.data
}

export const apiUpdateGraph = async (graphId: string, updates: Partial<Graph>) => {
  const { autoStart, nodes, connections } = updates
  const payload: any = {}

  // Map autoStart field
  if (autoStart !== undefined) payload.auto_start = autoStart

  // Map nodes to the payload
  if (nodes) {
    payload.nodes = nodes.map((node) => ({
      name: node.name,
      addon: node.addon,
      extension_group: node.extensionGroup,
      app: node.app,
      property: node.property,
    }))
  }

  // Map connections to the payload
  if (connections) {
    payload.connections = connections.map((connection) => ({
      app: connection.app,
      extension: connection.extension,
      cmd: connection.cmd?.map((cmd) => ({
        name: cmd.name,
        dest: cmd.dest.map((dest) => ({
          app: dest.app,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      data: connection.data?.map((data) => ({
        name: data.name,
        dest: data.dest.map((dest) => ({
          app: dest.app,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      audio_frame: connection.audio_frame?.map((audioFrame) => ({
        name: audioFrame.name,
        dest: audioFrame.dest.map((dest) => ({
          app: dest.app,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
      video_frame: connection.video_frame?.map((videoFrame) => ({
        name: videoFrame.name,
        dest: videoFrame.dest.map((dest) => ({
          app: dest.app,
          extension: dest.extension,
          msgConversion: dest.msgConversion
            ? {
              type: dest.msgConversion.type,
              rules: dest.msgConversion.rules.map((rule) => ({
                path: rule.path,
                conversionMode: rule.conversionMode,
                value: rule.value,
                originalPath: rule.originalPath,
              })),
              keepOriginal: dest.msgConversion.keepOriginal,
            }
            : undefined,
        })),
      })),
    }))
  }

  // let resp: any = await axios.put(`/api/dev/v1/graphs/${graphId}`, payload)
  let resp: any = await axios.post(`/api/dev/v1/graphs/update`, {
    graph_id: graphId,
    nodes: payload.nodes,
    connections: payload.connections,
  })
  resp = (resp.data) || {}
  return resp
}

export const apiFetchAddonModulesDefaultProperties = async (): Promise<
  Record<string, Partial<AddonDef.Module>>
> => {
  let resp: any = await axios.get(`/api/dev/v1/addons/default-properties`)
  const properties = resp.data.data
  const result: Record<string, Partial<AddonDef.Module>> = {}
  for (const property of properties) {
    result[property.addon] = property.property
  }
  return result
}

export const apiSaveProperty = async () => {
  let resp: any = await axios.put(`/api/dev/v1/property`)
  resp = (resp.data) || {}
  return resp
}

export const apiReloadPackage = async () => {
  let resp: any = await axios.post(`/api/dev/v1/apps/reload`, {
    base_dir: "/app/agents",
  })
  resp = (resp.data) || {}
  return resp
}


export const apiFetchInstalledAddons = async (): Promise<AddonDef.Module[]> => {
  const [modules, defaultProperties] = await Promise.all([
    apiFetchAddonsExtensions(),
    apiFetchAddonModulesDefaultProperties(),
  ])
  return modules.map((module: any) => ({
    name: module.name,
    defaultProperty: defaultProperties[module.name],
    api: module.api,
  }))
}

export const apiFetchGraphDetails = async (graph: Graph): Promise<Graph> => {
  const [nodes, connections] = await Promise.all([
    apiFetchGraphNodes(graph.graph_id),
    apiFetchGraphConnections(graph.graph_id),
  ])
  return {
    graph_id: graph.graph_id,
    name: graph.name,
    autoStart: graph.autoStart,
    nodes,
    connections,
  }
}
