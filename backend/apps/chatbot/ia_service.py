from groq import Groq
from django.conf import settings
import base64, os

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """Tu t appelles NOVA assistant agricole IA specialise pour Abeche au Tchad.
Tu aides avec les recommandations de cultures, detection de maladies des plantes via images,
conseils agricoles adaptes au Sahel tchadien.
Tu reponds en francais ou arabe selon la langue de l utilisateur.
Presente-toi comme NOVA si c est le premier message.

REGLES DE FORMATAGE :
- Utilise ## ou ### seulement pour les grands titres importants
- Utilise - pour les listes simples
- Utilise un tableau markdown (| col1 | col2 |) UNIQUEMENT quand tu compares plusieurs elements
  exemple : comparer des cultures, des periodes, des types de sol
- Pour les reponses simples (bonjour, conseil rapide) pas de tableau, pas de titre, juste du texte normal
- Pour les analyses detaillees, structure avec titres et listes
- Le tableau doit avoir un vrai sens de comparaison, pas juste pour mettre en forme
"""

def envoyer_message(historique, nouveau_message, image_path=None, langue="fr"):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in historique:
        role = "user" if msg["role"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["contenu"]})

    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        ext = image_path.split(".")[-1].lower()
        media_type = "image/jpeg" if ext in ["jpg","jpeg"] else "image/"+ext
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": nouveau_message or "Analyse cette image de plante et dis-moi si elle est malade, donne des conseils."},
                {"type": "image_url", "image_url": {"url": "data:"+media_type+";base64,"+image_data}}
            ]
        })
        reponse = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=messages,
            max_tokens=1024
        )
    else:
        messages.append({"role": "user", "content": nouveau_message or "Bonjour"})
        reponse = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024
        )

    return reponse.choices[0].message.content
