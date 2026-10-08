import os
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

FRONTEND_DIST = settings.BASE_DIR.parent / 'frontend' / 'dist'

def serve_react_app(request, path=''):
    """
    Serves the production built React SPA from frontend/dist.
    Handles static assets (JS, CSS, images) and falls back to index.html
    for client-side routing.
    """
    if path:
        target_file = FRONTEND_DIST / path
        if target_file.exists() and target_file.is_file():
            content_type = 'application/octet-stream'
            if path.endswith('.js') or path.endswith('.mjs'):
                content_type = 'application/javascript'
            elif path.endswith('.css'):
                content_type = 'text/css'
            elif path.endswith('.svg'):
                content_type = 'image/svg+xml'
            elif path.endswith('.png'):
                content_type = 'image/png'
            elif path.endswith('.jpg') or path.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif path.endswith('.ico'):
                content_type = 'image/x-icon'
            with open(target_file, 'rb') as f:
                resp = HttpResponse(f.read(), content_type=content_type)
                resp['Cache-Control'] = 'no-cache, must-revalidate'
                return resp

    index_file = FRONTEND_DIST / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            resp = HttpResponse(f.read(), content_type='text/html')
            resp['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            resp['Pragma'] = 'no-cache'
            resp['Expires'] = '0'
            return resp

    return HttpResponse(
        "<h1>Pizza Hub API Server</h1><p>API is running. Build frontend with 'npm run build' inside frontend/ to serve client UI directly.</p>",
        content_type='text/html'
    )

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?P<path>.*)$', serve_react_app),
]
