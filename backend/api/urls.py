from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    CouponViewSet,
    OrderViewSet,
    CustomerReviewViewSet,
    TrackOrderView,
    BusinessSettingsView,
    AdminStatsView,
    AdminAuthView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', CustomerReviewViewSet, basename='review')

urlpatterns = [
    # Custom endpoints
    path('orders/track/', TrackOrderView.as_view(), name='track-order'),
    path('settings/', BusinessSettingsView.as_view(), name='business-settings'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/auth/login/', AdminAuthView.as_view(), name='admin-login'),
    path('admin/auth/me/', AdminAuthView.as_view(), name='admin-me'),
    path('admin/auth/logout/', AdminAuthView.as_view(), name='admin-logout'),
    
    # Router endpoints
    path('', include(router.urls)),
]
