import {
  IOptions,
  IChatItem,
  Language,
  VoiceType,
  ITrulienceSettings,
} from "@/types";
import { Character, Postcard } from "@/types/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  EMobileActiveTab,
  DEFAULT_OPTIONS,
  COLOR_LIST,
  isEditModeOn,
  DEFAULT_TRULIENCE_OPTIONS
} from "@/common/constant";
import {
  apiReloadPackage,
  apiFetchGraphs,
  apiFetchInstalledAddons,
  apiFetchGraphDetails,
  apiUpdateGraph,
  apiSaveProperty,
  apiLoadApp,
} from "@/common/request"
import {
  setOptionsToLocal,
  setTrulienceSettingsToLocal,
} from "@/common/storage"
import { AddonDef, Graph } from "@/common/graph";
import { useAppSelector } from "@/common/hooks";

export interface InitialState {
  options: IOptions;
  roomConnected: boolean;
  agentConnected: boolean;
  rtmConnected: boolean;
  themeColor: string;
  language: Language;
  voiceType: VoiceType;
  chatItems: IChatItem[];
  selectedGraphId: string;
  graphList: Graph[];
  graphMap: Record<string, Graph>;
  addonModules: AddonDef.Module[]; // addon modules
  mobileActiveTab: EMobileActiveTab;
  trulienceSettings: ITrulienceSettings;
  // 新增状态：角色信息和明信片
  currentCharacter: Character | null;
  recentPostcards: Postcard[];
  characterLoading: boolean;
  postcardsLoading: boolean;
}

const getInitialState = (): InitialState => {
  return {
    options: DEFAULT_OPTIONS,
    themeColor: COLOR_LIST[0].active,
    roomConnected: false,
    agentConnected: false,
    rtmConnected: false,
    language: "en-US",
    voiceType: "male",
    chatItems: [],
    selectedGraphId: "",
    graphList: [],
    graphMap: {},
    addonModules: [],
    mobileActiveTab: EMobileActiveTab.AGENT,
    trulienceSettings: DEFAULT_TRULIENCE_OPTIONS,
    // 新增状态初始化
    currentCharacter: null,
    recentPostcards: [],
    characterLoading: false,
    postcardsLoading: false,
  };
};

