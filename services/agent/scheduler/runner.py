"""
Orchestrator — Runner.

For a given agent, fetches eligible users and kicks off a run per user.
Handles errors, logs what happened, knows when to stop.

Eligibility:
- Profile agent: users with at least one CV uploaded
- Email tracker: users who have connected Gmail (have a refresh token)
"""
