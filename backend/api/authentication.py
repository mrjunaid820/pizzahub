from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom DRF SessionAuthentication that disables CSRF enforcement
    for API calls made from SPA client frontends.
    """
    def enforce_csrf(self, request):
        return
