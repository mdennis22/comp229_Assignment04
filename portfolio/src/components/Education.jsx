import { useEffect, useState } from "react";
import "../style/Education.css";

const emptyQualification = { title: "", description: "", startDate: "", endDate: "" };

const isAdminToken = (token) => {
  if (!token) return false;

  try {
    return JSON.parse(atob(token.split(".")[1])).role === "admin";
  } catch {
    return false;
  }
};

const Education = () => {
  const [qualifications, setQualifications] = useState([]);
  const [form, setForm] = useState(emptyQualification);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");
  const isAdmin = isAdminToken(token);

  useEffect(() => {
    const loadQualifications = async () => {
      const response = await fetch("/api/qualifications");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load qualifications");
      setQualifications(data);
    };

    loadQualifications().catch((loadError) => setError(loadError.message));
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    const response = await fetch(editingId ? `/api/qualifications/${editingId}` : "/api/qualifications", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to save qualification");
      return;
    }

    setQualifications((current) =>
      editingId ? current.map((qualification) => (qualification._id === data._id ? data : qualification)) : [data, ...current],
    );
    setForm(emptyQualification);
    setEditingId(null);
    setStatus(editingId ? "Qualification updated." : "Qualification created.");
  };

  const handleEdit = (qualification) => {
    setEditingId(qualification._id);
    setForm({
      title: qualification.title || "",
      description: qualification.description || "",
      startDate: qualification.startDate ? qualification.startDate.slice(0, 10) : "",
      endDate: qualification.endDate ? qualification.endDate.slice(0, 10) : "",
    });
    setError("");
    setStatus("");
  };

  const handleDelete = async (id) => {
    setError("");
    const response = await fetch(`/api/qualifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete qualification");
      return;
    }

    setQualifications((current) => current.filter((qualification) => qualification._id !== id));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyQualification);
    setError("");
    setStatus("");
  };

  return (
    <section className="education-container">
      <div className="education-card">
        <header className="education-header">
          <h2 className="greeting">Education</h2>
          <hr className="divider" />
        </header>

        {error && <p role="alert">{error}</p>}
        {status && <p>{status}</p>}

        {isAdmin && (
          <form onSubmit={handleSubmit}>
            <h3>{editingId ? "Edit qualification" : "Add qualification"}</h3>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required />
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} required />
            <label htmlFor="startDate">Start date</label>
            <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <label htmlFor="endDate">End date</label>
            <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
            <button type="submit">{editingId ? "Update" : "Create"}</button>{" "}
            {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </form>
        )}

        <div className="education-list">
          {qualifications.map((qualification) => (
            <div className="education-item" key={qualification._id}>
              <div className="education-top">
                <h3 className="degree">{qualification.title}</h3>
              </div>
              <p className="institution">{qualification.description}</p>
              {(qualification.startDate || qualification.endDate) && (
                <p className="description">
                  {qualification.startDate && new Date(qualification.startDate).toLocaleDateString()}
                  {qualification.startDate && qualification.endDate && " - "}
                  {qualification.endDate && new Date(qualification.endDate).toLocaleDateString()}
                </p>
              )}
              {isAdmin && (
                <>
                  <button type="button" onClick={() => handleEdit(qualification)}>Edit</button>{" "}
                  <button type="button" onClick={() => handleDelete(qualification._id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
