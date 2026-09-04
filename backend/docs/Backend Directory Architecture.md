backend/
│
├── app/
│   │
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── database/
│   │   │   ├── session.py
│   │   │   ├── base.py
│   │   │   └── transaction.py
│   │   │
│   │   ├── security/
│   │   ├── exceptions/
│   │   ├── middleware/
│   │   ├── logging/
│   │   └── cache/
│   │
│   ├── domains/
│   │   ├── identity/
│   │   ├── churches/
│   │   ├── members/
│   │   ├── families/
│   │   ├── attendance/
│   │   ├── finance/
│   │   ├── pastoral_care/
│   │   ├── departments/
│   │   ├── groups/
│   │   ├── events/
│   │   ├── sunday_school/
│   │   ├── assets/
│   │   ├── communications/
│   │   ├── prayer_requests/
│   │   ├── files/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── audit/
│   │   └── settings/
│   │
│   ├── integrations/
│   │   ├── payments/
│   │   ├── email/
│   │   ├── sms/
│   │   ├── storage/
│   │   └── maps/
│   │
│   ├── jobs/
│   │   ├── worker.py
│   │   └── tasks/
│   │
│   └── shared/
│       ├── enums/
│       ├── types/
│       ├── pagination/
│       └── utils/
│
├── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
│
├── scripts/
├── docs/
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── alembic.ini
├── .env.example
└── CLAUDE.md