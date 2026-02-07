import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [weights, setWeights] = useState('');
  const [impacts, setImpacts] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

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
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Submission failed');
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Submitted successfully');
    } catch {
      setStatus('error');
      setMessage('Submission failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdrop} />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.badge}>TOPSIS Service</p>
          <h1>Rank alternatives with a decisive, auditable score.</h1>
          <p className={styles.subtext}>
            Upload your CSV, set weights and impacts, and receive a ranked
            result file directly by email. Built for clarity, not guesswork.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => document.getElementById('topsis-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start a run
            </button>
            <div className={styles.heroMeta}>
              <span>CSV in, rankings out</span>
              <span>~1 minute turnaround</span>
            </div>
          </div>
        </div>
        <div className={styles.heroCard}>
          <h2>What you submit</h2>
          <ul>
            <li>CSV with alternatives in the first column.</li>
            <li>Numeric criteria in each following column.</li>
            <li>Weights like <strong>1,2,1,3</strong>.</li>
            <li>Impacts like <strong>+,+,-,+</strong>.</li>
          </ul>
          <div className={styles.callout}>
            Keep weights and impacts aligned with the number of criteria.
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.panel} id="topsis-form">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Submit a run</p>
              <h2>Send your TOPSIS job</h2>
              <p className={styles.helper}>
                We email the results CSV as soon as the ranking is complete.
              </p>
            </div>
            <div className={styles.steps}>
              <div>
                <span>1</span>
                <p>Upload CSV</p>
              </div>
              <div>
                <span>2</span>
                <p>Set weights</p>
              </div>
              <div>
                <span>3</span>
                <p>Get ranking</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
            <label className={styles.field}>
              <span>CSV dataset</span>
              <input
                type="file"
                name="file"
                accept=".csv"
                required
                onChange={(e) => setFile(e.target.files[0])}
              />
              <small>First column = alternative names, remaining columns = criteria.</small>
            </label>

            <label className={styles.field}>
              <span>Weights</span>
              <input
                type="text"
                placeholder="1,1,1"
                value={weights}
                required
                onChange={(e) => setWeights(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Impacts</span>
              <input
                type="text"
                placeholder="+,-,+"
                value={impacts}
                required
                onChange={(e) => setImpacts(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Email for results</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>

            <button className={styles.primaryBtn} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Submit run'}
            </button>
          </form>

          <p className={`${styles.message} ${status === 'error' ? styles.error : ''} ${status === 'success' ? styles.success : ''}`}>
            {message}
          </p>
        </section>

        <section className={styles.panel}>
          <h3>How we score</h3>
          <p className={styles.helper}>
            TOPSIS compares every alternative to the best and worst possible
            outcomes, then ranks by relative closeness. The output includes each
            score and final rank.
          </p>
          <div className={styles.grid}>
            <div className={styles.tile}>
              <h4>Normalized criteria</h4>
              <p>Each criterion is scaled to neutralize unit bias.</p>
            </div>
            <div className={styles.tile}>
              <h4>Weighted priorities</h4>
              <p>Weights shift the ranking toward what matters most.</p>
            </div>
            <div className={styles.tile}>
              <h4>Clear ranking</h4>
              <p>Scores are converted to an ordered list automatically.</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Example format</h3>
          <div className={styles.codeBlock}>
            <pre>
{`Model,Price,Battery,Weight
A1,540,9,1.3
A2,620,7,1.1
A3,580,8,1.5`}
            </pre>
            <div>
              <p><strong>Weights:</strong> 3,2,1</p>
              <p><strong>Impacts:</strong> -,+,-</p>
            </div>
          </div>
          <p className={styles.helper}>
            Need to run multiple scenarios? Change only the weights/impacts and resubmit.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <h4>TOPSIS Service</h4>
          <p className={styles.helper}>Decision support made deliverable.</p>
        </div>
        <div className={styles.footerMeta}>
          <span>Secure uploads</span>
          <span>CSV results by email</span>
        </div>
      </footer>
    </div>
  );
}
