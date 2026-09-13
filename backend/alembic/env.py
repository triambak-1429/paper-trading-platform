import os
import sys

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv


# ---------------------------------------------------------
# Add backend directory to Python path
# ---------------------------------------------------------

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)


# ---------------------------------------------------------
# Load .env
# ---------------------------------------------------------

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)


# ---------------------------------------------------------
# Alembic configuration
# ---------------------------------------------------------

config = context.config


# ---------------------------------------------------------
# Get database URL from .env
# ---------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set in backend/.env"
    )


config.set_main_option(
    "sqlalchemy.url",
    DATABASE_URL.replace("%", "%%")
)


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ---------------------------------------------------------
# Import SQLAlchemy Base and models
# ---------------------------------------------------------

from app.database.connection import Base

from app.models.user import User
from app.models.stock import Stock
from app.models.holding import Holding
from app.models.transaction import Transaction
from app.models.watchlist import Watchlist


target_metadata = Base.metadata


# ---------------------------------------------------------
# Offline migrations
# ---------------------------------------------------------

def run_migrations_offline() -> None:

    url = config.get_main_option(
        "sqlalchemy.url"
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------
# Online migrations
# ---------------------------------------------------------

def run_migrations_online() -> None:

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {}
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():

            context.run_migrations()


# ---------------------------------------------------------
# Run
# ---------------------------------------------------------

if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()