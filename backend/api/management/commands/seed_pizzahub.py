import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import (
    Category,
    Product,
    ProductSizePrice,
    Coupon,
    CustomerReview,
    BusinessSetting
)

class Command(BaseCommand):
    help = 'Seeds initial database data for Pizza Hub platform'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Pizza Hub database...")

        # 1. Admin Superuser
        admin_user, created = User.objects.get_or_create(username='admin')
        admin_user.set_password('admin123')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email = 'admin@pizzahub.com'
        admin_user.save()
        self.stdout.write(self.style.SUCCESS("Created/Updated admin user (admin / admin123)"))

        # 2. Business Settings
        settings_data = [
            ('restaurant_name', 'Pizza Hub'),
            ('tagline', 'Fresh Pizza, Fresh Moments.'),
            ('phone_number', '+92 300 1234567'),
            ('whatsapp_number', '923001234567'),
            ('email', 'orders@pizzahub.com'),
            ('address', 'Shop #14, Commercial Boulevard, Phase 5, DHA, Karachi'),
            ('currency', 'Rs.'),
            ('delivery_fee', '150.00'),
            ('free_delivery_threshold', '2500.00'),
            ('is_24_hours_open', '1'),
            ('business_hours', 'Open 24/7 (All Day & Night Delivery)'),
            ('announcement_banner', '🔥 24/7 Delivery Available! Free Delivery on orders above Rs. 2500 with code PIZZAFIRST!'),
            ('estimated_delivery_time', '30-40 mins')
        ]
        for key, val in settings_data:
            BusinessSetting.objects.update_or_create(key=key, defaults={'value': val})

        # 3. Categories
        categories_data = [
            ('Pizzas', 1),
            ('Burgers', 2),
            ('Sides & Appetizers', 3),
            ('Drinks', 4),
            ('Desserts', 5),
            ('Deals', 6),
        ]
        cat_map = {}
        for name, order in categories_data:
            cat, _ = Category.objects.update_or_create(name=name, defaults={'display_order': order, 'is_active': True})
            cat_map[name] = cat

        # 4. Products & Size-Based Prices
        products_data = [
            {
                'name': 'Pepperoni Feast Pizza',
                'category': cat_map['Pizzas'],
                'description': 'Loaded with double layers of gourmet beef pepperoni, molten mozzarella cheese and our signature rich herb marinara sauce.',
                'ingredients': 'Beef Pepperoni, Mozzarella, Herb Marinara Sauce, Oregano, Virgin Olive Oil',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('699.00'),
                'image_url': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': True,
                'badge': 'Best Seller',
                'prices': {
                    'Small': Decimal('699.00'),
                    'Medium': Decimal('1199.00'),
                    'Large': Decimal('1799.00'),
                    'Extra Large': Decimal('2299.00')
                }
            },
            {
                'name': 'Chicken Tikka Royale',
                'category': cat_map['Pizzas'],
                'description': 'Tender tandoori chicken tikka chunks with crunchy onions, crisp green bell peppers, spicy jalapeños and creamy mozzarella.',
                'ingredients': 'Tikka Spiced Chicken, Red Onions, Green Bell Peppers, Jalapeños, Mozzarella, Garlic Butter',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('649.00'),
                'image_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': True,
                'badge': 'Chef Special',
                'prices': {
                    'Small': Decimal('649.00'),
                    'Medium': Decimal('1149.00'),
                    'Large': Decimal('1699.00'),
                    'Extra Large': Decimal('2199.00')
                }
            },
            {
                'name': 'Four Cheese Volcano',
                'category': cat_map['Pizzas'],
                'description': 'An ultimate cheese celebration featuring mozzarella, sharp aged cheddar, creamy gorgonzola and grated parmesan over garlic herb crust.',
                'ingredients': 'Mozzarella, Aged Cheddar, Gorgonzola, Parmesan, Garlic Herb Butter, Tomato Sauce',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('749.00'),
                'image_url': 'https://images.unsplash.com/photo-1573821663912-569905455b1a?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': False,
                'is_popular': True,
                'is_featured': True,
                'badge': 'Super Cheesy',
                'prices': {
                    'Small': Decimal('749.00'),
                    'Medium': Decimal('1299.00'),
                    'Large': Decimal('1899.00'),
                    'Extra Large': Decimal('2499.00')
                }
            },
            {
                'name': 'BBQ Smoked Supreme',
                'category': cat_map['Pizzas'],
                'description': 'Slow-smoked hickory BBQ glazed chicken, smoked beef rashers, sweet caramelized red onions and rich melted mozzarella.',
                'ingredients': 'Smoked BBQ Chicken, Beef Rashers, Caramelized Red Onions, Hickory BBQ Sauce, Mozzarella',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('699.00'),
                'image_url': 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': False,
                'badge': 'Top Rated',
                'prices': {
                    'Small': Decimal('699.00'),
                    'Medium': Decimal('1249.00'),
                    'Large': Decimal('1799.00'),
                    'Extra Large': Decimal('2349.00')
                }
            },
            {
                'name': 'Fiery Peri-Peri Heat',
                'category': cat_map['Pizzas'],
                'description': 'Spicy marinated peri-peri chicken breast slices, fiery bird eye chillies, crisp capsicum and a swirl of house peri-peri drizzle.',
                'ingredients': 'Peri-Peri Chicken, Bird Eye Chillies, Capsicum, Mozzarella, Peri Mayo Swirl',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('649.00'),
                'image_url': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': False,
                'is_popular': True,
                'is_featured': False,
                'badge': 'Extra Spicy',
                'prices': {
                    'Small': Decimal('649.00'),
                    'Medium': Decimal('1199.00'),
                    'Large': Decimal('1749.00'),
                    'Extra Large': Decimal('2249.00')
                }
            },
            {
                'name': 'Margherita Classico',
                'category': cat_map['Pizzas'],
                'description': 'Traditional Italian masterpiece: slow-cooked San Marzano tomato marinara, fresh mozzarella, aromatic basil leaves and cold-pressed olive oil.',
                'ingredients': 'San Marzano Tomatoes, Fresh Mozzarella, Sweet Basil, Extra Virgin Olive Oil, Sea Salt',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('549.00'),
                'image_url': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': False,
                'is_popular': False,
                'is_featured': True,
                'badge': 'Authentic',
                'prices': {
                    'Small': Decimal('549.00'),
                    'Medium': Decimal('949.00'),
                    'Large': Decimal('1449.00'),
                    'Extra Large': Decimal('1899.00')
                }
            },
            {
                'name': 'Smash Beef Double Burger',
                'category': cat_map['Burgers'],
                'description': 'Two 100% prime beef patties smashed crispy, double American cheddar cheese, pickles, and our signature smoked secret sauce in a toasted brioche bun.',
                'ingredients': 'Prime Beef Patties, Cheddar, Brioche Bun, House Secret Sauce, Pickles',
                'allergens': 'Dairy, Gluten, Eggs',
                'starting_price': Decimal('799.00'),
                'image_url': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': True,
                'badge': 'Juicy Smash',
                'prices': {
                    'Single': Decimal('599.00'),
                    'Double': Decimal('799.00'),
                    'Combo Meal': Decimal('1099.00')
                }
            },
            {
                'name': 'Garlic Parmesan Breadsticks',
                'category': cat_map['Sides & Appetizers'],
                'description': 'Freshly baked artisan breadsticks slathered in warm garlic herb butter, dusted with aged parmesan and served with marinara dip.',
                'ingredients': 'Artisan Dough, Garlic Butter, Parmigiano Reggiano, Italian Herbs, Marinara Dip',
                'allergens': 'Dairy, Gluten',
                'starting_price': Decimal('399.00'),
                'image_url': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': False,
                'badge': 'Hot Side',
                'prices': {
                    'Regular': Decimal('399.00'),
                    'Large': Decimal('599.00')
                }
            },
            {
                'name': 'Belgian Chocolate Lava Melt',
                'category': cat_map['Desserts'],
                'description': 'Decadent warm Belgian chocolate sponge cake with an irresistible flowing molten chocolate center, dusted with snowy sugar.',
                'ingredients': 'Belgian Dark Chocolate, Butter, Cocoa, Vanilla Bean, Icing Sugar',
                'allergens': 'Dairy, Eggs, Gluten',
                'starting_price': Decimal('449.00'),
                'image_url': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
                'is_bestseller': True,
                'is_popular': True,
                'is_featured': True,
                'badge': 'Sweet Tooth',
                'prices': {
                    'Single': Decimal('449.00'),
                    'Double': Decimal('799.00')
                }
            }
        ]

        for p_data in products_data:
            prices = p_data.pop('prices')
            prod, _ = Product.objects.update_or_create(
                name=p_data['name'],
                defaults=p_data
            )
            for size_name, price in prices.items():
                ProductSizePrice.objects.update_or_create(
                    product=prod,
                    size_name=size_name,
                    defaults={'price': price, 'is_available': True}
                )

        # 5. Coupons
        coupons_data = [
            ('PIZZAFIRST', '20% off on your first order', 'percentage', Decimal('20.00'), Decimal('1000.00'), Decimal('500.00')),
            ('HUB250', 'Flat Rs. 250 Off on orders above Rs. 1500', 'fixed', Decimal('250.00'), Decimal('1500.00'), Decimal('250.00')),
            ('PARTY500', 'Flat Rs. 500 Off on orders above Rs. 3000', 'fixed', Decimal('500.00'), Decimal('3000.00'), Decimal('500.00')),
            ('CHEESY15', '15% discount for cheese lovers', 'percentage', Decimal('15.00'), Decimal('1200.00'), Decimal('400.00'))
        ]
        for code, desc, d_type, d_val, m_order, m_disc in coupons_data:
            Coupon.objects.update_or_create(
                code=code,
                defaults={
                    'description': desc,
                    'discount_type': d_type,
                    'discount_value': d_val,
                    'min_order_amount': m_order,
                    'max_discount': m_disc,
                    'expiry_date': timezone.now().date() + datetime.timedelta(days=365),
                    'is_active': True
                }
            )

        # 6. Customer Reviews
        reviews_data = [
            ('Hamza Tariq', 5, 'Best pizza in town! Ordered at 2:30 AM and got it piping hot in 28 minutes. The Pepperoni Feast is absolutely loaded!', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
            ('Ayesha Malik', 5, 'The crust quality is international level. Cheesy Fajita and Four Cheese Volcano are unmatched. Love the live tracking feature!', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'),
            ('Bilal Ahmed', 5, 'Finally a real 24/7 delivery pizza joint that does not compromise on quality. Breadsticks and dipping sauce are super addictive.', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'),
            ('Sara Khan', 5, 'The ordering process was so smooth on my phone, and WhatsApp confirmation reached me immediately. 10/10 service!', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80')
        ]
        for name, rating, comment, avatar in reviews_data:
            CustomerReview.objects.update_or_create(
                customer_name=name,
                defaults={'rating': rating, 'comment': comment, 'customer_avatar': avatar, 'is_approved': True}
            )

        self.stdout.write(self.style.SUCCESS("Pizza Hub database successfully seeded with initial commercial data!"))
