"""
Database Migration Script
Handles schema updates for existing databases
"""
import os
from sqlalchemy import text
from src.models.user import db
import logging

logger = logging.getLogger(__name__)

def migrate_user_table():
    """Add missing columns to the user table"""
    try:
        # Check if we're using PostgreSQL or SQLite
        database_url = os.getenv('DATABASE_URL', '')
        is_postgres = database_url.startswith('postgresql')
        
        migrations = []
        
        if is_postgres:
            # PostgreSQL migrations
            migrations = [
                "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);",
                "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);", 
                "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"
            ]
        else:
            # SQLite migrations (for local development)
            migrations = [
                "ALTER TABLE user ADD COLUMN full_name VARCHAR(200);",
                "ALTER TABLE user ADD COLUMN password_hash VARCHAR(255);",
                "ALTER TABLE user ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE user ADD COLUMN is_active BOOLEAN DEFAULT 1;"
            ]
        
        # Execute migrations
        for migration in migrations:
            try:
                db.session.execute(text(migration))
                logger.info(f"✅ Migration executed: {migration}")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    logger.info(f"⚠️ Column already exists: {migration}")
                else:
                    logger.warning(f"⚠️ Migration failed (might be expected): {migration} - {e}")
        
        db.session.commit()
        logger.info("✅ User table migration completed successfully")
        return True
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"❌ User table migration failed: {e}")
        return False

def run_all_migrations():
    """Run all database migrations"""
    logger.info("🔄 Starting database migrations...")
    
    success = migrate_user_table()
    
    if success:
        logger.info("✅ All migrations completed successfully")
    else:
        logger.error("❌ Some migrations failed")
    
    return success

