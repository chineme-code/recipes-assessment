from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    cuisine = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)

    rating = Column(Float, nullable=True)
    prep_time = Column(Integer, nullable=True)
    cook_time = Column(Integer, nullable=True)
    total_time = Column(Integer, nullable=True)

    description = Column(Text, nullable=True)
    nutrients = Column(JSONB, nullable=True)
    serves = Column(String(50), nullable=True)

    calories_num = Column(Integer, nullable=True)
