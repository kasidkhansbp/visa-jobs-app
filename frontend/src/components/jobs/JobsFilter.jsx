/**
 * JobsFilter — filter bar for the jobs table.
 *
 * Completely independent — owns its own input state and
 * calls onFilter() when the user submits.
 *
 * @param {Function} onFilter - called with the filter object when user clicks Search
 */
import { useState } from "react";

export function JobsFilter({ onFilter }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onFilter({ title, location, source });
  }

  function handleReset() {
    setTitle("");
    setLocation("");
    setSource("");
    onFilter({});
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <select value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="">All sources</option>
        <option value="reed">Reed</option>
        <option value="adzuna">Adzuna</option>
      </select>
      <button type="submit">Search</button>
      <button type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}
