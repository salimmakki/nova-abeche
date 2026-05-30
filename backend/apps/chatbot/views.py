from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Conversation, Message
from .ia_service import envoyer_message
import re

def generer_titre(message, image=None):
    """Génère un titre intelligent pour la conversation."""
    if image and not message:
        return "📷 Analyse d'image"
    if not message:
        return "Nouvelle discussion"
    # Nettoyer et tronquer le message pour le titre
    titre = re.sub(r'\s+', ' ', message.strip())
    titre = titre[:60] + ('...' if len(titre) > 60 else '')
    return titre

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def conversations(request):
    if request.method == 'GET':
        convs = Conversation.objects.filter(user=request.user)
        return Response([{
            'id':         c.id,
            'titre':      c.titre,
            'created_at': c.created_at,
            'updated_at': c.updated_at,
            'nb_messages': c.messages.count()
        } for c in convs])
    conv = Conversation.objects.create(
        user=request.user,
        titre=request.data.get('titre', 'Nouvelle discussion')
    )
    return Response({'id': conv.id, 'titre': conv.titre}, status=201)

@api_view(['GET','DELETE'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, conv_id):
    try:
        conv = Conversation.objects.get(id=conv_id, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Introuvable'}, status=404)
    if request.method == 'DELETE':
        conv.delete()
        return Response({'message': 'Supprimée'})
    msgs = [{
        'id':         m.id,
        'role':       m.role,
        'contenu':    m.contenu,
        'image':      m.image.url if m.image else None,
        'created_at': m.created_at
    } for m in conv.messages.all()]
    return Response({'id': conv.id, 'titre': conv.titre, 'messages': msgs})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def envoyer(request):
    conv_id = request.data.get('conversation_id')
    message = request.data.get('message', '')
    image   = request.FILES.get('image')
    langue  = request.data.get('langue', 'fr')

    # Récupérer ou créer la conversation
    if conv_id:
        try:
            conv = Conversation.objects.get(id=conv_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable'}, status=404)
    else:
        # Nouvelle conversation — titre généré automatiquement
        titre = generer_titre(message, image)
        conv = Conversation.objects.create(user=request.user, titre=titre)

    # Sauvegarder message utilisateur
    msg_user   = Message.objects.create(conversation=conv, role='user', contenu=message, image=image)

    # Récupérer tout l'historique de cette conversation (mémoire complète)
    historique = list(conv.messages.exclude(id=msg_user.id).values('role', 'contenu'))

    # Appel IA avec tout l'historique
    reponse_ia = envoyer_message(
        historique,
        message,
        msg_user.image.path if msg_user.image else None,
        langue
    )

    # Sauvegarder réponse NOVA
    msg_ia = Message.objects.create(conversation=conv, role='assistant', contenu=reponse_ia)

    return Response({
        'conversation_id': conv.id,
        'titre':           conv.titre,
        'reponse':         reponse_ia,
        'message_id':      msg_ia.id
    })
