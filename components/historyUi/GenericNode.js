import { Handle, Position } from "reactflow";

export default function GenericNode({ data }) {
  const { ui, source, target } = data;

  return (
    <div
      className={` bg-base-100 ${ui.containerClass}`}
      style={{ width: ui.width || 220 }}
    >
      {ui.render?.()}

      {target && <Handle type="target" position={Position.Left} />}
      {source && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