export const globalSlice = createSlice({
  name: "global",
  initialState: getInitialState(),
  reducers: {
    setOptions: (state, action: PayloadAction<Partial<IOptions>>) => {
      state.options = { ...state.options, ...action.payload };
      setOptionsToLocal(state.options);
    },
    setTrulienceSettings: (state, action: PayloadAction<ITrulienceSettings>) => {
      state.trulienceSettings = { ...state.trulienceSettings, ...action.payload };
      setTrulienceSettingsToLocal(state.trulienceSettings);
    },
    setThemeColor: (state, action: PayloadAction<string>) => {
      state.themeColor = action.payload;
      document.documentElement.style.setProperty(
        "--theme-color",
        action.payload
      );
    },
    setRoomConnected: (state, action: PayloadAction<boolean>) => {
      state.roomConnected = action.payload;
    },
    setRtmConnected: (state, action: PayloadAction<boolean>) => {
      state.rtmConnected = action.payload;
    },
    addChatItem: (state, action: PayloadAction<IChatItem>) => {
      const { userId, text, isFinal, type, time } = action.payload;
      const LastFinalIndex = state.chatItems.findLastIndex((el) => {
        return el.userId == userId && el.isFinal;
      });
      const LastNonFinalIndex = state.chatItems.findLastIndex((el) => {
        return el.userId == userId && !el.isFinal;
      });
      let LastFinalItem = state.chatItems[LastFinalIndex];
      let LastNonFinalItem = state.chatItems[LastNonFinalIndex];
      if (LastFinalItem) {
        // has last final Item
        if (time <= LastFinalItem.time) {
          // discard
          console.log(
            "[test] addChatItem, time < last final item, discard!:",
            text,
            isFinal,
            type
          );
          return;
        } else {
          if (LastNonFinalItem) {
            console.log(
              "[test] addChatItem, update last item(none final):",
              text,
              isFinal,
              type
            );
            state.chatItems[LastNonFinalIndex] = action.payload;
          } else {
            console.log(
              "[test] addChatItem, add new item:",
              text,
              isFinal,
              type
            );
            state.chatItems.push(action.payload);
          }
        }
      } else {
        // no last final Item
        if (LastNonFinalItem) {
          console.log(
            "[test] addChatItem, update last item(none final):",
            text,
            isFinal,
            type
          );
          state.chatItems[LastNonFinalIndex] = action.payload;
        } else {
          console.log("[test] addChatItem, add new item:", text, isFinal, type);
          state.chatItems.push(action.payload);
        }
      }
      state.chatItems.sort((a, b) => a.time - b.time);
    },
    setAgentConnected: (state, action: PayloadAction<boolean>) => {
      state.agentConnected = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setSelectedGraphId: (state, action: PayloadAction<string>) => {
      state.selectedGraphId = action.payload;
    },
    setGraphList: (state, action: PayloadAction<Graph[]>) => {
      state.graphList = action.payload;
    },
    setVoiceType: (state, action: PayloadAction<VoiceType>) => {
      state.voiceType = action.payload;
    },
    setMobileActiveTab: (state, action: PayloadAction<EMobileActiveTab>) => {
      state.mobileActiveTab = action.payload;
    },
    reset: (state) => {
      Object.assign(state, getInitialState());
      document.documentElement.style.setProperty(
        "--theme-color",
        COLOR_LIST[0].active
      );
    },
    setGraph: (state, action: PayloadAction<Graph>) => {
      let graphMap = JSON.parse(JSON.stringify(state.graphMap));
      graphMap[action.payload.graph_id] = action.payload;
      state.graphMap = graphMap;
    },
    setAddonModules: (state, action: PayloadAction<Record<string, any>[]>) => {
      state.addonModules = JSON.parse(JSON.stringify(action.payload));
    },
    // 新增：设置当前角色
    setCurrentCharacter: (state, action: PayloadAction<Character | null>) => {
      state.currentCharacter = action.payload;
    },
    // 新增：设置角色加载状态
    setCharacterLoading: (state, action: PayloadAction<boolean>) => {
      state.characterLoading = action.payload;
    },
    // 新增：设置最近明信片
    setRecentPostcards: (state, action: PayloadAction<Postcard[]>) => {
      state.recentPostcards = action.payload;
    },
    // 新增：设置明信片加载状态
    setPostcardsLoading: (state, action: PayloadAction<boolean>) => {
      state.postcardsLoading = action.payload;
    }
  },
});

// Initialize graph data
let initializeGraphData: any;
// Fetch graph details
let fetchGraphDetails: any;

if (isEditModeOn) {
  // only for development, below requests depend on dev-server
  initializeGraphData = createAsyncThunk(
    "global/initializeGraphData",
    async (_, { dispatch }) => {
      await apiReloadPackage();
      await apiLoadApp();
      const [fetchedGraphs, modules] = await Promise.all([
        apiFetchGraphs(),
        apiFetchInstalledAddons(),
      ]);
      dispatch(setGraphList(fetchedGraphs.map((graph) => graph)));
      dispatch(setAddonModules(modules));
    }
  );
  fetchGraphDetails = createAsyncThunk(
    "global/fetchGraphDetails",
    async (graph: Graph, { dispatch }) => {
      const updatedGraph = await apiFetchGraphDetails(graph);
      dispatch(setGraph(updatedGraph));
    }
  );
} else {
  initializeGraphData = createAsyncThunk(
    "global/initializeGraphData",
    async (_, { dispatch }) => {
      const fetchedGraphs = await apiFetchGraphs();
      dispatch(setGraphList(fetchedGraphs.map((graph) => graph)));
    }
  );
  fetchGraphDetails = createAsyncThunk(
    "global/fetchGraphDetails",
    async (graphId: string, { dispatch }) => {
      // Do nothing in production
      return
    }
  );
}

// Update a graph
export const updateGraph = createAsyncThunk(
  "global/updateGraph",
  async (
    { graph, updates }: { graph: Graph; updates: Partial<Graph> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await apiUpdateGraph(graph.graph_id, updates);
      // await apiSaveProperty();
      const updatedGraph = await apiFetchGraphDetails(graph);
      dispatch(setGraph(updatedGraph));
      return updatedGraph; // Optionally return the updated graph
    } catch (error: any) {
      // Handle error gracefully
      console.error("Error updating graph:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const {
  reset,
  setOptions,
  setRoomConnected,
  setAgentConnected,
  setRtmConnected,
  setVoiceType,
  addChatItem,
  setThemeColor,
  setLanguage,
  setSelectedGraphId,
  setGraphList,
  setMobileActiveTab,
  setGraph,
  setAddonModules,
  setTrulienceSettings,
  // 新增的 action
  setCurrentCharacter,
  setCharacterLoading,
  setRecentPostcards,
  setPostcardsLoading,
} = globalSlice.actions;

export {
  initializeGraphData, fetchGraphDetails
}

export default globalSlice.reducer;
