export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { message, model = 'gpt2' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message requis' });

  try {
    const HF_TOKEN = process.env.HF_TOKEN;
    console.log("HF_TOKEN présent :", !!HF_TOKEN);
    if (!HF_TOKEN) return res.status(500).json({ error: 'Clé Hugging Face manquante' });

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: message })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Erreur Hugging Face : ${response.status} - ${errText}` });
    }

    const data = await response.json();
    const reply = Array.isArray(data) ? data[0]?.generated_text : data.generated_text || 'Pas de réponse';
    res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erreur interne' });
  }
}
