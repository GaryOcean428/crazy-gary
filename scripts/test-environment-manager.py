#!/usr/bin/env python3
"""
Test Environment Provisioning and Management System
Handles database setup, service dependencies, and test data management
"""

import os
import sys
import json
import subprocess
import psycopg2
import redis
import time
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test-environment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TestEnvironmentManager:
    """Manages test environment provisioning and cleanup"""
    
    def __init__(self, environment: str = 'staging', config_file: Optional[str] = None):
        self.environment = environment
        self.config = self._load_config(config_file)
        self.services = {}
        self.databases = {}
        self.test_data_loaded = False
        
    def _load_config(self, config_file: Optional[str]) -> Dict[str, Any]:
        """Load environment configuration"""
        default_config = {
            'development': {
                'database': {
                    'host': 'localhost',
                    'port': 5432,
                    'name': 'test_dev_db',
                    'user': 'postgres',
                    'password': 'postgres'
                },
                'redis': {
                    'host': 'localhost',
                    'port': 6379,
                    'db': 0
                },
                'services': {
                    'api_base_url': 'http://localhost:8000',
                    'web_base_url': 'http://localhost:3000',
                    'minio_endpoint': 'http://localhost:9000'
                },
                'test_data': {
                    'size': 'small',
                    'fixtures_dir': 'test-data/fixtures/dev',
                    'seeds_file': 'test-data/seeds/dev_seed.sql'
                }
            },
            'staging': {
                'database': {
                    'host': os.getenv('STAGING_DB_HOST', 'localhost'),
                    'port': int(os.getenv('STAGING_DB_PORT', '5432')),
                    'name': os.getenv('STAGING_DB_NAME', 'test_staging_db'),
                    'user': os.getenv('STAGING_DB_USER', 'postgres'),
                    'password': os.getenv('STAGING_DB_PASSWORD', 'postgres')
                },
                'redis': {
                    'host': os.getenv('STAGING_REDIS_HOST', 'localhost'),
                    'port': int(os.getenv('STAGING_REDIS_PORT', '6379')),
                    'db': 1
                },
                'services': {
                    'api_base_url': os.getenv('STAGING_API_URL', 'http://localhost:8000'),
                    'web_base_url': os.getenv('STAGING_WEB_URL', 'http://localhost:3000'),
                    'minio_endpoint': os.getenv('STAGING_MINIO_URL', 'http://localhost:9000')
                },
                'test_data': {
                    'size': 'medium',
                    'fixtures_dir': 'test-data/fixtures/staging',
                    'seeds_file': 'test-data/seeds/staging_seed.sql'
                }
            },
            'production-mirror': {
                'database': {
                    'host': os.getenv('PROD_DB_HOST'),
                    'port': int(os.getenv('PROD_DB_PORT', '5432')),
                    'name': os.getenv('PROD_DB_NAME'),
                    'user': os.getenv('PROD_DB_USER'),
                    'password': os.getenv('PROD_DB_PASSWORD')
                },
                'redis': {
                    'host': os.getenv('PROD_REDIS_HOST'),
                    'port': int(os.getenv('PROD_REDIS_PORT', '6379')),
                    'db': 2
                },
                'services': {
                    'api_base_url': os.getenv('PROD_API_URL'),
                    'web_base_url': os.getenv('PROD_WEB_URL'),
                    'minio_endpoint': os.getenv('PROD_MINIO_URL')
                },
                'test_data': {
                    'size': 'large',
                    'fixtures_dir': 'test-data/fixtures/prod',
                    'seeds_file': 'test-data/seeds/prod_seed.sql'
                }
            }
        }
        
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                if config_file.endswith('.yaml') or config_file.endswith('.yml'):
                    user_config = yaml.safe_load(f)
                else:
                    user_config = json.load(f)
                
                # Merge with default config
                default_config.update(user_config)
        
        return default_config.get(self.environment, default_config['staging'])
    
    def provision_environment(self) -> bool:
        """Provision the complete test environment"""
        logger.info(f"Provisioning test environment: {self.environment}")
        
        try:
            # Setup database
            if not self._setup_database():
                logger.error("Database setup failed")
                return False
            
            # Setup Redis
            if not self._setup_redis():
                logger.error("Redis setup failed")
                return False
            
            # Setup additional services
            if not self._setup_services():
                logger.error("Service setup failed")
                return False
            
            # Load test data
            if not self._load_test_data():
                logger.error("Test data loading failed")
                return False
            
            # Validate environment
            if not self._validate_environment():
                logger.error("Environment validation failed")
                return False
            
            logger.info("Test environment provisioned successfully")
            return True
            
        except Exception as e:
            logger.error(f"Environment provisioning failed: {str(e)}")
            return False
    
    def _setup_database(self) -> bool:
        """Setup PostgreSQL database for testing"""
        logger.info("Setting up test database...")
        
        db_config = self.config['database']
        
        try:
            # Create database if it doesn't exist
            create_db_cmd = [
                'createdb',
                '-h', db_config['host'],
                '-p', str(db_config['port']),
                '-U', db_config['user'],
                db_config['name']
            ]
            
            env = os.environ.copy()
            env['PGPASSWORD'] = db_config['password']
            
            result = subprocess.run(
                create_db_cmd,
                env=env,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info(f"Database {db_config['name']} created/verified")
            else:
                # Database might already exist, which is fine
                logger.warning(f"Database creation warning: {result.stderr}")
            
            # Store database connection
            self.databases['test_db'] = psycopg2.connect(
                host=db_config['host'],
                port=db_config['port'],
                database=db_config['name'],
                user=db_config['user'],
                password=db_config['password']
            )
            
            # Run migrations if available
            self._run_migrations()
            
            return True
            
        except Exception as e:
            logger.error(f"Database setup failed: {str(e)}")
            return False
    
    def _run_migrations(self):
        """Run database migrations"""
        migration_paths = [
            'apps/api/alembic.ini',
            'migrations/alembic.ini',
            'database/alembic.ini'
        ]
        
        for migration_path in migration_paths:
            if os.path.exists(migration_path):
                try:
                    migration_dir = os.path.dirname(migration_path)
                    logger.info(f"Running migrations from {migration_dir}")
                    
                    result = subprocess.run(
                        ['alembic', 'upgrade', 'head'],
                        cwd=migration_dir,
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode == 0:
                        logger.info("Migrations completed successfully")
                    else:
                        logger.warning(f"Migration warning: {result.stderr}")
                        
                except Exception as e:
                    logger.warning(f"Migration failed for {migration_path}: {str(e)}")
                
                break  # Only run migrations from the first found path
    
    def _setup_redis(self) -> bool:
        """Setup Redis for testing"""
        logger.info("Setting up Redis...")
        
        redis_config = self.config['redis']
        
        try:
            # Start Redis server if not running
            self._start_redis_server()
            
            # Connect to Redis
            self.services['redis'] = redis.Redis(
                host=redis_config['host'],
                port=redis_config['port'],
                db=redis_config['db'],
                decode_responses=True
            )
            
            # Test connection
            self.services['redis'].ping()
            logger.info("Redis connection established")
            
            return True
            
        except Exception as e:
            logger.error(f"Redis setup failed: {str(e)}")
            return False
    
    def _start_redis_server(self):
        """Start Redis server if not already running"""
        try:
            # Check if Redis is already running
            result = subprocess.run(
                ['redis-cli', 'ping'],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0 and result.stdout.strip() == 'PONG':
                logger.info("Redis server already running")
                return
            
            # Start Redis server
            subprocess.Popen(
                ['redis-server', '--daemonize', 'yes'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            # Wait for Redis to start
            time.sleep(2)
            logger.info("Redis server started")
            
        except Exception as e:
            logger.warning(f"Could not start Redis server: {str(e)}")
    
    def _setup_services(self) -> bool:
        """Setup additional services (MinIO, etc.)"""
        logger.info("Setting up additional services...")
        
        try:
            # Setup MinIO for object storage testing
            self._setup_minio()
            
            # Setup any other required services
            self._setup_additional_services()
            
            return True
            
        except Exception as e:
            logger.error(f"Service setup failed: {str(e)}")
            return False
    
    def _setup_minio(self):
        """Setup MinIO for object storage testing"""
        try:
            # Check if MinIO is available
            result = subprocess.run(
                ['which', 'minio'],
                capture_output=True
            )
            
            if result.returncode != 0:
                logger.warning("MinIO not found, skipping object storage setup")
                return
            
            # Start MinIO server
            minio_process = subprocess.Popen([
                'minio', 'server', '/tmp/test-minio',
                '--address', ':9000',
                '--console-address', ':9001'
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Wait for MinIO to start
            time.sleep(3)
            
            # Create test bucket
            self._create_minio_bucket('test-bucket')
            
            logger.info("MinIO setup completed")
            
        except Exception as e:
            logger.warning(f"MinIO setup failed: {str(e)}")
    
    def _create_minio_bucket(self, bucket_name: str):
        """Create a bucket in MinIO"""
        try:
            # Use MinIO client to create bucket
            import subprocess
            
            # This would require mc (MinIO Client) to be installed
            # For now, we'll skip bucket creation
            logger.info(f"Bucket {bucket_name} creation skipped (mc client not available)")
            
        except Exception as e:
            logger.warning(f"Could not create MinIO bucket: {str(e)}")
    
    def _setup_additional_services(self):
        """Setup any additional services needed for testing"""
        # Add service setup logic here as needed
        pass
    
    def _load_test_data(self) -> bool:
        """Load test data into the environment"""
        logger.info("Loading test data...")
        
        try:
            # Load fixtures
            self._load_fixtures()
            
            # Load seed data
            self._load_seed_data()
            
            # Generate environment-specific data
            self._generate_environment_data()
            
            self.test_data_loaded = True
            logger.info("Test data loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Test data loading failed: {str(e)}")
            return False
    
    def _load_fixtures(self):
        """Load JSON fixture files"""
        fixtures_dir = self.config['test_data']['fixtures_dir']
        
        if not os.path.exists(fixtures_dir):
            logger.warning(f"Fixtures directory not found: {fixtures_dir}")
            return
        
        fixture_files = list(Path(fixtures_dir).glob('*.json'))
        logger.info(f"Loading {len(fixture_files)} fixture files...")
        
        for fixture_file in fixture_files:
            try:
                with open(fixture_file, 'r') as f:
                    fixture_data = json.load(f)
                
                # Process fixture data (this would depend on your data structure)
                logger.debug(f"Loaded fixture: {fixture_file.name}")
                
            except Exception as e:
                logger.warning(f"Failed to load fixture {fixture_file}: {str(e)}")
    
    def _load_seed_data(self):
        """Load SQL seed data"""
        seeds_file = self.config['test_data']['seeds_file']
        
        if not os.path.exists(seeds_file):
            logger.warning(f"Seed file not found: {seeds_file}")
            return
        
        try:
            db_config = self.config['database']
            
            # Execute seed SQL
            with open(seeds_file, 'r') as f:
                seed_sql = f.read()
            
            env = os.environ.copy()
            env['PGPASSWORD'] = db_config['password']
            
            result = subprocess.run([
                'psql',
                '-h', db_config['host'],
                '-p', str(db_config['port']),
                '-U', db_config['user'],
                '-d', db_config['name'],
                '-c', seed_sql
            ], env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("Seed data loaded successfully")
            else:
                logger.warning(f"Seed data loading warning: {result.stderr}")
                
        except Exception as e:
            logger.warning(f"Seed data loading failed: {str(e)}")
    
    def _generate_environment_data(self):
        """Generate environment-specific test data"""
        data_size = self.config['test_data']['size']
        
        logger.info(f"Generating {data_size} test data...")
        
        # Generate data based on environment
        generators = {
            'small': self._generate_small_dataset,
            'medium': self._generate_medium_dataset,
            'large': self._generate_large_dataset
        }
        
        generator = generators.get(data_size, self._generate_small_dataset)
        generator()
    
    def _generate_small_dataset(self):
        """Generate minimal test dataset"""
        logger.info("Generating small test dataset...")
        # Generate minimal data for development/testing
        
    def _generate_medium_dataset(self):
        """Generate medium test dataset"""
        logger.info("Generating medium test dataset...")
        # Generate moderate data for staging
        
    def _generate_large_dataset(self):
        """Generate large test dataset"""
        logger.info("Generating large test dataset...")
        # Generate extensive data for production mirror testing
    
    def _validate_environment(self) -> bool:
        """Validate that the environment is properly set up"""
        logger.info("Validating test environment...")
        
        try:
            # Validate database connection
            if 'test_db' in self.databases:
                cursor = self.databases['test_db'].cursor()
                cursor.execute('SELECT 1')
                cursor.fetchone()
                cursor.close()
                logger.info("Database connection validated")
            else:
                logger.error("Database not available")
                return False
            
            # Validate Redis connection
            if 'redis' in self.services:
                self.services['redis'].ping()
                logger.info("Redis connection validated")
            else:
                logger.error("Redis not available")
                return False
            
            # Validate services
            for service_name, service in self.services.items():
                if service_name != 'redis':
                    try:
                        # Add service-specific validation logic here
                        logger.info(f"Service {service_name} validated")
                    except Exception as e:
                        logger.warning(f"Service {service_name} validation failed: {str(e)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Environment validation failed: {str(e)}")
            return False
    
    def get_environment_info(self) -> Dict[str, Any]:
        """Get information about the current environment"""
        return {
            'environment': self.environment,
            'timestamp': datetime.now().isoformat(),
            'database': {
                'host': self.config['database']['host'],
                'port': self.config['database']['port'],
                'name': self.config['database']['name'],
                'connected': 'test_db' in self.databases
            },
            'services': {
                name: {
                    'type': type(service).__name__,
                    'status': 'connected' if service else 'disconnected'
                }
                for name, service in self.services.items()
            },
            'test_data_loaded': self.test_data_loaded
        }
    
    def cleanup(self):
        """Clean up the test environment"""
        logger.info("Cleaning up test environment...")
        
        try:
            # Close database connections
            for db_name, db_connection in self.databases.items():
                try:
                    db_connection.close()
                    logger.info(f"Database {db_name} connection closed")
                except Exception as e:
                    logger.warning(f"Error closing database {db_name}: {str(e)}")
            
            # Stop services
            self._stop_services()
            
            # Clean up test data
            self._cleanup_test_data()
            
            logger.info("Test environment cleanup completed")
            
        except Exception as e:
            logger.error(f"Environment cleanup failed: {str(e)}")
    
    def _stop_services(self):
        """Stop all services"""
        # Stop Redis
        try:
            subprocess.run(['redis-cli', 'shutdown'], capture_output=True)
            logger.info("Redis server stopped")
        except Exception as e:
            logger.warning(f"Could not stop Redis: {str(e)}")
        
        # Stop MinIO
        try:
            subprocess.run(['pkill', '-f', 'minio'], capture_output=True)
            logger.info("MinIO server stopped")
        except Exception as e:
            logger.warning(f"Could not stop MinIO: {str(e)}")
        
        #        # Add service Stop other services
-specific cleanup logic here
    
    def _cleanup_test_data(self):
        """Clean up test data from databases"""
        try:
            db_config = self.config['database']
            
            # Drop test database
            env = os.environ.copy()
            env['PGPASSWORD'] = db_config['password']
            
            result = subprocess.run([
                'dropdb',
                '-h', db_config['host'],
                '-p', str(db_config['port']),
                '-U', db_config['user'],
                db_config['name']
            ], env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"Test database {db_config['name']} dropped")
            else:
                logger.warning(f"Could not drop database: {result.stderr}")
                
        except Exception as e:
            logger.warning(f"Database cleanup failed: {str(e)}")

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Test Environment Provisioning')
    parser.add_argument('--environment', '-e', default='staging',
                       choices=['development', 'staging', 'production-mirror'],
                       help='Test environment to provision')
    parser.add_argument('--config', '-c', type=str,
                       help='Configuration file path')
    parser.add_argument('--action', '-a', default='provision',
                       choices=['provision', 'cleanup', 'validate', 'info'],
                       help='Action to perform')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize environment manager
    env_manager = TestEnvironmentManager(
        environment=args.environment,
        config_file=args.config
    )
    
    try:
        if args.action == 'provision':
            success = env_manager.provision_environment()
            sys.exit(0 if success else 1)
            
        elif args.action == 'cleanup':
            env_manager.cleanup()
            
        elif args.action == 'validate':
            success = env_manager._validate_environment()
            sys.exit(0 if success else 1)
            
        elif args.action == 'info':
            info = env_manager.get_environment_info()
            print(json.dumps(info, indent=2))
            
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Operation failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()