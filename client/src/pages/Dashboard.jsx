import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Reports from "./Reports";

const SLOTS = [
  { value: "MORNING", label: "Morning (Fasting)" },
  { value: "AFTER_BREAKFAST", label: "After breakfast" },
  { value: "AFTER_LUNCH", label: "After lunch" },
  { value: "AFTER_DINNER", label: "After dinner" },
];

const today = () => new Date().toLocaleDateString("en-CA");

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    value: "",
    date: today(),
    slot: "MORNING",
  });

  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/readings");
      setReadings(response.data.readings || response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load readings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ value: "", date: today(), slot: "MORNING" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const value = Number(form.value);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setError("Enter a whole-number reading between 40 and 600 mg/dL.");
      return;
    }

    try {
      const payload = {
        value,
        date: form.date,
        slot: form.slot,
      };

      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
      } else {
        await api.post("/readings", payload);
      }

      resetForm();
      await fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save reading.");
    }
  };

  const handleEdit = (reading) => {
    setEditingId(reading.id);
    setForm({
      value: String(reading.value),
      date: String(reading.date).slice(0, 10),
      slot: reading.slot,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;

    try {
      await api.delete(`/readings/${id}`);
      await fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete reading.");
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SWEETY HEALTH TRACKER</p>
          <h1>Glucose Dashboard</h1>
          <p>Welcome, {user?.name || "User"}</p>
        </div>
        <button className="secondary-button" onClick={logout}>Logout</button>
      </header>

      {error && <div className="form-error">{error}</div>}

      <section className="dashboard-card">
        <h2>{editingId ? "Edit glucose reading" : "Add glucose reading"}</h2>
        <p>Record your blood glucose level in mg/dL.</p>

        <form className="reading-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reading-value">Glucose value (mg/dL)</label>
            <input
              id="reading-value"
              type="number"
              min="40"
              max="600"
              step="1"
              value={form.value}
              onChange={(event) => setForm({ ...form, value: event.target.value })}
              placeholder="e.g. 110"
              required
            />
          </div>

          <div>
            <label htmlFor="reading-date">Date</label>
            <input
              id="reading-date"
              type="date"
              value={form.date}
              max={today()}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="reading-slot">Reading slot</label>
            <select
              id="reading-slot"
              value={form.slot}
              onChange={(event) => setForm({ ...form, slot: event.target.value })}
            >
              {SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              {editingId ? "Update reading" : "Save reading"}
            </button>
            {editingId && (
              <button className="secondary-button" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="section-heading">
          <div>
            <h2>Reading history</h2>
            <p>Your recorded glucose readings.</p>
          </div>
          <span className="reading-count">{readings.length} readings</span>
        </div>

        {loading ? (
          <p>Loading readings...</p>
        ) : readings.length === 0 ? (
          <p className="empty-state">No readings yet. Add your first reading above.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reading slot</th>
                  <th>Value (mg/dL)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td>{String(reading.date).slice(0, 10)}</td>
                    <td>{SLOTS.find((slot) => slot.value === reading.slot)?.label || reading.slot}</td>
                    <td><strong>{reading.value}</strong></td>
                    <td>
                      <button
                        className="secondary-button"
                        onClick={() => handleEdit(reading)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(reading.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
          <Reports />
    </main>
  );
}


