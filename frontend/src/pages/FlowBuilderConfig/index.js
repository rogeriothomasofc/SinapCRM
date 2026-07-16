import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  useRef,
} from "react";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { Box, Button, CircularProgress, IconButton, Switch, Chip, TextField, Select, MenuItem } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CloseIcon from "@material-ui/icons/Close";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import RemoveEdge from "./nodes/removeEdge";
import singleBlockNode from "./nodes/singleBlockNode";
import ticketNode from "./nodes/ticketNode";

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
  Dialog,
} from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import BallotIcon from "@mui/icons-material/Ballot";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";

import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";

import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  LibraryBooks,
  RocketLaunch,
  Save as SaveIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Replay as ReplayIcon,
} from "@mui/icons-material";

import { useNodeStorage } from "../../stores/useNodeStorage";
import { ConfirmationNumber } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  flowContainer: {
    width: "100%",
    height: "calc(100vh - 64px)",
    position: "relative",
    display: "flex",
    backgroundColor: "#F8F9FA",
  },
  menuContainer: {
    position: "absolute",
    top: 16,
    left: 60, // Posicionado ao lado do botão
    zIndex: 1000,
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    padding: "8px 0",
    width: 180,
    overflow: "hidden",
    transition: "transform 0.3s ease, opacity 0.3s ease",
  },
  menuHeader: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderBottom: "1px solid #f0f0f0",
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#666",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.2s ease",
    "&:hover": {
      backgroundColor: "#f5f5f5",
      transform: "translateX(4px)",
    },
  },
  menuIcon: {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginRight: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: 500,
  },
  menuToggle: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1001,
    backgroundColor: "white",
    color: "#673AB7",
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
};

const edgeTypes = {
  buttonedge: RemoveEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
  },
];

const initialEdges = [];

