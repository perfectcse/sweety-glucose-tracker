import { useEffect, useState } from "react";
import api from "../api/axios";

const today = () => new Date().toLocaleDateString("en-CA");

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(today());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        let endpoint = "/reports/daily";

        if (reportType === "current-month") {
          endpoint = "/reports/current-month";
        } else if (reportType === "previous-month") {
          endpoint = "/reports/previous-month";
        }

        const response = await api.get(endpoint, {
          params: reportType === "daily" ? { date: selectedDate } : {},
        });

        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load report.");
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType, selectedDate]);

  const summary = report?.summary || {};

  return (
    <section className="dashboard-card reports-card">
      <h2>Glucose Reports</h2>
      <p>Review your glucose readings and monthly summaries.</p>

      <div className="report-controls">
        {[
          ["daily", "Daily"],
          ["current-month", "This month"],
          ["previous-month", "Previous month"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={reportType === value ? "report-tab active" : "report-tab"}
            onClick={() => setReportType(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {reportType === "daily" && (
        <div className="report-date">
          <label htmlFor="report-date">Select date</label>
          <input
            id="report-date"
            type="date"
            max={today()}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
      )}

      {loading && <p>Loading report...</p>}
      {error && <div className="form-error">{error}</div>}

      {!loading && report && (
        <>
          <div className="report-period">
            {report.period && (
              <span>
                Period: {String(report.period.startDate).slice(0, 10)}
                {" - "}
                {String(report.period.endDate).slice(0, 10)}
              </span>
            )}
            {report.date && (
              <span>Date: {String(report.date).slice(0, 10)}</span>
            )}
          </div>

          <div className="report-stats">
            <div className="report-stat">
              <span>Highest</span>
              <strong>{summary.highest ?? "-"}</strong>
              <small>mg/dL</small>
            </div>
            <div className="report-stat">
              <span>Lowest</span>
              <strong>{summary.lowest ?? "-"}</strong>
              <small>mg/dL</small>
            </div>
            <div className="report-stat">
              <span>Average</span>
              <strong>{summary.average ?? "-"}</strong>
              <small>mg/dL</small>
            </div>
            <div className="report-stat">
              <span>Total readings</span>
              <strong>{summary.count ?? 0}</strong>
              <small>readings</small>
            </div>
          </div>

          {reportType === "daily" && (
            <div className="table-wrapper report-table">
              <h3>Daily readings</h3>
              {report.readings?.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>Reading slot</th>
                      <th>Value (mg/dL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.readings.map((reading) => (
                      <tr key={reading.id}>
                        <td>{reading.slot.replaceAll("_", " ")}</td>
                        <td><strong>{reading.value}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">No readings found for this date.</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
