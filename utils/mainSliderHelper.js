import {
  BookOpen, MessageSquare, Building2,
  Database, Shield, BarChart3, AlertTriangle, UserPlus,
  Bot,
  Blocks,
  Workflow,
  FileSliders,
  MessageSquareMore,
} from 'lucide-react';
import React from 'react';



export const ITEM_ICONS = {
  org: <Building2 size={12} />,
  agents: <Bot size={12} />,
  orchestratal_model: <Workflow size={12} />,
  chatbotConfig: <FileSliders size={12} />,
  chatbot: <MessageSquare size={12} />,
  pauthkey: <Shield size={12} />,
  apikeys: <Database size={12} />,
  alerts: <AlertTriangle size={12} />,
  invite: <UserPlus size={12} />,
  metrics: <BarChart3 size={12} />,
  knowledge_base: <BookOpen size={12} />,
  feedback: <MessageSquareMore size={12} />,
  RAG_embed: <Blocks size={12} />,
  integration: <Blocks size={12} />
};

export const DISPLAY_NAMES = (key) => {
  switch (key) {
    case 'orchestratal_model':
      return 'Orchestral Model';
    case 'knowledge_base':
      return 'Knowledge base';
    case 'chatbotConfig':
      return 'Configure Chatbot';
    case 'feedback':
      return 'Feedback';
    case 'tutorial':
      return 'Tutorial';
    case 'speak-to-us':
      return 'Speak to Us';
    case 'integration':
      return 'GTWY as Embed';
    case 'settings':
      return 'Settings';
    case 'RAG_embed':
      return 'RAG as Service';
    case 'invite':
      return 'Members';
    case 'pauthkey':
      return 'Auth Key';
    case 'apikeys':
      return 'API Keys';
    default:
      return key;
  }
};



export const NAV_SECTIONS = [
  { items: ['agents', 'orchestratal_model', 'chatbotConfig', 'knowledge_base'] },
  { title: 'SECURITY & ACCESS', items: ['pauthkey', 'apikeys'] },
  { title: 'MONITORING & SUPPORT', items: ['alerts', 'metrics'] },
  { title: 'Developer', items: ['integration', 'RAG_embed'] },
  { title: 'TEAM & COLLABORATION', items: ['invite'] }
];



export const HRCollapsed = React.memo(() => (
  <hr className="my-2 w-6 border-base-content/30 mx-auto" />
));

export const BetaBadge = React.memo(() => (
  <span className="badge badge-success rounded-md mb-1 text-base-100 text-xs">Beta</span>
));