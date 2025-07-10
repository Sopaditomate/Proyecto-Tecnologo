import { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";

const ExpandableText = ({ text = "", maxLines = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && !expanded) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      const height = textRef.current.scrollHeight;
      const lines = Math.round(height / lineHeight);
      setShowExpand(lines > maxLines);
    }
  }, [text, maxLines, expanded]);

  if (!text) return "Sin descripción";

  return (
    <span
      className="description-text"
      style={{
        maxWidth: 500,
        width: "100%",
        textAlign: "left",
      }}
    >
      <span
        ref={textRef}
        style={
          expanded
            ? {
                display: "block",
                whiteSpace: "pre-line",
                overflow: "visible",
              }
            : {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                whiteSpace: "pre-line",
              }
        }
      >
        {text}
      </span>
      {showExpand && (
        <Button
          variant="link"
          size="xl"
          style={{
            padding: 0,
            color: "#8b4513",
            fontWeight: 500,
            textDecoration: "underline",
            verticalAlign: "baseline",
            fontSize: "12px",
          }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </Button>
      )}
    </span>
  );
};

export default ExpandableText;
