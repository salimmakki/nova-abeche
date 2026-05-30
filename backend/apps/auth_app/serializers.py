from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profil

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    telephone = serializers.CharField(required=False, default='')
    langue    = serializers.ChoiceField(choices=[('fr','Français'),('ar','Arabe')], default='fr')

    class Meta:
        model  = User
        fields = ['username','email','password','first_name','last_name','telephone','langue']

    def create(self, validated_data):
        telephone = validated_data.pop('telephone', '')
        langue    = validated_data.pop('langue', 'fr')
        user = User.objects.create_user(**validated_data)
        Profil.objects.create(user=user, telephone=telephone, langue=langue)
        return user

class UserSerializer(serializers.ModelSerializer):
    langue    = serializers.CharField(source='profil.langue', read_only=True)
    telephone = serializers.CharField(source='profil.telephone', read_only=True)
    region    = serializers.CharField(source='profil.region', read_only=True)

    class Meta:
        model  = User
        fields = ['id','username','email','first_name','last_name','langue','telephone','region']
