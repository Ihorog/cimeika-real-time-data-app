export type Relation = {
  target_id: string;
  relation_type: string;
  weight?: number;
};

export type Timeline = {
  was?: string;
  is?: string;
  will?: string;
};

export type Concept = {
  id: string;
  name: string;
  namespace?: string[];
  type?: string;
  polarity?: string;
  timeline?: Timeline;
  description_core?: string;
  description_story?: string;
  description_technical?: string;
  tags?: string[];
  relations?: Relation[];
};

export type GraphEdge = {
  from: string;
  to: string;
  type: string;
  weight?: number;
};

export type Graph = {
  nodes: string[];
  edges: GraphEdge[];
};

export type Bundle = {
  bundle_id: string;
  version: string;
  namespace?: string[];
  tags?: string[];
  concepts: Concept[];
  graph: Graph;
};