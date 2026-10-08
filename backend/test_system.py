import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pizzahub_backend.settings')
django.setup()

from django.test import Client
from django.conf import settings
from api.models import Product, Category, Coupon, Order, OrderItem, BusinessSetting
from django.contrib.auth.models import User

client = Client()

print("=" * 60)
print("PIZZA HUB END-TO-END VERIFICATION TEST")
print("=" * 60)

# 1. Test Static React App serving
res_home = client.get('/')
assert res_home.status_code == 200, f"Expected 200, got {res_home.status_code}"
assert b'<div id="root"></div>' in res_home.content, "React root div not found in home page response"
print("[PASS] 1. Root HTML serves React index.html")

# 1b. Test React Asset bundle serving
assets_dir = os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist', 'assets')
js_files = [f for f in os.listdir(assets_dir) if f.endswith('.js')]
css_files = [f for f in os.listdir(assets_dir) if f.endswith('.css')]

if js_files:
    res_js = client.get(f'/assets/{js_files[0]}')
    assert res_js.status_code == 200, f"Expected 200, got {res_js.status_code}"
    assert 'javascript' in res_js.headers['Content-Type'], f"Expected JS content-type, got {res_js.headers['Content-Type']}"
    print(f"[PASS] 1b. JS Asset served correctly ({len(res_js.content)} bytes, {res_js.headers['Content-Type']})")

if css_files:
    res_css = client.get(f'/assets/{css_files[0]}')
    assert res_css.status_code == 200, f"Expected 200, got {res_css.status_code}"
    assert 'text/css' in res_css.headers['Content-Type'], f"Expected CSS content-type, got {res_css.headers['Content-Type']}"
    print(f"[PASS] 1c. CSS Asset served correctly ({len(res_css.content)} bytes, {res_css.headers['Content-Type']})")

# 2. Test Category API
res_cat = client.get('/api/categories/')
assert res_cat.status_code == 200, f"Expected 200, got {res_cat.status_code}"
cats = res_cat.json()
print(f"[PASS] 2. Category API returned {len(cats)} categories ({[c['name'] for c in cats]})")

# 3. Test Product API
res_prod = client.get('/api/products/')
assert res_prod.status_code == 200
products = res_prod.json()
assert len(products) > 0, "No products found"
first_prod = products[0]
print(f"[PASS] 3. Product API returned {len(products)} products. First: '{first_prod['name']}' with {len(first_prod['prices'])} size tiers.")

# 4. Test Product Details by slug
slug = first_prod['slug']
res_detail = client.get(f'/api/products/by-slug/{slug}/')
assert res_detail.status_code == 200
p_detail = res_detail.json()
assert p_detail['name'] == first_prod['name']
print(f"[PASS] 4. Product slug lookup '/api/products/by-slug/{slug}/' returned '{p_detail['name']}'")

# 5. Test Active Coupons API
res_coup = client.get('/api/coupons/active/')
assert res_coup.status_code == 200
coupons = res_coup.json()
print(f"[PASS] 5. Active Coupons API returned {len(coupons)} coupons: {[c['code'] for c in coupons]}")

# 6. Test Store Settings API
res_settings = client.get('/api/settings/')
assert res_settings.status_code == 200
setting_data = res_settings.json()
assert setting_data['success'] is True
print(f"[PASS] 6. Settings API returned restaurant: '{setting_data['settings']['restaurant_name']}', delivery fee: Rs. {setting_data['settings']['delivery_fee']}")

# 7. Test Admin Auth
res_auth = client.post('/api/admin/auth/login/', data={'username': 'admin', 'password': 'admin123'}, content_type='application/json')
assert res_auth.status_code == 200
auth_json = res_auth.json()
assert auth_json['success'] is True
print(f"[PASS] 7. Admin auth successful for user '{auth_json['user']['username']}'")

# 8. Test Coupon Validation endpoint
res_validate_coup = client.post('/api/coupons/validate/', data={'code': 'PIZZAFIRST', 'subtotal': 1800}, content_type='application/json')
assert res_validate_coup.status_code == 200
coup_val = res_validate_coup.json()
assert coup_val['success'] is True
assert 'discount_amount' in coup_val['coupon']
print(f"[PASS] 8. Coupon 'PIZZAFIRST' validated: discount Rs. {coup_val['coupon']['discount_amount']}")

# 9. Test Order Placement with Backend Price Verification
size_entry = first_prod['prices'][0]
order_payload = {
    'customer_name': 'Ali Khan Test',
    'customer_phone': '03001234567',
    'customer_whatsapp': '03001234567',
    'customer_email': 'ali@example.com',
    'delivery_address': 'Flat 4B, Clifton Block 5',
    'city': 'Karachi',
    'landmark': 'Near Sea View',
    'order_notes': 'Please deliver piping hot with chili flakes',
    'payment_method': 'Cash on Delivery',
    'coupon_code': 'PIZZAFIRST',
    'items': [
        {
            'product_id': first_prod['id'],
            'size_name': size_entry['size_name'],
            'quantity': 2,
            # Note: Even if client provides bogus price, backend looks up real price
            'unit_price': 1
        }
    ]
}

res_order = client.post('/api/orders/', data=order_payload, content_type='application/json')
assert res_order.status_code == 201, f"Expected 201, got {res_order.status_code}: {res_order.content}"
order_result = res_order.json()
assert order_result['success'] is True
created_order_id = order_result['order']['order_id']
print(f"[PASS] 9. Order placed successfully with Order ID: {created_order_id}, Total: Rs. {order_result['order']['total_amount']}")

# 10. Test Order Tracking endpoint
res_track = client.get(f'/api/orders/track/?order_id={created_order_id}')
assert res_track.status_code == 200
track_json = res_track.json()
assert track_json['success'] is True
assert track_json['order']['status'] == 'received'
assert track_json['current_stage_index'] == 0
print(f"[PASS] 10. Order Tracking verified: Status '{track_json['order']['status']}', Stage: {track_json['current_stage_index']}/4 ('{track_json['stages'][0]['title']}')")

# 11. Test Admin Order Status Update (e.g. to 'preparing')
order_obj_id = order_result['order']['id']
client.login(username='admin', password='admin123')
res_update_status = client.patch(f'/api/orders/{order_obj_id}/status/', data={'status': 'preparing', 'notes': 'Fresh crust in oven'}, content_type='application/json')
assert res_update_status.status_code == 200, f"Expected 200, got {res_update_status.status_code}: {res_update_status.content}"
res_track2 = client.get(f'/api/orders/track/?order_id={created_order_id}')
track_json2 = res_track2.json()
assert track_json2['order']['status'] == 'preparing'
assert track_json2['current_stage_index'] == 2
print(f"[PASS] 11. Admin updated order status to 'preparing', tracking timeline updated to stage 2/4 ('{track_json2['stages'][2]['title']}')")

print("=" * 60)
print("ALL BACKEND, INTEGRATION & SPA ASSET TESTS PASSED PERFECTLY!")
print("=" * 60)
