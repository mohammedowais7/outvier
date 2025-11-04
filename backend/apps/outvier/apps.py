from django.apps import AppConfig


class OutvierConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.outvier'
    verbose_name = 'Outvier'
    
    def ready(self):
        import apps.outvier.signals