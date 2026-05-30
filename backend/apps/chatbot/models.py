from django.db import models
from django.contrib.auth.models import User

class Conversation(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    titre      = models.CharField(max_length=200, default='Nouvelle conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class Message(models.Model):
    ROLES = [('user','Utilisateur'),('assistant','Assistant')]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role         = models.CharField(max_length=10, choices=ROLES)
    contenu      = models.TextField()
    image        = models.ImageField(upload_to='chat_images/', null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
