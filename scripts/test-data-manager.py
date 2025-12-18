#!/usr/bin/env python3
"""
Test Data Management and Seeding System
Handles test data generation, management, and seeding for different environments
"""

import os
import sys
import json
import random
import string
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import argparse
import logging
import uuid
import faker
from dataclasses import dataclass, asdict
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class TestUser:
    """Test user data structure"""
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    password_hash: str
    is_active: bool
    created_at: str
    last_login: Optional[str]
    role: str

@dataclass
class TestProduct:
    """Test product data structure"""
    id: str
    name: str
    description: str
    price: float
    category: str
    sku: str
    stock_quantity: int
    is_active: bool
    created_at: str
    updated_at: str

@dataclass
class TestOrder:
    """Test order data structure"""
    id: str
    user_id: str
    status: str
    total_amount: float
    created_at: str
    updated_at: str
    items: List[Dict[str, Any]]

class TestDataGenerator:
    """Generates test data for different entities"""
    
    def __init__(self, environment: str = 'staging'):
        self.environment = environment
        self.fake = faker.Faker()
        self.fake.seed_instance(42)  # For reproducible data
        
        # Data size configuration based on environment
        self.data_sizes = {
            'development': {
                'users': 10,
                'products': 50,
                'orders': 100,
                'categories': 10
            },
            'staging': {
                'users': 100,
                'products': 500,
                'orders': 1000,
                'categories': 25
            },
            'production-mirror': {
                'users': 1000,
                'products': 5000,
                'orders': 10000,
                'categories': 50
            }
        }
        
        # Product categories for realistic data
        self.categories = [
            'Electronics', 'Clothing', 'Books', 'Home & Garden',
            'Sports', 'Toys', 'Automotive', 'Health & Beauty',
            'Food & Beverages', 'Office Supplies', 'Jewelry',
            'Art & Collectibles', 'Music', 'Software', 'Hardware'
        ]
        
        # Order statuses
        self.order_statuses = [
            'pending', 'processing', 'shipped', 'delivered',
            'cancelled', 'refunded', 'returned'
        ]
        
        # User roles
        self.user_roles = [
            'customer', 'premium_customer', 'admin', 'moderator', 'vendor'
        ]
    
    def get_data_size(self, entity_type: str) -> int:
        """Get the number of records to generate for an entity type"""
        return self.data_sizes.get(self.environment, {}).get(entity_type, 10)
    
    def generate_password_hash(self, password: str) -> str:
        """Generate a hash for a test password"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def generate_users(self, count: Optional[int] = None) -> List[TestUser]:
        """Generate test users"""
        if count is None:
            count = self.get_data_size('users')
        
        users = []
        used_emails = set()
        used_usernames = set()
        
        for _ in range(count):
            # Generate unique email and username
            email = self.fake.email()
            while email in used_emails:
                email = self.fake.email()
            used_emails.add(email)
            
            username = self.fake.user_name()
            while username in used_usernames:
                username = self.fake.user_name()
            used_usernames.add(username)
            
            first_name = self.fake.first_name()
            last_name = self.fake.last_name()
            
            # Generate realistic password
            password = f"TestPass{self.fake.random_int(min=100, max=999)}!"
            password_hash = self.generate_password_hash(password)
            
            # Random activation status (90% active)
            is_active = random.random() < 0.9
            
            # Random last login (70% have logged in)
            last_login = None
            if random.random() < 0.7:
                days_ago = random.randint(1, 30)
                last_login = (datetime.now() - timedelta(days=days_ago)).isoformat()
            
            # Random role
            role = random.choice(self.user_roles)
            
            user = TestUser(
                id=str(uuid.uuid4()),
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password_hash=password_hash,
                is_active=is_active,
                created_at=self.fake.date_time_between(start_date='-1y').isoformat(),
                last_login=last_login,
                role=role
            )
            
            users.append(user)
        
        return users
    
    def generate_products(self, count: Optional[int] = None) -> List[TestProduct]:
        """Generate test products"""
        if count is None:
            count = self.get_data_size('products')
        
        products = []
        used_skus = set()
        
        for _ in range(count):
            category = random.choice(self.categories)
            product_name = f"{category} {self.fake.word().title()}"
            
            # Generate unique SKU
            sku = f"{category[:3].upper()}-{self.fake.random_int(min=1000, max=9999)}"
            while sku in used_skus:
                sku = f"{category[:3].upper()}-{self.fake.random_int(min=1000, max=9999)}"
            used_skus.add(sku)
            
            # Generate realistic price
            if category in ['Electronics', 'Hardware']:
                price = round(random.uniform(50, 2000), 2)
            elif category in ['Clothing', 'Toys']:
                price = round(random.uniform(10, 200), 2)
            elif category in ['Books', 'Software']:
                price = round(random.uniform(5, 100), 2)
            else:
                price = round(random.uniform(15, 500), 2)
            
            # Random stock quantity
            stock_quantity = self.fake.random_int(min=0, max=1000)
            
            # Random activation status (85% active)
            is_active = random.random() < 0.85
            
            created_at = self.fake.date_time_between(start_date='-6m')
            updated_at = self.fake.date_time_between(start_date=created_at)
            
            product = TestProduct(
                id=str(uuid.uuid4()),
                name=product_name,
                description=self.fake.text(max_nb_chars=200),
                price=price,
                category=category,
                sku=sku,
                stock_quantity=stock_quantity,
                is_active=is_active,
                created_at=created_at.isoformat(),
                updated_at=updated_at.isoformat()
            )
            
            products.append(product)
        
        return products
    
    def generate_orders(self, users: List[TestUser], products: List[TestProduct], 
                       count: Optional[int] = None) -> List[TestOrder]:
        """Generate test orders"""
        if count is None:
            count = self.get_data_size('orders')
        
        orders = []
        
        for _ in range(count):
            # Select random user
            user = random.choice(users)
            
            # Generate order items
            item_count = self.fake.random_int(min=1, max=5)
            order_items = []
            total_amount = 0
            
            for _ in range(item_count):
                product = random.choice(products)
                quantity = self.fake.random_int(min=1, max=3)
                item_total = product.price * quantity
                total_amount += item_total
                
                order_items.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'quantity': quantity,
                    'unit_price': product.price,
                    'total_price': item_total
                })
            
            # Random status (weighted towards completed orders)
            if random.random() < 0.7:
                status = random.choice(['delivered', 'shipped'])
            else:
                status = random.choice(self.order_statuses)
            
            created_at = self.fake.date_time_between(start_date='-3m')
            updated_at = self.fake.date_time_between(start_date=created_at)
            
            order = TestOrder(
                id=str(uuid.uuid4()),
                user_id=user.id,
                status=status,
                total_amount=round(total_amount, 2),
                created_at=created_at.isoformat(),
                updated_at=updated_at.isoformat(),
                items=order_items
            )
            
            orders.append(order)
        
        return orders

class TestDataManager:
    """Manages test data storage and retrieval"""
    
    def __init__(self, data_dir: str = "test-data"):
        self.data_dir = Path(data_dir)
        self.fixtures_dir = self.data_dir / "fixtures"
        self.seeds_dir = self.data_dir / "seeds"
        self.baselines_dir = self.data_dir / "baselines"
        
        # Create directories
        for directory in [self.data_dir, self.fixtures_dir, self.seeds_dir, self.baselines_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def save_fixtures(self, environment: str, data: Dict[str, Any]):
        """Save generated data as JSON fixtures"""
        fixture_file = self.fixtures_dir / f"{environment}_fixtures.json"
        
        with open(fixture_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"Fixtures saved to {fixture_file}")
    
    def generate_sql_seeds(self, environment: str, data: Dict[str, Any]) -> str:
        """Generate SQL seed data"""
        sql_content = f"-- Test data seeds for {environment} environment\n"
        sql_content += f"-- Generated: {datetime.now().isoformat()}\n\n"
        
        # Generate user seeds
        if 'users' in data:
            sql_content += "-- Users table seeds\n"
            for user in data['users']:
                sql_content += f"""INSERT INTO users (id, username, email, first_name, last_name, password_hash, is_active, created_at, last_login, role) 
