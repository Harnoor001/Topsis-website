import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [weights, setWeights] = useState('');
  const [impacts, setImpacts] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('weights', weights);
    formData.append('impacts', impacts);
    formData.append('email', email);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage('Submission failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Develop a Web Service for TOPSIS</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>CSV File</label><br />
        <input
          type="file"
          name="file"
          accept=".csv"
          required
          onChange={(e) => setFile(e.target.files[0])}
        /><br /><br />

        <label>Weights</label><br />
        <input
          type="text"
          placeholder="1,1,1"
          value={weights}
          required
          onChange={(e) => setWeights(e.target.value)}
        /><br /><br />

        <label>Impacts</label><br />
        <input
          type="text"
          placeholder="+,-,+"
          value={impacts}
          required
          onChange={(e) => setImpacts(e.target.value)}
        /><br /><br />

        <label>Email</label><br />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}