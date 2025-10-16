import Protected from "./protected";

const SmartLink = ({ href, children, isEmbedUser }) => {
  return (
    <a
      href={href?href+"?source=single":href}
      target={isEmbedUser ? "" : "_blank"} // inside iframe → same frame, normal → new tab
      rel={!isEmbedUser ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}   

export default Protected(SmartLink);

