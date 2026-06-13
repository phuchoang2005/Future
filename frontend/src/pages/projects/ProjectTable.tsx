import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../shared/components/Badges";
import { formatDate } from "../../shared/format/formatters";
import { panelVariants } from "../../shared/motion/variants";
import type { ProjectDetail } from "../../shared/api/types";

export function ProjectTable({ projects }: { projects: ProjectDetail[] }) {
  return (
    <div className="data-table project-table">
      <div className="table-head">
        <span>Project</span><span>Status</span><span>Source</span><span>Last training</span><span>Owner</span><span>Action</span>
      </div>
      {projects.map((project) => (
        <motion.div key={project.projectId} className="table-row" variants={panelVariants} initial="initial" animate="enter">
          <div><strong>{project.projectName}</strong><small>{project.description}</small></div>
          <StatusBadge status={project.latestJobStatus} />
          <span>{project.sourceType}</span>
          <span>{formatDate(project.lastTrainingTime)}</span>
          <span>{project.lastTrainingOwner ?? "Not trained"}</span>
          <Link className="button secondary" to={`/projects/${project.projectId}`}>Open</Link>
        </motion.div>
      ))}
    </div>
  );
}
