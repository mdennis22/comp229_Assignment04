import { useEffect, useState } from "react";
import "../style/Global.css";

const emptyForm = { firstName: "", email: "", message: "" };

const isAdminToken = (token) => {
  if (!token) return false;

  try {
    return JSON.parse(atob(token.split(".")[1])).role === "admin";
  } catch {
    return false;
  }
};

const Contact = () => {
  const [form, setForm] = useState(emptyForm);
  const [contacts, setContacts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const isAdmin = isAdminToken(token);

  useEffect(() => {
    if (!isAdmin) return;

    const loadContacts = async () => {
      const response = await fetch("/api/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load contacts");
      setContacts(data);
    };

    loadContacts().catch((loadError) => setError(loadError.message));
  }, [isAdmin, token]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    const response = await fetch(editingId ? `/api/contacts/${editingId}` : "/api/contacts", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to save contact");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setStatus(editingId ? "Contact updated." : "Message sent.");
    if (isAdmin) setContacts((current) => (editingId ? current.map((contact) => (contact._id === data._id ? data : contact)) : [data, ...current]));
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id);
    setForm({ firstName: contact.firstName, email: contact.email, message: contact.message });
    setStatus("");
    setError("");
  };

  const handleDelete = async (id) => {
    setError("");
    const response = await fetch(`/api/contacts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete contact");
      return;
    }

    setContacts((current) => current.filter((contact) => contact._id !== id));
  };

  return (
    <div className="contact-container">
      <h2 className="greeting">Contact Me</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">Name:</label>
          <br />
          <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <br />
        <div>
          <label htmlFor="email">Email:</label>
          <br />
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <br />
        <div>
          <label htmlFor="message">Message:</label>
          <br />
          <textarea id="message" name="message" rows="5" value={form.message} onChange={handleChange} required />
        </div>
        <br />
        {error && <p role="alert">{error}</p>}
        {status && <p>{status}</p>}
        <button type="submit">{editingId ? "Update" : "Send"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}>
            Cancel
          </button>
        )}
      </form>

      {isAdmin && (
        <section>
          <hr></hr>
          <h2>Contact submissions</h2>
          {contacts.map((contact) => (
            <article key={contact._id}>
              <h3>{contact.firstName}</h3>
              <p>{contact.email}</p>
              <p>{contact.message}</p>
              <button type="button" onClick={() => handleEdit(contact)}>
                Edit
              </button>{" "}
              <button type="button" onClick={() => handleDelete(contact._id)}>
                Delete
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Contact;
