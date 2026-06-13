import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link className="brand" to="/projects">
      <span className="brand-mark"><Sparkles size={20} fill="currentColor" /></span>
      <span>Future</span>
    </Link>
  );
}
