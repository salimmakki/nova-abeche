from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Analyse

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique(request):
    analyses = Analyse.objects.filter(user=request.user)[:20]
    return Response([{'id':a.id,'type':a.type_analyse,'resultat':a.resultat[:100],'date':a.created_at} for a in analyses])
