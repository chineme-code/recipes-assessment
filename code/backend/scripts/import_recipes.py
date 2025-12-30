import json
import math
import re
from pathlib import Path

from app.database import SessionLocal
from app.models import Recipe

NUM_FIELDS = ["rating", "prep_time", "cook_time", "total_time"]

def clean_number(value):
    # NaN/invalid -> None (SQL NULL), per requirement
    if value is None:
        return None

    if isinstance(value, str):
        v = value.strip()
        if v == "" or v.lower() in {"nan", "null"}:
            return None
        try:
            return float(v)
        except ValueError:
            return None

    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return value

    return None

def parse_calories_num(nutrients):
    # calories often like "389 kcal" -> 389
    if not isinstance(nutrients, dict):
        return None
    cals = nutrients.get("calories")
    if cals is None:
        return None
    if isinstance(cals, (int, float)):
        return int(cals)
    if isinstance(cals, str):
        m = re.search(r"(\d+)", cals)
        return int(m.group(1)) if m else None
    return None

def main():
    json_path = Path("data/US_recipes_null.Pdf.json")
    if not json_path.exists():
        raise FileNotFoundError(f"Dataset not found: {json_path.resolve()}")

    with json_path.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    # Your dataset is dict-like keyed by numeric strings
    recipes = list(raw.values()) if isinstance(raw, dict) else raw
    if not isinstance(recipes, list):
        raise ValueError("Expected list of recipe objects after normalization")

    db = SessionLocal()
    try:
        inserted = 0
        for r in recipes:
            if not isinstance(r, dict):
                continue

            cleaned = {k: clean_number(r.get(k)) for k in NUM_FIELDS}

            recipe = Recipe(
                cuisine=r.get("cuisine"),
                title=r.get("title"),
                rating=float(cleaned["rating"]) if cleaned["rating"] is not None else None,
                prep_time=int(cleaned["prep_time"]) if cleaned["prep_time"] is not None else None,
                cook_time=int(cleaned["cook_time"]) if cleaned["cook_time"] is not None else None,
                total_time=int(cleaned["total_time"]) if cleaned["total_time"] is not None else None,
                description=r.get("description"),
                nutrients=r.get("nutrients"),
                serves=r.get("serves"),
                calories_num=parse_calories_num(r.get("nutrients")),
            )
            db.add(recipe)
            inserted += 1

        db.commit()
        print(f"Imported {inserted} recipes.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
