"""Transactional unit of work.

Financial operations must be atomic, and every sensitive mutation must write
its audit record inside the same transaction as the change it describes, so a
rollback discards both (``backend/AGENTS.md`` §10-§11). This context manager is
the single boundary that guarantees it.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession


@asynccontextmanager
async def transaction_scope(session: AsyncSession) -> AsyncGenerator[AsyncSession]:
    """Run a block inside a transaction, committing on success.

    Nests safely: if the session is already in a transaction, a SAVEPOINT is
    used so an inner failure does not abandon the outer unit of work.
    """
    if session.in_transaction():
        async with session.begin_nested():
            yield session
        return

    async with session.begin():
        yield session
