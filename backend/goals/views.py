from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Goal, GoalParticipant
from .serializers import GoalSerializer, GoalParticipantSerializer

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        # Owned goals
        owned = Goal.objects.filter(user=self.request.user)
        # Shared with the user
        shared_ids = GoalParticipant.objects.filter(user=self.request.user).values_list("goal_id", flat=True)
        return Goal.objects.filter(id__in=list(owned.values_list("id", flat=True)) + list(shared_ids)).order_by("-created_at")
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get", "post", "delete"], url_path="participants")
    def participants(self, request, pk=None):
        goal = self.get_object()
        if request.method == "GET":
            qs = goal.participants.all().order_by("-added_at")
            ser = GoalParticipantSerializer(qs, many=True)
            return Response(ser.data)
        if request.method == "POST":
            user_id = request.data.get("user")
            role = request.data.get("role", "VIEWER")
            if not user_id:
                return Response({"detail": "user is required"}, status=status.HTTP_400_BAD_REQUEST)
            obj, _ = GoalParticipant.objects.update_or_create(goal=goal, user_id=user_id, defaults={"role": role})
            return Response(GoalParticipantSerializer(obj).data, status=status.HTTP_201_CREATED)
        if request.method == "DELETE":
            user_id = request.data.get("user")
            if not user_id:
                return Response({"detail": "user is required"}, status=status.HTTP_400_BAD_REQUEST)
            GoalParticipant.objects.filter(goal=goal, user_id=user_id).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