VALUES ('{user.id}', '{user.username}', '{user.email}', '{user.first_name}', '{user.last_name}', '{user.password_hash}', {user.is_active}, '{user.created_at}', {f"'{user.last_login}'" if user.last_login else 'NULL'}, '{user.role}');
"""
            sql_content += "\n"
        
        # Generate product seeds
        if 'products' in data:
            sql_content += "-- Products table seeds\n"
            for product in data['products']:
                sql_content += f"""INSERT INTO products (id, name, description, price, category, sku, stock_quantity, is_active, created_at, updated_at) 
VALUES ('{product.id}', '{product.name}', '{product.description}', {product.price}, '{product.category}', '{product.sku}', {product.stock_quantity}, {product.is_active}, '{product.created_at}', '{product.updated_at}');
"""
            sql_content += "\n"
        
        # Generate order seeds
        if 'orders' in data:
            sql_content += "-- Orders table seeds\n"
            for order in data['orders']:
                sql_content += f"""INSERT INTO orders (id, user_id, status, total_amount, created_at, updated_at) 
VALUES ('{order.id}', '{order.user_id}', '{order.status}', {order.total_amount}, '{order.created_at}', '{order.updated_at}');
"""
                
                # Generate order items
                for item in order.items:
                    sql_content += f"""INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) 
