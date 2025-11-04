from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View


def error_400(request, exception=None):
    """Bad Request - 400 Error"""
    context = {
        'error_code': '400',
        'error_title': 'Bad Request',
        'error_message': 'The request could not be processed due to invalid syntax or parameters.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=400)


def error_401(request, exception=None):
    """Unauthorized - 401 Error"""
    context = {
        'error_code': '401',
        'error_title': 'Unauthorized',
        'error_message': 'You need to be authenticated to access this resource. Please log in and try again.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=401)


def error_403(request, exception=None):
    """Forbidden - 403 Error"""
    context = {
        'error_code': '403',
        'error_title': 'Access Forbidden',
        'error_message': 'You do not have permission to access this resource. Please contact an administrator if you believe this is an error.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=403)


def error_404(request, exception=None):
    """Not Found - 404 Error"""
    context = {
        'error_code': '404',
        'error_title': 'Page Not Found',
        'error_message': 'The page you are looking for could not be found. It may have been moved, deleted, or you entered the wrong URL.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=404)


def error_500(request, exception=None):
    """Internal Server Error - 500 Error"""
    context = {
        'error_code': '500',
        'error_title': 'Internal Server Error',
        'error_message': 'Something went wrong on our end. Our team has been notified and is working to fix the issue.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=500)


def error_502(request, exception=None):
    """Bad Gateway - 502 Error"""
    context = {
        'error_code': '502',
        'error_title': 'Bad Gateway',
        'error_message': 'The server received an invalid response from an upstream server. Please try again later.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=502)


def error_503(request, exception=None):
    """Service Unavailable - 503 Error"""
    context = {
        'error_code': '503',
        'error_title': 'Service Unavailable',
        'error_message': 'The service is temporarily unavailable. We are performing maintenance or experiencing high traffic. Please try again later.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=503)


def error_504(request, exception=None):
    """Gateway Timeout - 504 Error"""
    context = {
        'error_code': '504',
        'error_title': 'Gateway Timeout',
        'error_message': 'The server did not receive a timely response from an upstream server. Please try again later.',
        'error_details': str(exception) if exception else None,
        'debug': request.settings.DEBUG if hasattr(request, 'settings') else False,
    }
    return render(request, 'error.html', context, status=504)


@method_decorator(csrf_exempt, name='dispatch')
class CustomErrorView(View):
    """Generic error view for custom error handling"""
    
    def get(self, request, error_code, *args, **kwargs):
        """Handle GET requests for custom error pages"""
        error_messages = {
            '400': ('Bad Request', 'The request could not be processed due to invalid syntax or parameters.'),
            '401': ('Unauthorized', 'You need to be authenticated to access this resource. Please log in and try again.'),
            '403': ('Access Forbidden', 'You do not have permission to access this resource.'),
            '404': ('Page Not Found', 'The page you are looking for could not be found.'),
            '500': ('Internal Server Error', 'Something went wrong on our end. Our team has been notified.'),
            '502': ('Bad Gateway', 'The server received an invalid response from an upstream server.'),
            '503': ('Service Unavailable', 'The service is temporarily unavailable. Please try again later.'),
            '504': ('Gateway Timeout', 'The server did not receive a timely response. Please try again later.'),
        }
        
        error_title, error_message = error_messages.get(error_code, ('Error', 'An unexpected error occurred.'))
        
        context = {
            'error_code': error_code,
            'error_title': error_title,
            'error_message': error_message,
            'error_details': kwargs.get('error_details'),
            'debug': getattr(request, 'settings', {}).get('DEBUG', False),
        }
        
        return render(request, 'error.html', context, status=int(error_code))

