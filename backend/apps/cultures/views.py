from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

CULTURES = [
    {'nom':'Mil',      'nom_arabe':'دخن',          'saison':'hivernage','mois_debut':7, 'mois_fin':10,'temp_min':28,'temp_max':35,'pluie_min':40, 'pluie_max':120,'type_sol':'sableux',       'ph_min':5.5,'ph_max':7.0,'description':'Culture principale du Sahel, très résistante à la sécheresse.'},
    {'nom':'Sorgho',   'nom_arabe':'ذرة',           'saison':'hivernage','mois_debut':7, 'mois_fin':10,'temp_min':27,'temp_max':34,'pluie_min':50, 'pluie_max':130,'type_sol':'argileux',      'ph_min':5.8,'ph_max':7.5,'description':'Bonne culture pour les sols argileux, alimentation de base.'},
    {'nom':'Niébé',    'nom_arabe':'لوبيا',         'saison':'hivernage','mois_debut':8, 'mois_fin':11,'temp_min':26,'temp_max':33,'pluie_min':60, 'pluie_max':140,'type_sol':'sableux',       'ph_min':6.0,'ph_max':7.0,'description':'Légumineuse riche en protéines, fixe l\'azote dans le sol.'},
    {'nom':'Arachide', 'nom_arabe':'فول سوداني',    'saison':'hivernage','mois_debut':6, 'mois_fin':9, 'temp_min':25,'temp_max':32,'pluie_min':50, 'pluie_max':110,'type_sol':'sableux_leger','ph_min':5.5,'ph_max':7.0,'description':'Culture commerciale importante, sol sableux bien drainé.'},
    {'nom':'Sésame',   'nom_arabe':'سمسم',          'saison':'hivernage','mois_debut':7, 'mois_fin':10,'temp_min':27,'temp_max':34,'pluie_min':45, 'pluie_max':100,'type_sol':'sableux',       'ph_min':5.8,'ph_max':7.5,'description':'Culture d\'exportation, très résistante à la chaleur.'},
    {'nom':'Oignon',   'nom_arabe':'بصل',           'saison':'seche',    'mois_debut':11,'mois_fin':2, 'temp_min':18,'temp_max':28,'pluie_min':0,  'pluie_max':10, 'type_sol':'irrigue',       'ph_min':6.0,'ph_max':7.5,'description':'Culture irriguée en saison sèche, bonne valeur marchande.'},
    {'nom':'Tomate',   'nom_arabe':'طماطم',         'saison':'seche',    'mois_debut':10,'mois_fin':1, 'temp_min':20,'temp_max':30,'pluie_min':0,  'pluie_max':10, 'type_sol':'irrigue',       'ph_min':6.0,'ph_max':7.5,'description':'Culture maraîchère irriguée, forte demande locale.'},
]

def score_culture(c, mois, temp, pluie, sol, ph):
    score = 0
    d, f = c['mois_debut'], c['mois_fin']
    if (d <= f and d <= mois <= f) or (d > f and (mois >= d or mois <= f)):
        score += 30
    if c['temp_min'] <= temp <= c['temp_max']:
        score += 25
    if c['pluie_min'] <= pluie <= c['pluie_max']:
        score += 25
    if sol.lower() in c['type_sol'].lower() or c['type_sol'].lower() in sol.lower():
        score += 10
    if c['ph_min'] <= ph <= c['ph_max']:
        score += 10
    return score

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommander_cultures(request):
    mois  = int(request.data.get('mois', 7))
    temp  = float(request.data.get('temperature', 30))
    pluie = float(request.data.get('precipitation', 60))
    sol   = request.data.get('type_sol', 'sableux')
    ph    = float(request.data.get('ph', 6.5))

    resultats = []
    for c in CULTURES:
        s = score_culture(c, mois, temp, pluie, sol, ph)
        if s >= 50:
            resultats.append({**c, 'score': s})

    resultats.sort(key=lambda x: x['score'], reverse=True)
    return Response({'message': f'{len(resultats)} culture(s) recommandée(s)', 'cultures': resultats[:3]})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_cultures(request):
    return Response(CULTURES)