VALUES ('{order.id}', '{item['product_id']}', '{item['product_name']}', {item['quantity']}, {item['unit_price']}, {item['total_price']});
"""
            sql_content += "\n"
        
        # Save SQL seeds
        seeds_file = self.seeds_dir / f"{environment}_seed.sql"
        with open(seeds_file, 'w') as f:
            f.write(sql_content)
        
        logger.info(f"SQL seeds saved to {seeds_file}")
        return str(seeds_file)
    
    def create_performance_baseline(self, environment: str, metrics: Dict[str, Any]):
        """Create performance baseline data"""
        baseline_file = self.baselines_dir / f"{environment}_performance_baseline.json"
        
        baseline_data = {
            'environment': environment,
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'thresholds': {
                'response_time_ms': 1000,
                'throughput_rps': 100,
                'error_rate': 0.01,
                'cpu_usage': 80,
                'memory_usage': 85,
                'disk_usage': 90
            }
        }
        
        with open(baseline_file, 'w') as f:
            json.dump(baseline_data, f, indent=2)
        
        logger.info(f"Performance baseline saved to {baseline_file}")
    
    def load_fixtures(self, environment: str) -> Optional[Dict[str, Any]]:
        """Load existing fixtures for an environment"""
        fixture_file = self.fixtures_dir / f"{environment}_fixtures.json"
        
        if fixture_file.exists():
            with open(fixture_file, 'r') as f:
                return json.load(f)
        
        return None
    
    def generate_test_data(self, environment: str, force_regenerate: bool = False) -> Dict[str, Any]:
        """Generate complete test data for an environment"""
        logger.info(f"Generating test data for {environment} environment")
        
        # Check if existing fixtures should be used
        if not force_regenerate:
            existing_fixtures = self.load_fixtures(environment)
            if existing_fixtures:
                logger.info(f"Using existing fixtures for {environment}")
                return existing_fixtures
        
        # Generate new test data
        generator = TestDataGenerator(environment)
        
        # Generate all data types
        data = {
            'users': generator.generate_users(),
            'products': generator.generate_products(),
            'orders': []  # Will be generated after users and products
        }
        
        # Generate orders after users and products are created
        data['orders'] = generator.generate_orders(data['users'], data['products'])
        
        # Save fixtures
        self.save_fixtures(environment, data)
        
        # Generate SQL seeds
        sql_file = self.generate_sql_seeds(environment, data)
        
        # Create performance baseline
        baseline_metrics = self.generate_baseline_metrics(data)
        self.create_performance_baseline(environment, baseline_metrics)
        
        logger.info(f"Test data generation completed for {environment}")
        logger.info(f"  Users: {len(data['users'])}")
        logger.info(f"  Products: {len(data['products'])}")
        logger.info(f"  Orders: {len(data['orders'])}")
        logger.info(f"  SQL seeds: {sql_file}")
        
        return data
    
    def generate_baseline_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate baseline performance metrics"""
        users = data['users']
        products = data['products']
        orders = data['orders']
        
        # Calculate baseline metrics
        metrics = {
            'user_count': len(users),
            'product_count': len(products),
            'order_count': len(orders),
            'avg_order_value': sum(order.total_amount for order in orders) / len(orders) if orders else 0,
            'active_user_ratio': sum(1 for user in users if user.is_active) / len(users) if users else 0,
            'product_availability_ratio': sum(1 for product in products if product.is_active) / len(products) if products else 0,
            'order_status_distribution': {},
            'user_role_distribution': {},
            'product_category_distribution': {}
        }
        
        # Calculate distributions
        for order in orders:
            status = order.status
            metrics['order_status_distribution'][status] = metrics['order_status_distribution'].get(status, 0) + 1
        
        for user in users:
            role = user.role
            metrics['user_role_distribution'][role] = metrics['user_role_distribution'].get(role, 0) + 1
        
        for product in products:
            category = product.category
            metrics['product_category_distribution'][category] = metrics['product_category_distribution'].get(category, 0) + 1
        
        return metrics
    
    def clean_test_data(self, environment: str):
        """Clean test data files for an environment"""
        logger.info(f"Cleaning test data for {environment} environment")
        
        # Remove fixtures
        fixture_file = self.fixtures_dir / f"{environment}_fixtures.json"
        if fixture_file.exists():
            fixture_file.unlink()
            logger.info(f"Removed {fixture_file}")
        
        # Remove SQL seeds
        seeds_file = self.seeds_dir / f"{environment}_seed.sql"
        if seeds_file.exists():
            seeds_file.unlink()
            logger.info(f"Removed {seeds_file}")
        
        # Remove performance baseline
        baseline_file = self.baselines_dir / f"{environment}_performance_baseline.json"
        if baseline_file.exists():
            baseline_file.unlink()
            logger.info(f"Removed {baseline_file}")
    
    def list_environments(self) -> List[str]:
        """List available test environments"""
        environments = set()
        
        # Check fixtures directory
        for fixture_file in self.fixtures_dir.glob("*_fixtures.json"):
            env_name = fixture_file.stem.replace("_fixtures", "")
            environments.add(env_name)
        
        # Check seeds directory
        for seeds_file in self.seeds_dir.glob("*_seed.sql"):
            env_name = seeds_file.stem.replace("_seed", "")
            environments.add(env_name)
        
        # Check baselines directory
        for baseline_file in self.baselines_dir.glob("*_performance_baseline.json"):
            env_name = baseline_file.stem.replace("_performance_baseline", "")
            environments.add(env_name)
        
        return sorted(list(environments))

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Test Data Management System')
    parser.add_argument('--environment', '-e', default='staging',
                       choices=['development', 'staging', 'production-mirror'],
                       help='Target environment for test data')
    parser.add_argument('--action', '-a', default='generate',
                       choices=['generate', 'clean', 'list', 'baseline'],
                       help='Action to perform')
    parser.add_argument('--force', '-f', action='store_true',
                       help='Force regeneration of existing data')
    parser.add_argument('--data-dir', '-d', default='test-data',
                       help='Base directory for test data')
    parser.add_argument('--size', choices=['small', 'medium', 'large'],
                       help='Override data size for generation')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize data manager
    data_manager = TestDataManager(args.data_dir)
    
    try:
        if args.action == 'generate':
            # Override data size if specified
            if args.size:
                generator = TestDataGenerator(args.environment)
                generator.data_sizes[args.environment] = {
                    'users': {'small': 10, 'medium': 100, 'large': 1000}[args.size],
                    'products': {'small': 50, 'medium': 500, 'large': 5000}[args.size],
                    'orders': {'small': 100, 'medium': 1000, 'large': 10000}[args.size],
                    'categories': {'small': 10, 'medium': 25, 'large': 50}[args.size]
                }
            
            data_manager.generate_test_data(args.environment, args.force)
            
        elif args.action == 'clean':
            data_manager.clean_test_data(args.environment)
            
        elif args.action == 'list':
            environments = data_manager.list_environments()
            print("Available test environments:")
            for env in environments:
                print(f"  - {env}")
                
        elif args.action == 'baseline':
            # Generate performance baseline
            data = data_manager.generate_test_data(args.environment)
            baseline_metrics = data_manager.generate_baseline_metrics(data)
            data_manager.create_performance_baseline(args.environment, baseline_metrics)
            print("Performance baseline generated")
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Operation failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()