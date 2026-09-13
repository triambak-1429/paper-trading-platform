from app.database.connection import SessionLocal
from app.models.stock import Stock
from app.services.asset_catalog import ASSET_CATALOG


def seed_assets():

    db = SessionLocal()

    try:

        for asset_data in ASSET_CATALOG:

            existing = (
                db.query(Stock)
                .filter(
                    Stock.symbol == asset_data["symbol"]
                )
                .first()
            )

            if existing:
                continue

            asset = Stock(
                symbol=asset_data["symbol"],
                name=asset_data["name"],
                asset_type=asset_data["asset_type"],
                exchange=asset_data["exchange"],
                currency=asset_data["currency"],
                logo_url=asset_data["logo_url"],
                is_featured=asset_data["is_featured"]
            )

            db.add(asset)

        db.commit()

        print("Assets seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_assets()