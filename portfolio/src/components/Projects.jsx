import { useEffect, useState } from "react";
import "../style/Global.css";

const emptyProject = { name: "", description: "", imagePath: "", startDate: "", endDate: "" };

const isAdminToken = (token) => {
  if (!token) return false;

  try {
    return JSON.parse(atob(token.split(".")[1])).role === "admin";
  } catch {
    return false;
  }
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");
  const isAdmin = isAdminToken(token);

  useEffect(() => {
    const loadProjects = async () => {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load projects");
      setProjects(data);
    };

    loadProjects().catch((loadError) => setError(loadError.message));
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    const response = await fetch(editingId ? `/api/projects/${editingId}` : "/api/projects", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to save project");
      return;
    }

    setProjects((current) => (editingId ? current.map((project) => (project._id === data._id ? data : project)) : [data, ...current]));
    setForm(emptyProject);
    setStatus(editingId ? "Project updated." : "Project created.");
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name || "",
      description: project.description || "",
      imagePath: project.imagePath || "",
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
    });
    setStatus("");
    setError("");
  };

  const handleDelete = async (id) => {
    setError("");
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete project");
      return;
    }

    setProjects((current) => current.filter((project) => project._id !== id));
  };

  return (
    <div className="projects-container">
      <h2 className="greeting">Projects</h2>
      {error && <p role="alert">{error}</p>}
      {status && <p>{status}</p>}

      {isAdmin && (
        <form onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit project" : "Add project"}</h3>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} required />
          <label htmlFor="imagePath">Image path</label>
          <input
            id="imagePath"
            name="imagePath"
            type="text"
            value={form.imagePath}
            onChange={handleChange}
            placeholder="/src/assets/project.png"
          />
          <label htmlFor="startDate">Start date</label>
          <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
          <label htmlFor="endDate">End date</label>
          <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
          <button type="submit">{editingId ? "Update" : "Create"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyProject); }}>Cancel</button>}
        </form>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project._id}>
            <h3 className="project-title">{project.name}</h3>
            {project.imagePath && (
              <img src={project.imagePath} alt={project.name} className="project-image" />
            )}
            <p className="project-description">{project.description}</p>
            {project.startDate && <p>Started: {new Date(project.startDate).toLocaleDateString()}</p>}
            {project.endDate && <p>Completed: {new Date(project.endDate).toLocaleDateString()}</p>}
            {isAdmin && (
              <>
                <button type="button" onClick={() => handleEdit(project)}>Edit</button>{" "}
                <button type="button" onClick={() => handleDelete(project._id)}>Delete</button>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default Projects;
