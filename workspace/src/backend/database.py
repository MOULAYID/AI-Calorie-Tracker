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
    Base.metadata.create_all(bind=engine)
    # Migration checks
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "user_profiles" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("user_profiles")]
                if "target_weight_kg" not in columns:
                    conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_weight_kg FLOAT DEFAULT 62.0"))
                    conn.commit()
                if "target_body_fat_pct" not in columns:
                    conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_body_fat_pct FLOAT DEFAULT 18.0"))
                    conn.commit()
    except Exception as e:
        print(f"DB Migration exception: {e}")
