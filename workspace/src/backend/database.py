import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "db")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "calorie_tracker.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from .models import User
    from .services.auth import hash_password

    Base.metadata.create_all(bind=engine)

    # Database Schema Migrations
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            tables = inspector.get_table_names()

            # Ensure user_profiles has required columns
            if "user_profiles" in tables:
                cols = [c["name"] for c in inspector.get_columns("user_profiles")]
                if "user_id" not in cols:
                    conn.execute(text("ALTER TABLE user_profiles ADD COLUMN user_id INTEGER DEFAULT 1"))
                if "target_weight_kg" not in cols:
                    conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_weight_kg FLOAT DEFAULT 62.0"))
                if "target_body_fat_pct" not in cols:
                    conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_body_fat_pct FLOAT DEFAULT 18.0"))

            # Add user_id column to data tables if missing
            data_tables = ["food_logs", "custom_foods", "water_logs", "weight_logs", "recipes", "favorite_foods"]
            for tbl in data_tables:
                if tbl in tables:
                    cols = [c["name"] for c in inspector.get_columns(tbl)]
                    if "user_id" not in cols:
                        conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN user_id INTEGER DEFAULT 1"))

            conn.commit()
    except Exception as e:
        print(f"DB Migration exception: {e}")

    # Seed Default Master Admin Account (admin@nutriscan.app / admin123)
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.is_admin == True).first()
        if not admin_user:
            admin = User(
                email="admin@nutriscan.app",
                password_hash=hash_password("admin123"),
                name="Owner Admin",
                is_admin=True,
                is_premium=True
            )
            db.add(admin)
            db.commit()
            print("✅ Default Owner Admin initialized: admin@nutriscan.app / admin123")
    except Exception as e:
        print(f"Admin seeding exception: {e}")
    finally:
        db.close()