const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const [rulesConfig, setRulesConfig] = useState({
    allowGroups: false,
    onlyScheduledHours: false,
    noResponseIfOpen: false,
    customSignature: false,
    simulateTyping: false,
    noCrmContacts: false,
    noCrm: false,
    onlyCrm: false,
    noTaggedContacts: false,
    noTags: false,
    onlyTags: false,
  });
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simMessages, setSimMessages] = useState([]);
  const [simInput, setSimInput] = useState("");
  const [simCurrentNode, setSimCurrentNode] = useState(null);
  const simEndRef = useRef(null);
  const simVarsRef = useRef({});
  const [triggerConfig, setTriggerConfig] = useState({
    any: false,
    keyword: false,
    keywords: [],
    firstOfDay: false,
    firstEver: false,
    reactivationInterval: 0,
    reactivationUnit: "Segundos",
  });

  const connectionLineStyle = { 
    stroke: "#2b2b2b", 
    strokeWidth: "3px",
    strokeDasharray: "5,5",
  };
  
  // Estilo único para todas as conexões com efeito de iluminação
  const edgeStyle = {
    stroke: "#91D5FF", // Azul bebê
    strokeWidth: "3px",
    filter: "drop-shadow(0 0 5px rgba(145, 213, 255, 0.7))"
  };

  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX = nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    if (type === "start") {
      return setNodes((old) => {
        return [
          ...old.filter((item) => item.id !== "1"),
          {
            id: "1",
            position: { x: posX, y: posY },
            data: { label: "Inicio do fluxo" },
            type: "start",
          },
        ];
      });
    }
    if (type === "text") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message",
          },
        ];
      });
    }
    if (type === "interval") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval",
          },
        ];
      });
    }
    if (type === "condition") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value,
            },
            type: "condition",
          },
        ];
      });
    }
    if (type === "menu") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption,
            },
            type: "menu",
          },
        ];
      });
    }
    if (type === "img") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img",
          },
        ];
      });
    }
    if (type === "audio") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio",
          },
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer",
          },
        ];
      });
    }
    if (type === "video") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video",
          },
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock",
          },
        ];
      });
    }

    if (type === "ticket") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket",
          },
        ];
      });
    }

    if (type === "typebot") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "typebot",
          },
        ];
      });
    }

    if (type === "openai") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "openai",
          },
        ];
      });
    }

    if (type === "question") {
      return setNodes((old) => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "question",
          },
        ];
      });
    }
  };

  const textAdd = (data) => {
    addNode("text", data);
  };

  const intervalAdd = (data) => {
    addNode("interval", data);
  };

  const conditionAdd = (data) => {
    addNode("condition", data);
  };

  const menuAdd = (data) => {
    addNode("menu", data);
  };

  const imgAdd = (data) => {
    addNode("img", data);
  };

  const audioAdd = (data) => {
    addNode("audio", data);
  };

  const randomizerAdd = (data) => {
    addNode("randomizer", data);
  };

  const videoAdd = (data) => {
    addNode("video", data);
  };

  const singleBlockAdd = (data) => {
    addNode("singleBlock", data);
  };

  const ticketAdd = (data) => {
    addNode("ticket", data);
  };

  const typebotAdd = (data) => {
    addNode("typebot", data);
  };

  const openaiAdd = (data) => {
    addNode("openai", data);
  };

  const questionAdd = (data) => {
    addNode("question", data);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      // Criar a conexão com o estilo padrão azul bebê e animação
      const edge = {
        ...params,
        style: edgeStyle,
        animated: true // Garante que a animação seja aplicada
      };
      
      return setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const saveFlow = async () => {
    try {
      await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
        trigger: triggerConfig,
        rules: rulesConfig,
      });
      toast.success("Fluxo salvo com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const doubleClick = (event, node) => {
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }
    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit");
    }
    if (node.type === "typebot") {
      setModalAddTypebot("edit");
    }
    if (node.type === "openai") {
      setModalAddOpenAI("edit");
    }
    if (node.type === "question") {
      setModalAddQuestion("edit");
    }
  };

  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { backgroundColor: "#0000FF", padding: 1, borderRadius: 8 },
          };
        }
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const clickEdge = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 },
        };
      })
    );
  };

  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
  };

  // Constantes modernizadas para o menu
  const menuItems = [
    {
      icon: <RocketLaunch style={{ fontSize: 18 }} />,
      name: "Início",
      type: "start",
      color: "#00C853",
      bgColor: "#E8F5E9",
    },
    {
      icon: <DynamicFeed style={{ fontSize: 18 }} />,
      name: "Menu",
      type: "menu",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    },
    {
      icon: <LibraryBooks style={{ fontSize: 18 }} />,
      name: "Conteúdo",
      type: "content",
      color: "#1E88E5",
      bgColor: "#E3F2FD",
    },
    {
      icon: <CallSplit style={{ fontSize: 18 }} />,
      name: "Randomizador",
      type: "random",
      color: "#FF5722",
      bgColor: "#FBE9E7",
    },
    {
      icon: <AccessTime style={{ fontSize: 18 }} />,
      name: "Intervalo",
      type: "interval",
      color: "#FFC107",
      bgColor: "#FFF8E1",
    },
    {
      icon: <ConfirmationNumber style={{ fontSize: 18 }} />,
      name: "Ticket",
      type: "ticket",
      color: "#795548",
      bgColor: "#EFEBE9",
    },
    {
      icon: <Box component="img" src={typebotIcon} sx={{ width: 18, height: 18 }} />,
      name: "TypeBot",
      type: "typebot",
      color: "#3F51B5",
      bgColor: "#E8EAF6",
    },
    {
      icon: <SiOpenai style={{ fontSize: 18 }} />,
      name: "OpenAI",
      type: "openai",
      color: "#00BCD4",
      bgColor: "#E0F7FA",
    },
    {
      icon: <BallotIcon style={{ fontSize: 18 }} />,
      name: "Pergunta",
      type: "question",
      color: "#F44336",
      bgColor: "#FFEBEE",
    },
  ];

  const clickActions = (type) => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break;
      case "question":
        setModalAddQuestion("create");
        break;
      default:
    }
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);
          if (data.flow.flow !== null) {
            const flowNodes = data.flow.flow.nodes;
            setNodes(flowNodes);

            const flowEdges = data.flow.flow.connections.map(edge => ({
              ...edge,
              animated: true,
              style: edgeStyle
            }));
            setEdges(flowEdges);

            if (data.flow.flow.trigger) {
              setTriggerConfig(data.flow.flow.trigger);
            }
            if (data.flow.flow.rules) {
              setRulesConfig(data.flow.flow.rules);
            }
            setFlowActive(data.flow.active || false);
            
            const filterVariables = flowNodes.filter(
              (nd) => nd.type === "question"
            );
            const variables = filterVariables.map(
              (variable) => variable.data.typebotIntegration.answerKey
            );
            localStorage.setItem("variables", JSON.stringify(variables));
          }
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map((node) => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY,
        },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 },
      };
      setNodes((old) => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  // Effect para garantir que todas as edges estejam animadas
  useEffect(() => {
    if (edges.length > 0) {
      // Aplica animação a todas as edges existentes
      setEdges(prevEdges => 
        prevEdges.map(edge => ({
          ...edge,
          animated: true,
          style: edgeStyle
        }))
      );
    }
  }, []);

  // ── Ativo / Desativado ──────────────────────────────────────────────────────
  const handleToggleActive = async () => {
    const next = !flowActive;
    setFlowActive(next);
    try {
      await api.post("/flowbuilder/active", { flowId: parseInt(id), active: next });
    } catch (err) {
      setFlowActive(!next);
      toastError(err);
    }
  };

  // ── Simulador ───────────────────────────────────────────────────────────────
  const continueFrom = useCallback((nodeId, currentMsgs, vars) => {
    const rv = (text) => {
      if (!text) return text;
      return text.replace(/{{\s*([^{}\s]+)\s*}}/g, (match, key) =>
        vars[key] !== undefined ? vars[key] : match
      );
    };

    const msgs = [...currentMsgs];
    let node = nodes.find(n => n.id === nodeId);
    const visited = new Set();
    let stoppedAt = null;

    while (node && !visited.has(node.id)) {
      visited.add(node.id);
      const type = node.type;

      if (type === "start") {
        // nó de início — só avança
      } else if (type === "message") {
        msgs.push({ role: "bot", text: rv(node.data.label) });
      } else if (type === "singleBlock") {
        const el = node.data?.elements?.find(e => e.original || e.value);
        const raw = el ? (el.original || el.value) : (node.data?.label || "Conteúdo");
        msgs.push({ role: "bot", text: rv(raw) });
      } else if (type === "menu") {
        msgs.push({ role: "bot", text: rv(node.data.message || node.data.label), options: node.data.arrayOption, nodeId: node.id });
        stoppedAt = node;
        break;
      } else if (type === "interval") {
        msgs.push({ role: "bot", text: `⏱ Intervalo de ${node.data.sec}s`, system: true });
      } else if (type === "openai") {
        msgs.push({ role: "bot", text: "🤖 Aqui a IA responderia com base no prompt configurado.", system: true });
        stoppedAt = node;
        break;
      } else if (type === "question") {
        const q = rv(node.data?.typebotIntegration?.message || node.data?.label || "Responda abaixo...");
        msgs.push({ role: "bot", text: q });
        stoppedAt = node;
        break;
      } else if (type === "ticket") {
        msgs.push({ role: "bot", text: "🎫 Atendimento criado com sucesso.", system: true });
      } else if (type === "typebot") {
        msgs.push({ role: "bot", text: "🤖 Integração TypeBot ativada.", system: true });
        stoppedAt = node;
        break;
      } else if (type === "randomizer") {
        msgs.push({ role: "bot", text: "🔀 Randomizador — o fluxo seguiria por um caminho aleatório.", system: true });
        stoppedAt = node;
        break;
      }

      const conn = edges.find(e => e.source === node.id);
      if (!conn) {
        const terminalTypes = ["menu", "openai", "question", "typebot", "randomizer"];
        if (!terminalTypes.includes(type)) {
          msgs.push({ role: "bot", text: "— Fim do fluxo —", system: true });
        }
        break;
      }
      node = nodes.find(n => n.id === conn.target);
    }

    setSimMessages(msgs);
    setSimCurrentNode(stoppedAt);
    setTimeout(() => simEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [nodes, edges]);

  const startSimulation = useCallback(() => {
    setSimMessages([]);
    setSimCurrentNode(null);
    setSimInput("");
    simVarsRef.current = {};
  }, []);

  const checkTrigger = useCallback((message) => {
    const lower = message.toLowerCase().trim();
    if (!triggerConfig.any && !triggerConfig.keyword && !triggerConfig.firstOfDay && !triggerConfig.firstEver) {
      return true; // sem acionamento configurado → sempre dispara
    }
    if (triggerConfig.any || triggerConfig.firstOfDay || triggerConfig.firstEver) return true;
    if (triggerConfig.keyword && triggerConfig.keywords.length > 0) {
      return triggerConfig.keywords.some(kw => lower.includes(kw.toLowerCase()));
    }
    return false;
  }, [triggerConfig]);

  const handleMenuOptionClick = useCallback((option, menuNodeId) => {
    const newMsgs = [...simMessages, { role: "user", text: option.value }];
    setSimMessages(newMsgs);
    setSimCurrentNode(null);
    const handleId = "a" + option.number;
    const conn = edges.find(e => e.source === menuNodeId && e.sourceHandle === handleId);
    if (conn) {
      const vars = simVarsRef.current;
      setTimeout(() => continueFrom(conn.target, newMsgs, vars), 400);
    }
  }, [simMessages, edges, continueFrom]);

  const handleSimSend = useCallback(() => {
    if (!simInput.trim()) return;
    const text = simInput.trim();
    let newMsgs = [...simMessages, { role: "user", text }];
    setSimMessages(newMsgs);
    setSimInput("");

    // Primeira mensagem → verifica acionamento
    if (simMessages.length === 0 && !simCurrentNode) {
      const triggered = checkTrigger(text);
      if (!triggered) {
        setTimeout(() => {
          setSimMessages(prev => [...prev, {
            role: "bot",
            text: "Esta mensagem não corresponde às palavras-chave configuradas. O fluxo não seria iniciado.",
            system: true,
          }]);
        }, 400);
        return;
      }
      const startNode = nodes.find(n => n.type === "start");
      if (!startNode) {
        setTimeout(() => setSimMessages(prev => [...prev, { role: "bot", text: "⚠️ Adicione um bloco Início ao fluxo.", system: true }]), 400);
        return;
      }
      const firstConn = edges.find(e => e.source === startNode.id);
      if (!firstConn) {
        setTimeout(() => setSimMessages(prev => [...prev, { role: "bot", text: "⚠️ Conecte o bloco Início a outro bloco para simular.", system: true }]), 400);
        return;
      }
      setTimeout(() => continueFrom(startNode.id, newMsgs, simVarsRef.current), 400);
      return;
    }

    // Continuação — resposta a pergunta
    if (simCurrentNode) {
      let vars = simVarsRef.current;
      if (simCurrentNode.type === "question") {
        const answerKey = simCurrentNode.data?.typebotIntegration?.answerKey;
        if (answerKey) {
          vars = { ...vars, [answerKey]: text };
          simVarsRef.current = vars;
          // Re-substitui todas as mensagens anteriores com a variável recém capturada
          const rv = (t) => t ? t.replace(/{{\s*([^{}\s]+)\s*}}/g, (m, k) => vars[k] !== undefined ? vars[k] : m) : t;
          newMsgs = newMsgs.map(msg =>
            msg.role === "bot" && msg.text && !msg.options
              ? { ...msg, text: rv(msg.text) }
              : msg
          );
          setSimMessages(newMsgs);
        }
      }
      const conn = edges.find(e => e.source === simCurrentNode.id);
      if (conn) setTimeout(() => continueFrom(conn.target, newMsgs, vars), 400);
      setSimCurrentNode(null);
    }
  }, [simInput, simMessages, simCurrentNode, nodes, edges, continueFrom, checkTrigger]);

  return (
    <MainContainer style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "visible" }}>
      {/* Modais de configuração */}
      <FlowBuilderAddTextModal open={modalAddText} onSave={textAdd} data={dataNode} onUpdate={updateNode} close={setModalAddText} />
      <FlowBuilderIntervalModal open={modalAddInterval} onSave={intervalAdd} data={dataNode} onUpdate={updateNode} close={setModalAddInterval} />
      <FlowBuilderMenuModal open={modalAddMenu} onSave={menuAdd} data={dataNode} onUpdate={updateNode} close={setModalAddMenu} />
      <FlowBuilderAddImgModal open={modalAddImg} onSave={imgAdd} data={dataNode} onUpdate={updateNode} close={setModalAddImg} />
      <FlowBuilderAddAudioModal open={modalAddAudio} onSave={audioAdd} data={dataNode} onUpdate={updateNode} close={setModalAddAudio} />
      <FlowBuilderRandomizerModal open={modalAddRandomizer} onSave={randomizerAdd} data={dataNode} onUpdate={updateNode} close={setModalAddRandomizer} />
      <FlowBuilderAddVideoModal open={modalAddVideo} onSave={videoAdd} data={dataNode} onUpdate={updateNode} close={setModalAddVideo} />
      <FlowBuilderSingleBlockModal open={modalAddSingleBlock} onSave={singleBlockAdd} data={dataNode} onUpdate={updateNode} close={setModalAddSingleBlock} />
      <FlowBuilderTicketModal open={modalAddTicket} onSave={ticketAdd} data={dataNode} onUpdate={updateNode} close={setModalAddTicket} />
      <FlowBuilderOpenAIModal open={modalAddOpenAI} onSave={openaiAdd} data={dataNode} onUpdate={updateNode} close={setModalAddOpenAI} />
      <FlowBuilderTypebotModal open={modalAddTypebot} onSave={typebotAdd} data={dataNode} onUpdate={updateNode} close={setModalAddTypebot} />
      <FlowBuilderAddQuestionModal open={modalAddQuestion} onSave={questionAdd} data={dataNode} onUpdate={updateNode} close={setModalAddQuestion} />

      {/* Modal Simulador */}
      <Dialog
        open={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: 560 } }}
      >
        {/* Header do simulador */}
        <Box style={{ background: "linear-gradient(135deg, #673AB7 0%, #512DA8 100%)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <ChatIcon style={{ color: "white", fontSize: 20 }} />
          <Typography style={{ color: "white", fontWeight: 700, fontSize: 15, flex: 1 }}>Chat de simulação</Typography>
          <IconButton size="small" onClick={startSimulation} style={{ color: "rgba(255,255,255,0.8)", padding: 4 }} title="Reiniciar">
            <ReplayIcon style={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={() => setSimulatorOpen(false)} style={{ color: "rgba(255,255,255,0.8)", padding: 4 }}>
            <CloseIcon style={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Área de mensagens */}
        <Box style={{ flex: 1, overflowY: "auto", padding: "12px 10px", backgroundColor: "#ECE5DD", backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {simMessages.length === 0 ? (
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
              <Typography style={{ fontSize: 13, color: "#555", textAlign: "center" }}>Inicie uma conversa enviando uma mensagem</Typography>
            </Box>
          ) : simMessages.map((msg, i) => (
            <Box key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <Box style={{ maxWidth: "80%", backgroundColor: msg.role === "user" ? "#DCF8C6" : (msg.system ? "#f0f0f0" : "white"), borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
                <Typography style={{ fontSize: 13, color: msg.system ? "#888" : "#222", fontStyle: msg.system ? "italic" : "normal", whiteSpace: "pre-wrap" }}>{msg.text}</Typography>
                {msg.options && (
                  <Box style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {msg.options.map((opt) => (
                      <Button key={opt.number} size="small" variant="outlined"
                        style={{ textTransform: "none", fontSize: 12, borderRadius: 16, borderColor: "#673AB7", color: "#673AB7", justifyContent: "flex-start" }}
                        onClick={() => handleMenuOptionClick(opt, msg.nodeId)}
                      >
                        {opt.number}. {opt.value}
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <div ref={simEndRef} />
        </Box>

        {/* Input */}
        <Box style={{ padding: "10px 12px", backgroundColor: "#F0F0F0", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <TextField
            fullWidth size="small" variant="outlined"
            placeholder="Digite sua mensagem aqui..."
            value={simInput}
            onChange={e => setSimInput(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSimSend()}
            InputProps={{ style: { borderRadius: 24, backgroundColor: "white", fontSize: 13 } }}
          />
          <IconButton onClick={handleSimSend} style={{ backgroundColor: "#673AB7", color: "white", padding: 8 }} size="small">
            <SendIcon style={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Dialog>

      {/* Título da página */}
      <MainHeader style={{ borderBottom: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>
        <IconButton
          color="primary"
          onClick={() => history.goBack()}
          style={{ marginRight: 16, backgroundColor: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.15)" }}
          aria-label="Voltar para página anterior"
        >
          <ArrowBackIcon />
        </IconButton>
        <Title>Desenhe seu fluxo</Title>

        <Box style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChatIcon />}
            onClick={() => { setSimulatorOpen(true); startSimulation(); }}
            style={{ textTransform: "none", borderRadius: 20, borderColor: "#673AB7", color: "#673AB7", fontWeight: 500, whiteSpace: "nowrap" }}
          >
            Simular fluxo
          </Button>

          <Box
            onClick={handleToggleActive}
            style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid #e0e0e0", borderRadius: 20, padding: "3px 12px 3px 4px", backgroundColor: "white", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <Switch size="small" color="primary" checked={flowActive} onChange={() => {}} />
            <Typography style={{ fontSize: 13, fontWeight: 500, color: flowActive ? "#673AB7" : "#9E9E9E", whiteSpace: "nowrap" }}>
              {flowActive ? "Ativo" : "Desativado"}
            </Typography>
          </Box>
        </Box>
      </MainHeader>

      {/* Área principal do ReactFlow */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box className={classes.flowContainer}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDoubleClick={doubleClick}
            onNodeClick={clickNode}
            onEdgeClick={clickEdge}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            connectionLineStyle={{ 
              stroke: "#91D5FF", 
              strokeWidth: "3px", 
              strokeDasharray: "5,5",
              filter: "drop-shadow(0 0 3px rgba(145, 213, 255, 0.5))" 
            }}
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
            }}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              animated: true,
              style: edgeStyle
            }}
            proOptions={{ hideAttribution: true }}
          >
            {/* Menu button */}
            <Box 
              className={classes.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuIcon />
            </Box>
            
            {/* Menu expandido com itens */}
            {menuOpen && (
              <Box style={{
                position: "absolute",
                top: 16,
                left: 64,
                zIndex: 1000,
                backgroundColor: "white",
                borderRadius: 10,
                boxShadow: "0 6px 24px rgba(103,58,183,0.15), 0 2px 6px rgba(0,0,0,0.08)",
                width: 220,
                maxHeight: "calc(100vh - 300px)",
                overflowY: "auto",
                border: "1px solid rgba(103,58,183,0.12)",
                animation: "fadeIn 0.2s ease",
              }}>
                {/* Header */}
                <Box style={{
                  display: "flex", alignItems: "center",
                  padding: "10px 12px",
                  background: "linear-gradient(135deg, #673AB7 0%, #512DA8 100%)",
                  borderRadius: "10px 10px 0 0",
                  position: "sticky",
                  top: 0,
                }}>
                  <MenuIcon style={{ color: "white", fontSize: 16, marginRight: 6 }} />
                  <Typography style={{ flex: 1, fontWeight: 700, fontSize: 13, color: "white" }}>
                    Blocos
                  </Typography>
                  <IconButton size="small" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.8)", padding: 2 }}>
                    <CloseIcon style={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                <Box style={{ padding: "6px 8px 8px" }}>
                  <Typography style={{ fontSize: 9, fontWeight: 700, color: "#BDBDBD", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
                    Adicionar bloco
                  </Typography>

                  {menuItems.map((item) => (
                    <Box
                      key={item.type}
                      style={{
                        display: "flex", alignItems: "center",
                        padding: "5px 8px",
                        marginBottom: 3,
                        borderRadius: 6,
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #EFEFEF",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => {
                        clickActions(item.type);
                        setMenuOpen(false);
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = item.bgColor;
                        e.currentTarget.style.borderColor = item.color + "55";
                        e.currentTarget.style.transform = "translateX(3px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "#FAFAFA";
                        e.currentTarget.style.borderColor = "#EFEFEF";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <Box style={{
                        width: 24, height: 24,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 5,
                        backgroundColor: item.bgColor,
                        color: item.color,
                        marginRight: 8,
                        flexShrink: 0,
                      }}>
                        {item.icon}
                      </Box>
                      <Typography style={{ fontSize: 12, fontWeight: 500, color: item.color }}>
                        {item.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Botão Salvar no canto superior direito */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveFlow}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1000,
                borderRadius: 30,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                textTransform: "none",
                padding: "6px 16px",
                fontWeight: "bold",
                backgroundColor: "#673AB7",
              }}
            >
              Salvar
            </Button>


            {/* Controles de navegação e MiniMap */}
            <Controls />
            <MiniMap />
            <Background
              variant="dots"
              gap={15}
              size={1}
              color="#CCCCCC"
              style={{ opacity: 0.4 }}
            />
          </ReactFlow>
        </Box>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </MainContainer>
  );
};

export default FlowBuilderConfig;