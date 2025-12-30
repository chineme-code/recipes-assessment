import re
from typing import Optional, Tuple

from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Recipe
from .schemas import RecipeOut

app = FastAPI(title="Recipes API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def parse_op_value(raw: str) -> Tuple[str, float]:
    """
    Accepts numeric expressions like:
      <=400, >=4.5, < 10, >2, =5, 5
    Defaults to '=' when no operator is provided.
    """
    raw = (raw or "").strip()
    m = re.match(r"^(<=|>=|<|>|=)?\s*([0-9]+(\.[0-9]+)?)$", raw)
    if not m:
        raise ValueError(
            f"Invalid filter format: {raw}. Use patterns like '<=400' or '>=4.5'."
        )
    op = m.group(1) or "="
    val = float(m.group(2))
    return op, val


def apply_numeric_filter(q, column, raw_value: str, cast_int: bool):
    try:
        op, val = parse_op_value(raw_value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if cast_int:
        val = int(val)

    if op == ">=":
        return q.filter(column >= val)
    if op == "<=":
        return q.filter(column <= val)
    if op == ">":
        return q.filter(column > val)
    if op == "<":
        return q.filter(column < val)
    return q.filter(column == val)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/api/recipes")
def get_recipes(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=200),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Recipe.id)).scalar() or 0
    offset = (page - 1) * limit

    rows = (
        db.query(Recipe)
        # Deterministic ordering => stable pagination even when ratings tie
        .order_by(desc(Recipe.rating).nullslast(), Recipe.id.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": [RecipeOut.model_validate(r).model_dump() for r in rows],
    }


@app.get("/api/recipes/search")
def search_recipes(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=15, le=50),
    calories: Optional[str] = None,
    title: Optional[str] = None,
    cuisine: Optional[str] = None,
    total_time: Optional[str] = None,
    rating: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Recipe)

    # Text filters (case-insensitive partial matches)
    if title:
        q = q.filter(Recipe.title.ilike(f"%{title}%"))

    if cuisine:
        q = q.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))

    # Numeric filters (supports <=, >=, <, >, =)
    if rating:
        q = apply_numeric_filter(q, Recipe.rating, rating, cast_int=False)

    if total_time:
        q = apply_numeric_filter(q, Recipe.total_time, total_time, cast_int=True)

    if calories:
        q = apply_numeric_filter(q, Recipe.calories_num, calories, cast_int=True)

    # Count AFTER filters, BEFORE pagination
    total = q.with_entities(func.count(Recipe.id)).scalar() or 0
    offset = (page - 1) * limit

    rows = (
        q.order_by(desc(Recipe.rating).nullslast(), Recipe.id.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": [RecipeOut.model_validate(r).model_dump() for r in rows],
    }