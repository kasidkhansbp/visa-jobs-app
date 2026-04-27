"""
Memory — DB Queries.

All DB reads and writes for the agent service.
No DB calls are scattered across nodes — everything goes through here.

Covers:
- Fetching eligible users per agent
- Reading user CVs and Gmail tokens
- Writing skills profiles, job matches, gap analysis
- Writing and updating application statuses
"""
