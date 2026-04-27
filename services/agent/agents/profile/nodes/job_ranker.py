"""
Node: job_ranker

Fetches all jobs from DB, scores each against the skills profile → top 10.
Output: list of JobMatch { job_id, match_score, match_reasons, best_cv_id }
"""
