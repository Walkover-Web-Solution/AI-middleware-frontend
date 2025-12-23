export function ToolFullSlider({ tool, onClose }) {
  return (
    <div
      className={`
        fixed top-0 right-0
        h-screen w-[50vw]
        bg-white z-[999999]
        transform transition-transform duration-300
        ${tool ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <button onClick={onClose}>Close</button>
      {tool && <div>{tool}</div>}
    </div>
  );
}
