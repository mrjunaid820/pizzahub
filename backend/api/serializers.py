from rest_framework import serializers
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

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'display_order', 'is_active', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True).count()


class ProductSizePriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSizePrice
        fields = ['id', 'size_name', 'price', 'is_available']


class ProductSerializer(serializers.ModelSerializer):
    prices = ProductSizePriceSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'ingredients',
            'allergens',
            'category',
            'category_name',
            'starting_price',
            'image_url',
            'image',
            'is_available',
            'is_bestseller',
            'is_popular',
            'is_featured',
            'badge',
            'rating',
            'prices',
            'created_at',
            'updated_at'
        ]


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'min_order_amount',
            'max_discount',
            'expiry_date',
            'is_active',
            'created_at'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'item_name',
            'size_name',
            'unit_price',
            'quantity',
            'subtotal'
        ]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id',
            'previous_status',
            'new_status',
            'timestamp',
            'changed_by',
            'notes'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_id',
            'customer_name',
            'customer_phone',
            'customer_whatsapp',
            'customer_email',
            'delivery_address',
            'city',
            'landmark',
            'delivery_instructions',
            'order_notes',
            'payment_method',
            'subtotal',
            'delivery_fee',
            'discount_amount',
            'coupon_code',
            'total_amount',
            'status',
            'idempotency_key',
            'items',
            'status_history',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'order_id',
            'subtotal',
            'delivery_fee',
            'discount_amount',
            'total_amount',
            'status',
            'created_at',
            'updated_at'
        ]


class CustomerReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerReview
        fields = [
            'id',
            'customer_name',
            'rating',
            'comment',
            'customer_avatar',
            'is_approved',
            'created_at'
        ]


class BusinessSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSetting
        fields = ['key', 'value', 'updated_at']
