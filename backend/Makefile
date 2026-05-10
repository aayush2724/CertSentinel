.PHONY: migrate seed reset-db test test-fast

migrate:
	alembic upgrade head

seed:
	python seeds/seed_dev_data.py

reset-db:
	alembic downgrade base && alembic upgrade head && python seeds/seed_dev_data.py

test:
	pytest --cov=app --cov-report=term-missing

test-fast:
	pytest -x -q
