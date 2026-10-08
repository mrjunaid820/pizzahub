from django.contrib import admin
from .models import (
    Category,
    Product,
    ProductSizePrice,
    Coupon,
    Order,
    OrderItem,
    OrderStatusHistory,
    CustomerReview,
    BusinessSetting
)

class ProductSizePriceInline(admin.TabularInline):
    model = ProductSizePrice
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('display_order', 'is_active')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'starting_price', 'is_available', 'is_bestseller', 'is_featured')
    list_filter = ('category', 'is_available', 'is_bestseller', 'is_featured')
    search_fields = ('name', 'ingredients', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductSizePriceInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('item_name', 'size_name', 'unit_price', 'quantity', 'subtotal')

class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('previous_status', 'new_status', 'timestamp', 'changed_by', 'notes')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer_name', 'customer_phone', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'payment_method')
    search_fields = ('order_id', 'customer_name', 'customer_phone', 'delivery_address')
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    readonly_fields = ('order_id', 'created_at', 'updated_at')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'min_order_amount', 'expiry_date', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('code', 'description')

@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'rating', 'is_approved', 'created_at')
    list_editable = ('is_approved',)
    list_filter = ('rating', 'is_approved')
    search_fields = ('customer_name', 'comment')

@admin.register(BusinessSetting)
class BusinessSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'updated_at')
    search_fields = ('key', 'value')
