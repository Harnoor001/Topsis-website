import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';
import nodemailer from 'nodemailer';

export const config = {
  api: { bodyParser: false },
};

/* ---------------- TOPSIS FUNCTION ---------------- */
function topsis(data, weights, impacts) {
  const n = data.length;
  const m = data[0].length;

  // Normalize weights
  const sumW = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / sumW);

  // Normalize matrix
  const norm = Array(m).fill(0);
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) norm[j] += data[i][j] ** 2;
    norm[j] = Math.sqrt(norm[j]);
  }

  const normalized = data.map(row =>
    row.map((v, j) => v / norm[j])
  );

  const weighted = normalized.map(row =>
    row.map((v, j) => v * weights[j])
  );

  const best = [], worst = [];
  for (let j = 0; j < m; j++) {
    const col = weighted.map(r => r[j]);
    if (impacts[j] === '+') {
      best[j] = Math.max(...col);
      worst[j] = Math.min(...col);
    } else {
      best[j] = Math.min(...col);
      worst[j] = Math.max(...col);
    }
  }

  const scores = weighted.map(row => {
    let dBest = 0, dWorst = 0;
    for (let j = 0; j < m; j++) {
      dBest += (row[j] - best[j]) ** 2;
      dWorst += (row[j] - worst[j]) ** 2;
    }
    dBest = Math.sqrt(dBest);
    dWorst = Math.sqrt(dWorst);
    return dWorst / (dBest + dWorst);
  });

  const ranks = [...scores]
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)
    .map((x, idx) => ({ ...x, rank: idx + 1 }))
    .sort((a, b) => a.i - b.i)
    .map(x => x.rank);

  return { scores, ranks };
}

/* ---------------- API HANDLER ---------------- */
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ keepExtensions: true });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => {
        if (err) reject(err);
        resolve([flds, fls]);
      });
    });

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile?.filepath)
      return res.status(400).json({ error: 'File missing' });

    const weights = fields.weights[0].split(',').map(Number);
    const impacts = fields.impacts[0].split(',');
    const email = fields.email[0];

    const data = [];
    const alternatives = [];
    let headers = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(uploadedFile.filepath)
        .pipe(csv())
        .on('headers', h => headers = h)
        .on('data', row => {
          alternatives.push(row[headers[0]]);
          data.push(headers.slice(1).map(h => parseFloat(row[h])));
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const { scores, ranks } = topsis(data, weights, impacts);

    // -------- CREATE RESULT CSV --------
    let resultCSV = headers.join(',') + ',Topsis Score,Rank\n';
    data.forEach((row, i) => {
      resultCSV += `${alternatives[i]},${row.join(',')},${scores[i].toFixed(4)},${ranks[i]}\n`;
    });

    // -------- SEND EMAIL --------
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TOPSIS Result',
      text: 'Attached is your TOPSIS result file.',
      attachments: [{
        filename: 'topsis-result.csv',
        content: resultCSV,
      }],
    });

    fs.unlinkSync(uploadedFile.filepath);

    return res.status(200).json({
      message: 'TOPSIS result sent to email successfully',
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
